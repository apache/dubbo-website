---
title: "如何通过 Apache ShenYu 网关代理 Dubbo 服务"
linkTitle: "如何通过 Apache ShenYu 网关代理 Dubbo 服务"
date: 2022-05-04
tags: ["网关", "生态", "Java"]
description: >
  本文介绍了如何通过`Apache ShenYu`网关访问`Dubbo`服务，主要内容包括从简单示例到核心调用流程分析，并对设计原理进行了总结。
aliases:
    - /zh/overview/what/gateway/shenyu/
---

![img](/imgs/blog/shenyu-dubbo/ApacheShenYu-Dubbo-zh.png)


## 1. 介绍

- Apache ShenYu

![img](/imgs/blog/shenyu-dubbo/shenyu.png)


[Apache ShenYu(Incubating)](https://shenyu.apache.org/zh/docs/index) 是一个异步的，高性能的，跨语言的，响应式的 `API` 网关。兼容各种主流框架体系，支持热插拔，用户可以定制化开发，满足用户各种场景的现状和未来需求，经历过大规模场景的锤炼。

2021年5月，`ShenYu`捐献给 `Apache` 软件基金会，Apache 基金会全票通过，顺利进入孵化器。


- Apache Dubbo

`Apache Dubbo` 是一款微服务开发框架，它提供了 `RPC` 通信 与 微服务治理 两大关键能力。这意味着，使用 `Dubbo` 开发的微服务，将具备相互之间的远程发现与通信能力， 同时利用 Dubbo 提供的丰富服务治理能力，可以实现诸如服务发现、负载均衡、流量调度等服务治理诉求。同时 `Dubbo` 是高度可扩展的，用户几乎可以在任意功能点去定制自己的实现，以改变框架的默认行为来满足自己的业务需求。


## 2. Dubbo快速开始

本小节介绍如何将`Dubbo`服务接入到`ShenYu`网关，您可以直接在工程下找到本小节的[示例代码](https://github.com/apache/shenyu/tree/master/shenyu-examples/shenyu-examples-dubbo) 。


### 2.1 启动shenyu-admin

`shenyu-admin`是`Apache ShenYu`后台管理系统， 启动的方式有多种，本文通过 `[本地部署](https://shenyu.apache.org/zh/docs/deployment/deployment-local)` 的方式启动。启动成功后，需要在基础配置`->`插件管理中，把`dubbo` 插件设置为开启，并设置你的注册地址，请确保注册中心已经开启。

![img](/imgs/blog/shenyu-dubbo/dubbo-enable-zh.png)


### 2.2 启动shenyu网关

在这里通过 [源码](https://github.com/apache/incubator-shenyu/tree/master/shenyu-bootstrap) 的方式启动，直接运行`shenyu-bootstrap`中的`ShenyuBootstrapApplication`。

在启动前，请确保网关已经引入相关依赖。如果客户端是`apache dubbo`，注册中心使用`zookeeper`，请参考如下配置：

```java
        <!-- apache shenyu  apache dubbo plugin start-->
        <dependency>
            <groupId>org.apache.shenyu</groupId>
            <artifactId>shenyu-spring-boot-starter-plugin-apache-dubbo</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
            <version>2.7.5</version>
        </dependency>
        <!-- Dubbo zookeeper registry dependency start -->
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-client</artifactId>
            <version>4.0.1</version>
            <exclusions>
                <exclusion>
                    <artifactId>log4j</artifactId>
                    <groupId>log4j</groupId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-framework</artifactId>
            <version>4.0.1</version>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-recipes</artifactId>
            <version>4.0.1</version>
        </dependency>
        <!-- Dubbo zookeeper registry dependency end -->
        <!-- apache dubbo plugin end-->
```

### 2.3 启动shenyu-examples-dubbo

以官网提供的例子为例 [shenyu-examples-dubbo](https://github.com/apache/shenyu/tree/master/shenyu-examples/shenyu-examples-dubbo) 。 假如`dubbo`服务定义如下：

```xml
<beans /* ...... * />

    <dubbo:application name="test-dubbo-service"/>
    <dubbo:registry address="${dubbo.registry.address}"/>
    <dubbo:protocol name="dubbo" port="20888"/>

    <dubbo:service timeout="10000" interface="org.apache.shenyu.examples.dubbo.api.service.DubboTestService" ref="dubboTestService"/>

</beans>
```

声明应用服务名称，注册中心地址，使用`dubbo`协议，声明服务接口，对应接口实现类：

```java
/**
 * DubboTestServiceImpl.
 */
@Service("dubboTestService")
public class DubboTestServiceImpl implements DubboTestService {
    
    @Override
    @ShenyuDubboClient(path = "/findById", desc = "Query by Id")
    public DubboTest findById(final String id) {
        return new DubboTest(id, "hello world shenyu Apache, findById");
    }

    //......
}
```

在接口实现类中，使用注解`@ShenyuDubboClient`向`shenyu-admin`注册服务。

在配置文件`application.yml`中的配置信息：

```yaml
server:
  port: 8011
  address: 0.0.0.0
  servlet:
    context-path: /
spring:
  main:
    allow-bean-definition-overriding: true
dubbo:
  registry:
    address: zookeeper://localhost:2181  # dubbo使用的注册中心
    
shenyu:
  register:
    registerType: http #注册方式
    serverLists: http://localhost:9095 #注册地址
    props:
      username: admin 
      password: 123456
  client:
    dubbo:
      props:
        contextPath: /dubbo  
        appName: dubbo

```

在配置文件中，声明`dubbo`使用的注册中心地址，`dubbo`服务向`shenyu-admin`注册，使用的方式是`http`，注册地址是`http://localhost:9095`。

关于注册方式的使用，请参考 `[应用客户端接入](https://shenyu.apache.org/docs/design/register-center-design/)` 。


### 2.4 调用dubbo服务

`shenyu-examples-dubbo`项目成功启动之后会自动把加 `@ShenyuDubboClient` 注解的接口方法注册到网关。


打开 `插件列表 -> Proxy -> dubbo` 可以看到插件规则配置列表：


![img](/imgs/blog/shenyu-dubbo/dubbo-service-list-zh.png)

注册成功的选择器信息：

![img](/imgs/blog/shenyu-dubbo/dubbo-selector-zh.png)

注册成功的规则信息：

![img](/imgs/blog/shenyu-dubbo/dubbo-rule-zh.png)

> 选择器和规则是 `Apache ShenYu` 网关中最灵魂的东西。掌握好它，你可以对任何流量进行管理。对应为选择器与规则里面的匹配条件(conditions)，根据不同的流量筛选规则，我们可以处理各种复杂的场景。流量筛选可以从`Header`, `URI`, `Query`, `Cookie` 等等Http请求获取数据。
>
> 然后可以采用 `Match`，`=`，`Regex`，`Groovy`，`Exclude`等匹配方式，匹配出你所预想的数据。多组匹配添加可以使用`And/Or`的匹配策略。
>
> 具体的介绍与使用请看: `[选择器与规则管理](https://shenyu.apache.org/zh/docs/user-guide/admin-usage/selector-and-rule)` 。


发起`GET`请求，通过`ShenYu`网关调用`dubbo`服务：

```
GET http://localhost:9195/dubbo/findById?id=100
Accept: application/json
```

成功响应之后，结果如下：

```
{
  "name": "hello world shenyu Apache, findById",
  "id": "100"
}
```

至此，就成功的通过`http`请求访问`dubbo`服务了，`ShenYu`网关通过`shenyu-plugin-dubbo`模块将`http`协议转成了`dubbo`协议。


## 3. 深入理解Dubbo插件

在运行上述`demo`的过程中，是否存在一些疑问：

- `dubbo`服务是如何注册到`shenyu-admin`？
- `shenyu-admin`是如何将数据同步到`ShenYu`网关？
- `DubboPlugin`是如何将`http`协议转换到到dubbo协议？

带着这些疑问，来深入理解`dubbo`插件。


### 3.1 应用客户端接入

应用客户端接入是指将微服务接入到`Apache ShenYu`网关，当前支持`Http`、 `Dubbo`、 `Spring Cloud`、 `gRPC`、 `Motan`、 `Sofa`、 `Tars`等协议的接入。

将应用客户端接入到`Apache ShenYu`网关是通过注册中心来实现的，涉及到客户端注册和服务端同步数据。注册中心支持`Http`、`Zookeeper`、`Etcd`、`Consul`和`Nacos`。默认是通过`Http`方式注册。

客户端接入的相关配置请参考 `[客户端接入配置](https://shenyu.apache.org/zh/docs/user-guide/register-center-access)` 。

#### 3.1.1 客户端注册

![img](/imgs/blog/shenyu-dubbo/register-client.png)

在你的微服务配置中声明注册中心客户端类型，如`Http`或`Zookeeper`。
应用程序启动时使用`SPI`方式加载并初始化对应注册中心客户端，通过实现`Spring Bean`相关的后置处理器接口，在其中获取需要进行注册的服务接口信息，将获取的信息放入`Disruptor`中。

注册中心客户端从`Disruptor`中读取数据，并将接口信息注册到`shenyu-admin`，`Disruptor`在其中起数据与操作解耦的作用，利于扩展。

#### 3.1.2 服务端注册

![img](/imgs/blog/shenyu-dubbo/register-server.png)

在`shenyu-admin`配置中声明注册中心服务端类型，如`Http`或`Zookeeper`。当`shenyu-admin`启动时，读取配置类型，加载并初始化对应的注册中心服务端，注册中心服务端收到`shenyu-client`注册的接口信息后，将其放入`Disruptor`中，然后会触发注册处理逻辑，将服务接口信息更新并发布同步事件。

`Disruptor`在其中起到数据与操作解耦，利于扩展。如果注册请求过多，导致注册异常，也有数据缓冲作用。

### 3.2 数据同步原理

数据同步是指在 `shenyu-admin` 后台操作数据以后，使用何种策略将数据同步到 `Apache ShenYu` 网关。`Apache ShenYu` 网关当前支持`ZooKeeper`、`WebSocket`、`Http长轮询`、`Nacos` 、`Etcd` 和 `Consul` 进行数据同步。默认是通过`WebSocket`进行数据同步。

数据同步的相关配置请参考 `[数据同步配置](https://shenyu.apache.org/zh/docs/user-guide/use-data-sync)` 。

#### 3.2.1 数据同步的意义

网关是流量请求的入口，在微服务架构中承担了非常重要的角色，网关高可用的重要性不言而喻。在使用网关的过程中，为了满足业务诉求，经常需要变更配置，比如流控规则、路由规则等等。因此，网关动态配置是保障网关高可用的重要因素。

当前数据同步特性如下：

- 所有的配置都缓存在 `Apache ShenYu` 网关内存中，每次请求都使用本地缓存，速度非常快。
- 用户可以在 `shenyu-admin` 后台任意修改数据，并马上同步到网关内存。
- 支持 `Apache ShenYu` 的插件、选择器、规则数据、元数据、签名数据等数据同步。
- 所有插件的选择器，规则都是动态配置，立即生效，不需要重启服务。
- 数据同步方式支持 `Zookeeper`、`Http 长轮询`、`Websocket`、`Nacos`、`Etcd` 和 `Consul`。

#### 3.2.2 数据同步原理分析

下图展示了 `Apache ShenYu` 数据同步的流程，`Apache ShenYu` 网关在启动时，会从配置服务同步配置数据，并且支持推拉模式获取配置变更信息，然后更新本地缓存。管理员可以在管理后台（`shenyu-admin`），变更用户权限、规则、插件、流量配置，通过推拉模式将变更信息同步给 `Apache ShenYu` 网关，具体是 `push` 模式，还是 `pull` 模式取决于使用哪种同步方式。

![img](/imgs/blog/shenyu-dubbo/data-sync.png)

在最初的版本中，配置服务依赖 `Zookeeper` 实现，管理后台将变更信息 `push` 给网关。而现在可以支持 `WebSocket`、`Http长轮询`、`Zookeeper`、`Nacos`、`Etcd` 和 `Consul`，通过在配置文件中设置 `shenyu.sync.${strategy}` 指定对应的同步策略，默认使用 `webosocket` 同步策略，可以做到秒级数据同步。但是，有一点需要注意的是，`Apache ShenYu`网关 和 `shenyu-admin` 必须使用相同的同步策略。

如下图所示，`shenyu-admin` 在用户发生配置变更之后，会通过 `EventPublisher` 发出配置变更通知，由 `EventDispatcher` 处理该变更通知，然后根据配置的同步策略(`http、weboscket、zookeeper、naocs、etcd、consul`)，将配置发送给对应的事件处理器。

- 如果是 `websocket` 同步策略，则将变更后的数据主动推送给 `shenyu-web`，并且在网关层，会有对应的 `WebsocketDataHandler` 处理器来处理 `shenyu-admin` 的数据推送。
- 如果是 `zookeeper` 同步策略，将变更数据更新到 `zookeeper`，而 `ZookeeperSyncCache` 会监听到 `zookeeper` 的数据变更，并予以处理。
- 如果是 `http` 同步策略，由网关主动发起长轮询请求，默认有 `90s` 超时时间，如果 `shenyu-admin` 没有数据变更，则会阻塞 `http` 请求，如果有数据发生变更则响应变更的数据信息，如果超过 `60s` 仍然没有数据变更则响应空数据，网关层接到响应后，继续发起 `http` 请求，反复同样的请求。

### 3.3 流程分析

流程分析是从源码的角度，展示服务注册流程，数据同步流程和服务调用流程。

#### 3.3.1 服务注册流程

- 读取dubbo服务

使用注解`@ShenyuDubboClient`标记需要注册到网关的`dubbo`服务。

注解扫描通过`ApacheDubboServiceBeanListener`完成，它实现了`ApplicationListener<ContextRefreshedEvent>`接口，在`Spring`容器启动过程中，发生上下文刷新事件时，开始执行事件处理方法`onApplicationEvent()`。在重写的方法逻辑中，读取`Dubbo`服务`ServiceBean`，构建元数据对象和`URI`对象，并向`shenyu-admin`注册。

具体的注册逻辑由注册中心实现，请参考 `[客户端接入原理](https://shenyu.apache.org/zh/docs/design/register-center-design/)` 。


- 处理注册信息

客户端通过注册中心注册的元数据和`URI`数据，在`shenyu-admin`端进行处理，负责存储到数据库和同步给`shenyu`网关。`Dubbo`插件的客户端注册处理逻辑在`ShenyuClientRegisterDubboServiceImpl`中。继承关系如下：

![img](/imgs/blog/shenyu-dubbo/ShenyuClientRegisterDubboServiceImpl.png)

- ShenyuClientRegisterService：客户端注册服务，顶层接口；
- FallbackShenyuClientRegisterService：注册失败，提供重试操作；
- AbstractShenyuClientRegisterServiceImpl：抽象类，实现部分公共注册逻辑；
- ShenyuClientRegisterDubboServiceImpl：实现`Dubbo`插件的注册；

注册信息包括选择器，规则和元数据。


整体的`dubbo`服务注册流程如下：

![img](/imgs/blog/shenyu-dubbo/dubbo-register-zh.png)

#### 3.3.2 数据同步流程

- admin更新数据
  
假设在在后台管理系统中，新增一条选择器数据，请求会进入`SelectorController`类中的`createSelector()`方法，它负责数据的校验，添加或更新数据，返回结果信息。

在`SelectorServiceImpl`类中通过`createOrUpdate()`方法完成数据的转换，保存到数据库，发布事件，更新`upstream`。

在`Service`类完成数据的持久化操作，即保存数据到数据库。发布变更数据通过`eventPublisher.publishEvent()`完成，这个`eventPublisher`对象是一个`ApplicationEventPublisher`类，这个类的全限定名是`org.springframework.context.ApplicationEventPublisher`，发布数据的功能正是是通过`Spring`相关的功能来完成的。

当事件发布完成后，会自动进入到`DataChangedEventDispatcher`类中的`onApplicationEvent()`方法，根据不同数据类型和数据同步方式进行事件处理。

- 网关数据同步

网关在启动时，根据指定的数据同步方式加载不同的配置类，初始化数据同步相关类。

在接收到数据后，进行反序列化操作，读取数据类型和操作类型。不同的数据类型，有不同的数据处理方式，所以有不同的实现类。但是它们之间也有相同的处理逻辑，所以可以通过模板方法设计模式来实现。相同的逻辑放在抽象类`AbstractDataHandler`中的`handle()`方法中，不同逻辑就交给各自的实现类。

新增一条选择器数据，是新增操作，会进入到`SelectorDataHandler.doUpdate()`具体的数据处理逻辑中。

在通用插件数据订阅者`CommonPluginDataSubscriber`，负责处理所有插件、选择器和规则信息

将数据保存到网关的内存中，`BaseDataCache`是最终缓存数据的类，通过单例模式实现。选择器数据就存到了`SELECTOR_MAP`这个`Map`中。在后续使用的时候，也是从这里拿数据。

上述逻辑用流程图表示如下：

![img](/imgs/blog/shenyu-dubbo/data-sync-seq-zh.png)

#### 3.3.3 服务调用流程

在`Dubbo`插件体系中，类继承关系如下：

![img](/imgs/blog/shenyu-dubbo/ApacheDubboPlugin.png)

> ShenyuPlugin：顶层接口，定义接口方法；
>
> AbstractShenyuPlugin：抽象类，实现插件共有逻辑；
>
> AbstractDubboPlugin：dubbo插件抽象类，实现`dubbo`共有逻辑（ShenYu网关支持ApacheDubbo和AlibabaDubbo）；
>
> ApacheDubboPlugin：ApacheDubbo插件。


- org.apache.shenyu.web.handler.ShenyuWebHandler.DefaultShenyuPluginChain#execute()

通过`ShenYu`网关代理后，请求入口是`ShenyuWebHandler`，它实现了`org.springframework.web.server.WebHandler`接口，通过责任链设计模式将所有插件连接起来。

- org.apache.shenyu.plugin.base.AbstractShenyuPlugin#execute()

当请求到网关时，判断某个插件是否执行，是通过指定的匹配逻辑来完成。在`execute()`方法中执行选择器和规则的匹配逻辑。


- org.apache.shenyu.plugin.global.GlobalPlugin#execute()

最先被执行的是`GlobalPlugin` ，它是一个全局插件，在`execute()`方法中构建上下文信息。

- org.apache.shenyu.plugin.base.RpcParamTransformPlugin#execute()

接着被执行的是`RpcParamTransformPlugin` ， 它负责从`http`请求中读取参数，保存到`exchange`中，传递给`rpc`服务。在`execute()`方法中，执行该插件的核心逻辑：从`exchange`中获取请求信息，根据请求传入的内容形式处理参数。

- org.apache.shenyu.plugin.dubbo.common.AbstractDubboPlugin

然后被执行的是`DubboPlugin` 。在`doExecute()`方法中，主要是检查元数据和参数。在`doDubboInvoker()`方法中设置特殊的上下文信息，然后开始`dubbo`的泛化调用。

在`genericInvoker()`方法中：

- 获取`ReferenceConfig`对象；
- 获取泛化服务`GenericService`对象；
- 构造请求参数`pair`对象；
- 发起异步的泛化调用。

通过泛化调用就可以实现在网关调用`dubbo`服务了。

`ReferenceConfig`对象是支持泛化调用的关键对象 ，它的初始化操作是在数据同步的时候完成的。

- org.apache.shenyu.plugin.response.ResponsePlugin#execute()

最后被执行的是`ResponsePlugin` ，它统一处理网关的响应结果信息。处理类型由`MessageWriter`决定，类继承关系如下：

![img](/imgs/blog/shenyu-dubbo/MessageWriter.png)

> MessageWriter：接口，定义消息处理方法；
>
> NettyClientMessageWriter：处理`Netty`调用结果；
>
> RPCMessageWriter：处理`RPC`调用结果；
>
> WebClientMessageWriter：处理`WebClient`调用结果；

`Dubbo`服务调用，处理结果是`RPCMessageWriter`。

- org.apache.shenyu.plugin.response.strategy.RPCMessageWriter#writeWith()

在`writeWith()`方法中处理响应结果，获取结果或处理异常。

分析至此，关于`Dubbo`插件的源码分析就完成了，分析流程图如下：

![img](/imgs/blog/shenyu-dubbo/dubbo-execute-zh.png)


## 4. 小结

本文从实际案例出发，由浅入深分析了`ShenYu`网关对Dubbo服务的代理过程。涉及到的主要知识点如下：

- 通过责任链设计模式执行插件；
- 使用模板方法设计模式实现`AbstractShenyuPlugin`，处理通用的操作类型；
- 使用单例设计模式实现缓存数据类`BaseDataCache`；
- 通过`springboot starter`即可引入不同的注册中心和数同步方式，扩展性很好；
- 通过`admin`支持规则热更新，方便流量管控；
- `Disruptor`队列是为了数据与操作解耦，以及数据缓冲。
