---
description: "本文介绍了 Dubbo 应用级服务发现与接口级服务发现的详细设计与实现。"
linkTitle: 应用级vs接口级
title: 应用级服务发现 vs 接口级服务发现
type: docs
weight: 6
---

Dubbo3 目前支持接口级的服务发现

## 应用级服务发现

### 设计目标
* 显著降低服务发现过程的资源消耗，包括提升注册中心容量上限、降低消费端地址解析资源占用等，使得 Dubbo3 框架能够支持更大规模集群的服务治理，实现无限水平扩容。
* 适配底层基础设施服务发现模型，如 Kubernetes、Service Mesh 等。

### 对比接口级
![interface-arc](/imgs/blog/proposals/discovery/arc.png)

我们从 Dubbo 最经典的工作原理图说起，Dubbo 从设计之初就内置了服务地址发现的能力，Provider 注册地址到注册中心，Consumer 通过订阅实时获取注册中心的地址更新，在收到地址列表后，consumer 基于特定的负载均衡策略发起对 provider 的 RPC 调用。

在这个过程中：
* 每个 Provider 通过特定的 key 向注册中心注册本机可访问地址；
* 注册中心通过这个 key 对 provider 实例地址进行聚合；
* Consumer 通过同样的 key 从注册中心订阅，以便及时收到聚合后的地址列表；

![interface-data1](/imgs/blog/proposals/discovery/interface-data1.png)

这里，我们对接口级地址发现的内部数据结构进行详细分析。

首先，看右下角 provider 实例内部的数据与行为。Provider 部署的应用中通常会有多个 Service，也就是 Dubbo2 中的服务，每个 service 都可能会有其独有的配置，我们所讲的 service 服务发布的过程，其实就是基于这个服务配置生成地址 URL 的过程，生成的地址数据如图所示；同样的，其他服务也都会生成地址。

然后，看一下注册中心的地址数据存储结构，注册中心以 service 服务名为数据划分依据，将一个服务下的所有地址数据都作为子节点进行聚合，子节点的内容就是实际可访问的ip地址，也就是我们 Dubbo 中 URL，格式就是刚才 provider 实例生成的。

![interface-data2](/imgs/blog/proposals/discovery/interface-data2.png)

这里把 URL 地址数据划分成了几份：
* 首先是实例可访问地址，主要信息包含 ip port，是消费端将基于这条数据生成 tcp 网络链接，作为后续 RPC 数据的传输载体
* 其次是 RPC 元数据，元数据用于定义和描述一次 RPC 请求，一方面表明这条地址数据是与某条具体的 RPC 服务有关的，它的版本号、分组以及方法相关信息，另一方面表明
* 下一部分是 RPC 配置数据，部分配置用于控制 RPC 调用的行为，还有一部分配置用于同步 Provider 进程实例的状态，典型的如超时时间、数据编码的序列化方式等。
* 最后一部分是自定义的元数据，这部分内容区别于以上框架预定义的各项配置，给了用户更大的灵活性，用户可任意扩展并添加自定义元数据，以进一步丰富实例状态。

结合以上两页对于 Dubbo2 接口级地址模型的分析，以及最开始的 Dubbo 基本原理图，我们可以得出这么几条结论：
* 第一，地址发现聚合的 key 就是 RPC 粒度的服务
* 第二，注册中心同步的数据不止包含地址，还包含了各种元数据以及配置
* 得益于 1 与 2，Dubbo 实现了支持应用、RPC 服务、方法粒度的服务治理能力

这就是一直以来 Dubbo2 在易用性、服务治理功能性、可扩展性上强于很多服务框架的真正原因。

![interface-defect](/imgs/blog/proposals/discovery/interface-defect.png)

一个事物总是有其两面性，Dubbo2 地址模型带来易用性和强大功能的同时，也给整个架构的水平可扩展性带来了一些限制。这个问题在普通规模的微服务集群下是完全感知不到的，而随着集群规模的增长，当整个集群内应用、机器达到一定数量时，整个集群内的各个组件才开始遇到规模瓶颈。在总结包括阿里巴巴、工商银行等多个典型的用户在生产环境特点后，我们总结出以下两点突出问题（如图中红色所示）：
* 首先，注册中心集群容量达到上限阈值。由于所有的 URL 地址数据都被发送到注册中心，注册中心的存储容量达到上限，推送效率也随之下降。
* 而在消费端这一侧，Dubbo2 框架常驻内存已超 40%，每次地址推送带来的 cpu 等资源消耗率也非常高，影响正常的业务调用。

为什么会出现这个问题？我们以一个具体 provider 示例进行展开，来尝试说明为何应用在接口级地址模型下容易遇到容量问题。
青蓝色部分，假设这里有一个普通的 Dubbo Provider 应用，该应用内部定义有 10 个 RPC Service，应用被部署在 100 个机器实例上。这个应用在集群中产生的数据量将会是 “Service 数 * 机器实例数”，也就是 10 * 100 = 1000 条。数据被从两个维度放大：
* 从地址角度。100 条唯一的实例地址，被放大 10 倍
* 从服务角度。10 条唯一的服务元数据，被放大 100 倍

### 详细设计

![app-principle](/imgs/blog/proposals/discovery/app-principle.png)

面对这个问题，在 Dubbo3 架构下，我们不得不重新思考两个问题：
* 如何在保留易用性、功能性的同时，重新组织 URL 地址数据，避免冗余数据的出现，让 Dubbo3 能支撑更大规模集群水平扩容？
* 如何在地址发现层面与其他的微服务体系如 Kubernetes、Spring Cloud 打通？

![app-data1](/imgs/blog/proposals/discovery/app-data1.png)

Dubbo3 的应用级服务发现方案设计本质上就是围绕以上两个问题展开。其基本思路是：地址发现链路上的聚合元素也就是我们之前提到的 Key 由服务调整为应用，这也是其名称叫做应用级服务发现的由来；另外，通过注册中心同步的数据内容上做了大幅精简，只保留最核心的 ip、port 地址数据。

![app-data2](/imgs/blog/proposals/discovery/app-data2.png)

这是升级之后应用级地址发现的内部数据结构进行详细分析。
对比之前接口级的地址发现模型，我们主要关注橙色部分的变化。首先，在 provider 实例这一侧，相比于之前每个 RPC Service 注册一条地址数据，一个 provider 实例只会注册一条地址到注册中心；而在注册中心这一侧，地址以应用名为粒度做聚合，应用名节点下是精简过后的 provider 实例地址；

![app-metadataservice](/imgs/blog/proposals/discovery/app-metadataservice.png)

应用级服务发现的上述调整，同时实现了地址单条数据大小和总数量的下降，但同时也带来了新的挑战：我们之前 Dubbo2 强调的易用性和功能性的基础损失了，因为元数据的传输被精简掉了，如何精细的控制单个服务的行为变得无法实现。

针对这个问题，Dubbo3 的解法是引入一个内置的 MetadataService 元数据服务，由中心化推送转为 Consumer 到 Provider 的点对点拉取，在这个模式下，元数据传输的数据量将不在是一个问题，因此可以在元数据中扩展出更多的参数、暴露更多的治理数据。

![app-metadataservice](/imgs/blog/proposals/discovery/app-workflow.png)

这里我们个重点看消费端 Consumer 的地址订阅行为，消费端从分两步读取地址数据，首先是从注册中心收到精简后的地址，随后通过调用 MetadataService 元数据服务，读取对端的元数据信息。在收到这两部分数据之后，消费端会完成地址数据的聚合，最终在运行态还原出类似 Dubbo2 的 URL 地址格式。因此从最终结果而言，应用级地址模型同时兼顾了地址传输层面的性能与运行层面的功能性。

以上就是的应用级服务发现背景、工作原理部分的所有内容。


## 接口级服务发现

接口级服务发现在 Dubbo3 实现中被继续保留了下来，并且继续作为框架默认的服务发现模型，这主要是考虑对于老版本的兼容性。在未来版本中，我们会将默认模型切换为应用级别服务发现。

{{% alert title="解决接口级服务发现性能问题" color="info" %}}
如果您的集群规模足够大，已经遇到了接口级服务发现中的性能瓶颈问题，并且您暂时无法切换到应用级服务发现。可以暂时通过简化 URL 参数达到性能优化的目的。
{{% /alert %}}

### URL参数简化
**设计目标与宗旨：**
1. 期望简化进入注册中心的 provider 和 consumer 配置数量。
2. 期望将部分配置项以其他形式存储。这些配置项需要满足：不在服务调用链路上，同时这些配置项不在注册中心的核心链路上(服务查询，服务列表)。

Dubbo provider 中的服务配置项有接近 [30 个配置项](/zh-cn/docs/references/xml/dubbo-parameter)。 排除注册中心服务治理需要之外，很大一部分配置项是 provider 自己使用，不需要透传给消费者。这部分数据不需要进入注册中心，而只需要以 key-value 形式持久化存储。

Dubbo consumer 中的配置项也有 [20+个配置项](/zh-cn/docs/references/xml/dubbo-consumer)。在注册中心之中，服务消费者列表中只需要关注 application，version，group，ip，dubbo 版本等少量配置，其他配置也可以以 key-value 形式持久化存储。
这些数据是以服务为维度注册进入注册中心，导致了数据量的膨胀，进而引发注册中心 (如 zookeeper) 的网络开销增大，性能降低。

{{% alert title="注意" color="warning" %}}
简化注册中心的配置，只在 2.7 之后的版本中进行支持。
{{% /alert %}}

以下是开启 provider 或者 consumer 简化配置之后，URL 中默认保留的配置项：

**provider 侧：**

| 源码静态变量  | URL Key           | 说明 |
| ------ |---------------| ------ |
| APPLICATION_KEY | application   |  |
| CODEC_KEY | codec         |  |
| EXCHANGER_KEY | exchanger     |   |
| SERIALIZATION_KEY | serialization |   |
| CLUSTER_KEY | cluster       |  |
| CONNECTIONS_KEY | connections   |   |
| DEPRECATED_KEY | deprecated    |  |
| GROUP_KEY | group         |   |
| LOADBALANCE_KEY | loadbalance   |  |
| MOCK_KEY | mock          |  |
| PATH_KEY | path          |  |
| TIMEOUT_KEY | timeout       |  |
| TOKEN_KEY | token         |  |
| VERSION_KEY | version       |  |
| WARMUP_KEY | warmup        |  |
| WEIGHT_KEY | weight        |  |
| DUBBO_VERSION_KEY | dubbo         |  |
| RELEASE_KEY | release       |  |
| SIDE_KEY | side          |  |


**consumer 侧：**

| 源码静态变量  | URL Key  | 说明 |
| ------ | ------ | ------ |
| APPLICATION_KEY | application |  |
| VERSION_KEY |  version |  |
| GROUP_KEY | group |  |
| DUBBO_VERSION_KEY | dubbo |  |

下面我们通过示例介绍如何开启 URL 简化模式使，所有内容都可以 [在 sample 中查看源码](https://github.com/dubbo/dubbo-samples/tree/master)。

#### 如何开启URL精简（示例使用方式）

我们接下来从没开启 URL 精简的示例开始，分别对比开启 URL 精简的 Provider 和开启 URL 精简的 Consumer

##### 未开启 URL 精简的示例

工程源码 [dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-nosimple](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-nosimple)。注意，跑 sample 前，先跑下 ZKClean 进行配置项清理。

dubbo-provider.xml

```
<dubbo:application name="simplified-registry-nosimple-provider"/>
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
<dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService"
               version="1.2.3" group="dubbo-simple" ref="demoService"
               executes="4500" retries="7" owner="vict" timeout="5300"/>
```

启动 provider 的 main 方法之后，查看 zookeeper 的叶子节点（路径为：/dubbo/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService/providers 目录下）的内容

```
dubbo://30.5.124.158:20880/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?anyhost=true
&application=simplified-registry-xml-provider
&async=true
&dubbo=2.0.2
&executes=4500
&generic=false
&group=dubbo-simple
&interface=org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
&methods=sayHello
&owner=vict
&pid=2767
&retries=7
&revision=1.2.3
&side=provider
&timeout=5300
&timestamp=1542361152795
&valid=true
&version=1.2.3
```

从中能看到有：`executes`, `retries`, `owner`, `timeout`。但是这些字段不是每个都需要传递给 dubbo ops 或者 dubbo consumer。 同样的，consumer 也有这个问题，可以在例子中启动 Consumer 的 main 方法进行查看。


##### 开启 URL 精简的示例 (XML模式)

工程源码 [dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-xml](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-xml)。注意，跑 sample 前，先跑下 ZKClean 进行配置项清理。


```properties
dubbo.registry.simplified=true
dubbo.registry.extra-keys=retries,owner
```
和上面的 **现有功能 sample** 进行对比，上面的 sample 中，executes, retries, owner, timeout 四个配置项都进入了注册中心。但是本实例不是，配置情况分为：

* 配置：dubbo.registry.simplified=true， 默认情况下，timeout 在默认的配置项列表，所以还是会进入注册中心；
* 配置：dubbo.registry.extra-keys=retries,owner ， 所以 retries，owner 也会进入注册中心。

**1. provider 端**

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <!-- optional -->
    <dubbo:application name="simplified-registry-xml-provider"/>
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
    <bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
    <dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService" version="1.2.3" group="dubbo-simple"
                   ref="demoService" executes="4500" retries="7" owner="vict" timeout="5300"/>

</beans>
```
得到的 zookeeper 的叶子节点的值
```
dubbo://30.5.124.149:20880/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?application=simplified-registry-xml-provider
&dubbo=2.0.2
&group=dubbo-simple
&owner=vict
&retries=7
&timeout=5300
&timestamp=1542594503305
&version=1.2.3
```

**2. consumer 端**

* 配置：dubbo.registry.simplified=true
* 默认情况：application,version,group,dubbo 在默认的配置项列表，所以还是会进入注册中心。
```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- optional -->
    <dubbo:application name="simplified-registry-xml-consumer"/>

    <dubbo:registry address="zookeeper://127.0.0.1:2181" username="xxx" password="yyy" check="true"/>

    <dubbo:reference id="demoService" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService"
                     owner="vvv" retries="4" actives="6" timeout="4500" version="1.2.3" group="dubbo-simple"/>

</beans>
```
得到的 zookeeper 的叶子节点的值
```
consumer://30.5.124.149/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?actives=6
&application=simplified-registry-xml-consumer
&category=consumers
&check=false
&dubbo=2.0.2
&group=dubbo-simple
&owner=vvv
&version=1.2.3
```

##### 开启 URL 精简的示例（API 模式）

工程源码 [dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-annotation](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-annotation)。注意，跑 sample 前，先跑下 ZKClean 进行配置项清理。

和上面 sample 中的 dubbo.properties 的效果是一致的。

* 默认情况：timeout 在默认的配置项列表，所以还是会进入注册中心；
* 配置： retries,owner 作为额外的 key 进入注册中心 ， 所以 retries，owner 也会进入注册中心。


**1. provider 端 bean 配置**

```java
// 等同于dubbo.properties配置，用@Bean形式进行配置
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    registryConfig.setExtraKeys("retries,owner");
    return registryConfig;
}
```

```java
// 暴露服务
@Service(version = "1.1.8", group = "d-test", executes = 4500, retries = 7, owner = "victanno", timeout = 5300)
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayHello(String name) {
        System.out.println("async provider received: " + name);
        return "annotation: hello, " + name;
    }
}
```

**2. Consumer 配置**

和上面 sample 中 **consumer 端配置** 是一样的。

默认情况：  application,version,group,dubbo 在默认的配置项列表，所以还是会进入注册中心。

#### consumer 端 bean 配置
```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    return registryConfig;
  }
```

消费服务

```java
@Component("annotationAction")
public class AnnotationAction {

    @Reference(version = "1.1.8", group = "d-test", owner = "vvvanno", retries = 4, actives = 6, timeout = 4500)
    private AnnotationService annotationService;
    public String doSayHello(String name) {
        return annotationService.sayHello(name);
    }
}
```

> 注意: 如果一个应用中既有 provider 又有 consumer，那么配置需要合并成如下

```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    //只对provider生效
    registryConfig.setExtraKeys("retries,owner");
    return registryConfig;
}
```

### 定制URL参数

上面降到了两种控制 URL 中出现的参数的方法。

第一种是使用 `dubbo.properties`：

```properties
dubbo.registry.simplified=true
dubbo.registry.extra-keys=retries,owner
```

第二种是通过 `RegistryConfig` 进行设置：

```java
registryConfig.setSimplified(true);
registryConfig.setExtraKeys("retries,owner");
```

还有第三种方法，就是通过扩展 `org.apache.dubbo.registry.integration.ServiceURLCustomizer` SPI，可以非常灵活的增加或减少 URL 中的参数：

```java
@SPI(scope = APPLICATION)
public interface ServiceURLCustomizer extends Prioritized {
    /**
     * Customizes {@link URL the service url}
     *
     * @param serviceURL {@link URL the service url}
     * @return new service url
     */
    URL customize(URL serviceURL, ApplicationModel applicationModel);
}
```



