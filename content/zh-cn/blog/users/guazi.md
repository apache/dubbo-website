---
title: "瓜子二手车 Dubbo 实践"
linkTitle: "瓜子二手车"
tags: ["用户案例"]
date: 2023-01-15
weight: 4
---

## 前言

&emsp;&emsp;随着瓜子业务的不断发展，系统规模在逐渐扩大，目前在瓜子的私有云上已经运行着数百个dubbo应用，上千个dubbo实例。瓜子各部门业务迅速发展，版本没有来得及统一，各个部门都有自己的用法。随着第二机房的建设，dubbo版本统一的需求变得越发迫切。几个月前，公司发生了一次与dubbo相关的生产事故，成为了公司dubbo版本升级的诱因。

&emsp;&emsp;接下来，我会从这次事故开始，讲讲我们这段时间所做的dubbo版本升级的历程以及dubbo后续多机房的方案。

## 一、Ephermal节点未及时删除导致provider不能恢复注册的问题修复

### 事故背景

&emsp;&emsp;在生产环境，瓜子内部各业务线共用一套zookeeper集群作为dubbo的注册中心。2019年9月份，机房的一台交换机发生故障，导致zookeeper集群出现了几分钟的网络波动。在zookeeper集群恢复后，正常情况下dubbo的provider应该会很快重新注册到zookeeper上，但有一小部分的provider很长一段时间没有重新注册到zookeeper上，直到手动重启应用后才恢复注册。

### 排查过程

&emsp;&emsp;首先，我们统计了出现这种现象的dubbo服务的版本分布情况，发现在大多数的dubbo版本中都存在这种问题，且发生问题的服务比例相对较低，在github中我们也未找到相关问题的issues。因此，推断这是一个尚未修复的且在网络波动情况的场景下偶现的问题。

&emsp;&emsp;接着，我们便将出现问题的应用日志、zookeeper日志与dubbo代码逻辑进行相互印证。在应用日志中，应用重连zookeeper成功后provider立刻进行了重新注册，之后便没有任何日志打印。而在zookeeper日志中，注册节点被删除后，并没有重新创建注册节点。对应到dubbo的代码中，只有在`FailbackRegistry.register(url)`的`doRegister(url)`执行成功或线程被挂起的情况下，才能与日志中的情况相吻合。

```java
    public void register(URL url) {
        super.register(url);
        failedRegistered.remove(url);
        failedUnregistered.remove(url);
        try {
            // Sending a registration request to the server side
            doRegister(url);
        } catch (Exception e) {
            Throwable t = e;

            // If the startup detection is opened, the Exception is thrown directly.
            boolean check = getUrl().getParameter(Constants.CHECK_KEY, true)
                    && url.getParameter(Constants.CHECK_KEY, true)
                    && !Constants.CONSUMER_PROTOCOL.equals(url.getProtocol());
            boolean skipFailback = t instanceof SkipFailbackWrapperException;
            if (check || skipFailback) {
                if (skipFailback) {
                    t = t.getCause();
                }
                throw new IllegalStateException("Failed to register " + url + " to registry " + getUrl().getAddress() + ", cause: " + t.getMessage(), t);
            } else {
                logger.error("Failed to register " + url + ", waiting for retry, cause: " + t.getMessage(), t);
            }

            // Record a failed registration request to a failed list, retry regularly
            failedRegistered.add(url);
        }
    }
```
&emsp;&emsp;在继续排查问题前，我们先普及下这些概念：dubbo默认使用curator作为zookeeper的客户端，curator与zookeeper是通过session维持连接的。当curator重连zookeeper时，若session未过期，则继续使用原session进行连接；若session已过期，则创建新session重新连接。而ephemeral节点与session是绑定的关系，在session过期后，会删除此session下的ephemeral节点。

&emsp;&emsp;继续对`doRegister(url)`的代码进行进一步排查，我们发现在`CuratorZookeeperClient.createEphemeral(path)`方法中有这么一段逻辑：在`createEphemeral(path)`捕获了`NodeExistsException`，创建ephemeral节点时，若此节点已存在，则认为ephemeral节点创建成功。这段逻辑初看起来并没有什么问题，且在以下两种常见的场景下表现正常：

1. Session未过期，创建Ephemeral节点时原节点仍存在,不需要重新创建
1. Session已过期，创建Ephemeral节点时原节点已被zookeeper删除，创建成功

```java
    public void createEphemeral(String path) {
        try {
            client.create().withMode(CreateMode.EPHEMERAL).forPath(path);
        } catch (NodeExistsException e) {
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage(), e);
        }
    }
```
&emsp;&emsp;但是实际上还有一种极端场景，**zookeeper的Session过期与删除Ephemeral节点不是原子性的**，也就是说客户端在得到Session过期的消息时，Session对应的Ephemeral节点可能还未被zookeeper删除。此时dubbo去创建Ephemeral节点,发现原节点仍存在，故不重新创建。待Ephemeral节点被zookeeper删除后，便会出现dubbo认为重新注册成功，但实际未成功的情况，也就是我们在生产环境遇到的问题。

&emsp;&emsp;此时，问题的根源已被定位。定位问题之后，我们与dubbo社区交流，发现考拉的同学也遇到过同样的问题，更确定了这个原因。

### 问题的复现与修复

&emsp;&emsp;定位到问题之后，我们便开始尝试本地复现。由于zookeeper的Session过期但Ephemeral节点未被删除的场景直接模拟比较困难，我们通过修改zookeeper源码，在Session过期与删除Ephemeral节点的逻辑中增加了一段休眠时间，间接模拟出这种极端场景，并在本地复现了此问题。

&emsp;&emsp;在排查问题的过程中，我们发现kafka的旧版本在使用zookeeper时也遇到过类似的问题，并参考kafka关于此问题的修复方案，确定了dubbo的修复方案。在创建Ephemeral节点捕获到`NodeExistsException`时进行判断，若Ephemeral节点的SessionId与当前客户端的SessionId不同，则删除并重建Ephemeral节点。在内部修复并验证通过后，我们向社区提交了issues及pr。

&emsp;&emsp;kafka类似问题issues：https://issues.apache.org/jira/browse/KAFKA-1387

&emsp;&emsp;dubbo注册恢复问题issues：https://github.com/apache/dubbo/issues/5125

## 二、瓜子的dubbo升级历程

&emsp;&emsp;上文中的问题修复方案已经确定，但我们显然不可能在每一个dubbo版本上都进行修复。在咨询了社区dubbo的推荐版本后，我们决定在dubbo2.7.3版本的基础上，开发内部版本修复来这个问题。并借这个机会，开始推动公司dubbo版本的统一升级工作。

### 为什么要统一dubbo版本
1. 统一dubbo版本后，我们可以在此版本上内部紧急修复一些dubbo问题（如上文的dubbo注册故障恢复失效问题）。
2. 瓜子目前正在进行第二机房的建设，部分dubbo服务也在逐渐往第二机房迁移。统一dubbo版本，也是为dubbo的多机房做铺垫。
3. 有利于我们后续对dubbo服务的统一管控。
4. dubbo社区目前的发展方向与我们公司现阶段对dubbo的一些诉求相吻合，如支持gRPC、云原生等。

### 为什么选择dubbo2.7.3
1. 在我们之前，携程与dubbo社区合作进行了携程dubbo内部版本的升级，并在社区2.7.3版本上修复了很多兼容性问题。感谢携程的同学帮我们踩坑～
2. dubbo2.7.3版本在当时虽然是最新的版本，但已经发布了2个月的时间，从社区issues反馈来看，dubbo2.7.3相对dubbo2.7之前的几个版本，在兼容性方面要好很多。
3. 我们也咨询了dubbo社区的同学，推荐升级版本为2.7.3。

### 内部版本定位

&emsp;&emsp;基于社区dubbo2.7.3版本开发的dubbo内部版本属于过渡性质的版本，目的是为了修复线上provider不能恢复注册的问题，以及一些社区dubbo2.7.3的兼容性问题。瓜子的dubbo最终还是要跟随社区的版本，而不是开发自已的内部功能。因此我们在dubbo内部版本中修复的所有问题均与社区保持了同步，以保证后续可以兼容升级到社区dubbo的更高版本。

### 兼容性验证与升级过程

&emsp;&emsp;我们在向dubbo社区的同学咨询了版本升级方面的相关经验后，于9月下旬开始了dubbo版本的升级工作。
1. **初步兼容性验证**
首先,我们梳理了一些需要验证的兼容性case，针对公司内部使用较多的dubbo版本，与dubbo2.7.3一一进行了兼容性验证。经验证，除dubboX外，dubbo2.7.3与其他dubbo版本均兼容。dubboX由于对dubbo协议进行了更改，与dubbo2.7.3不兼容。
1. **生产环境兼容性验证**
在初步验证兼容性通过后，我们与业务线合作，挑选了一些重要程度较低的项目，在生产环境对dubbo2.7.3与其他版本的兼容性进行了进一步验证。并在内部版本修复了一些兼容性问题。
1. **推动公司dubbo版本升级**
在10月初，完成了dubbo兼容性验证后，我们开始在各个业务线推动dubbo的升级工作。截止到12月初,已经有30%的dubbo服务的完成了版本升级。按照排期，预计于2020年3月底前完成公司dubbo版本的统一升级。

### 兼容性问题汇总

&emsp;&emsp;在推动升级dubbo2.7.3版本的过程整体上比较顺利,当然也遇到了一些兼容性问题：
* **创建zookeeper节点时提示没有权限**
    dubbo配置文件中已经配置了zookeeper的用户名密码，但在创建zookeeper节点时却抛出`KeeperErrorCode = NoAuth`的异常，这种情况分别对应两个兼容性问题：
    * issues:https://github.com/apache/dubbo/issues/5076
        dubbo在未配置配置中心时，默认使用注册中心作为配置中心。通过注册中心的配置信息初始化配置中心配置时，由于遗漏了用户名密码，导致此问题。
    * issues:https://github.com/apache/dubbo/issues/4991
        dubbo在建立与zookeeper的连接时会根据zookeeper的address复用之前已建立的连接。当多个注册中心使用同一个address，但权限不同时，就会出现`NoAuth`的问题。
    参考社区的pr，我们在内部版本进行了修复。

* **curator版本兼容性问题**
    * dubbo2.7.3与低版本的curator不兼容，因此我们默认将curator版本升级至4.2.0
    ```xml
    <dependency>
        <groupId>org.apache.curator</groupId>
        <artifactId>curator-framework</artifactId>
        <version>4.2.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.curator</groupId>
        <artifactId>curator-recipes</artifactId>
        <version>4.2.0</version>
    </dependency>
    ```
    * 分布式调度框架elastic-job-lite强依赖低版本的curator,与dubbo2.7.3使用的curator版本不兼容,这给dubbo版本升级工作带来了一定阻塞。考虑到elastic-job-lite已经很久没有人进行维护，目前一些业务线计划将elastic-job-lite替换为其他的调度框架。
* **openFeign与dubbo兼容性问题**
    issues: https://github.com/apache/dubbo/issues/3990
    dubbo的ServiceBean监听spring的ContextRefreshedEvent,进行服务暴露。openFeign提前触发了ContextRefreshedEvent，此时ServiceBean还未完成初始化，于是就导致了应用启动异常。
    参考社区的pr，我们在内部版本修复了此问题。
* **RpcException兼容性问题**
    dubbo低版本consumer不能识别dubbo2.7版本provider抛出的`org.apache.dubbo.rpc.RpcException`。因此，在consumer全部升级到2.7之前，不建议将provider的`com.alibaba.dubbo.rpc.RpcException`改为`org.apache.dubbo.rpc.RpcException`
* **qos端口占用**
    dubbo2.7.3默认开启qos功能，导致一些混部在物理机的dubbo服务升级时出现qos端口占用问题。关闭qos功能后恢复。
* **自定义扩展兼容性问题**
    业务线对于dubbo的自定义扩展比较少，因此在自定义扩展的兼容性方面暂时还没有遇到比较难处理的问题，基本上都是变更package导致的问题，由业务线自行修复。
* **skywalking agent兼容性问题**
    我们项目中一般使用skywalking进行链路追踪，由于skywalking agent6.0的plugin不支持dubbo2.7，因此统一升级skywalking agent到6.1。

## 三、dubbo多机房方案

&emsp;&emsp;瓜子目前正在进行第二机房的建设工作，dubbo多机房是第二机房建设中比较重要的一个话题。在dubbo版本统一的前提下，我们就能够更顺利的开展dubbo多机房相关的调研与开发工作。

### 初步方案

&emsp;&emsp;我们咨询了dubbo社区的建议，并结合瓜子云平台的现状，初步确定了dubbo多机房的方案。
1. 在每个机房内，部署一套独立的zookeeper集群。集群间信息不同步。这样就没有了zookeeper集群跨机房延迟与数据不同步的问题。
1. dubbo服务注册时，仅注册到本机房的zookeeper集群；订阅时，同时订阅两个机房的zookeeper集群。
1. 实现同机房优先调用的路由逻辑。以减少跨机房调用导致的不必要网络延迟。

### 同机房优先调用

&emsp;&emsp;dubbo同机房优先调用的实现比较简单，相关逻辑如下：
1. 瓜子云平台默认将机房的标志信息注入容器的环境变量中。
1. provider暴露服务时，读取环境变量中的机房标志信息，追加到待暴露服务的url中。
1. consumer调用provider时，读取环境变量中的机房标志信息，根据路由策略优先调用具有相同标志信息的provider。

&emsp;&emsp;针对以上逻辑，我们简单实现了dubbo通过环境变量进行路由的功能，并向社区提交了pr。
&emsp;&emsp;dubbo通过环境变量路由pr: https://github.com/apache/dubbo/pull/5348
