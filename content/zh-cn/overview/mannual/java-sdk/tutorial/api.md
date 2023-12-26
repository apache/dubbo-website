---
description: 使用轻量的 Java SDK 开发 RPC Server 和 Client
linkTitle: 纯 API 开发模式
title: 使用原生 API 开发 Dubbo 应用
type: docs
weight: 2
---

你可能已经注意到了，本网站大部分的功能、示例都是基于 Spring Boot 编码模式展开的，但 Spring Boot 或 Spring 仅仅是 Dubbo 适配的一种应用或者微服务开发模式。**作为一款 RPC 框架，Dubbo 定义了一套完善的 API 接口，我们可以基于裸 API 开发任何 Dubbo 功能**。

## API 开发示例
我们之前在 [快速开始 - RPC Server 与 Client]() 中看到的即是使用 API 开发的基本示例。

1. 在使用 API 之前，需要引入如下核心依赖：
    ```xml
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.3.0-beta.1</version>
    </dependency>
    ```

2. 使用 API 并启动程序
    ```java
    public class Application {
        public static void main(String[] args) {
            DubboBootstrap.getInstance()
                .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
                .service(ServiceBuilder.newBuilder().ref(new DemoServiceImpl()).build())
                .start()
                .await();
        }
    }
    ```

## API 概览
如上一节示例所示，`DubboBootstrap` 实例代表一个 Dubbo 应用，是整个 Dubbo 应用的启动入口。在 DubboBootstrap 基础上，我们可以设置 `protocol`、`service`、`registry`、`metrics` 等来注册服务、连接注册中心等，这和我们在 Spring Boot 中调整 application.yml 或者 application.properties 文件是对等的作用。

官方推荐使用 `DubboBootstrap.start()` 作为应用的集中启动入口，但为了方便在进程启动后，在运行态单独发布一些服务，Dubbo 也允许直接调用 `ServiceConfig.export()` 或 `ReferenceConfig.refer()` 方法发布服务，这时 Service/Reference 会注册到默认的 DubboBootstrap 实例中，效果同调用 `DubboBootstrap.service(...).start()` 类似。

以下是开发中会常用到的一些组件，完整组件定义及详细参数说明请参见 [参考手册 - 配置项手册]()：

| API 组件 | 全局唯一 | 核心方法或属性 | 说明 |
| --- | --- | --- | --- |
| <span style="display:inline-block;width:160px">DubboBootstrap</span> | 是（多应用场景除外） | start()、stop() | DubboBootstrap 实例代表一个 Dubbo 应用，是整个 Dubbo 应用的启动入口。 |
| ApplicationConfig | 是 | name | 应用名及应用级别的一些全局配置 |
| MetricsConfig | 是 | protocol、prometheus、tracing | Metrics、tracing 采集相关配置 |
| ProtocolConfig | 否。多协议场景服务通过 id 关联 | id、name、port、serialization、threadpool | RPC 协议端口、序列化协议、运行时行为配置 |
| RegistrtyConfig | 否。多注册中心场景服务通过 id 关联 | id、address、protocol、group | 注册中心实现、地址、订阅等配置 |
| ConfigCenterConfig | 否。多配置中心场景服务通过 id 关联 | id、address、protocol、group、namespace | 配置中心实现、地址、分组隔离等配置 |
| MetadataReportConfig | 否。多元数据中心场景服务通过 id 关联 | id、address、protocol、group、namespace | 元数据中心实现、地址、分组隔离等配置 |
| ProviderConfig | 否 | 参考 ServiceConfig | 作为多个ServiceConfig的默认值 |
| ConsumerConfig | 否 | 参考 ReferenceConfig | 作为多个ReferenceConfig的默认值 |
| ServiceConfig | 否 | - 方法：export()<br/> - 属性： interfaceClass、ref、group、version、timeout、retry | 一个 ServiceConfig 实例代表一个 RPC 服务 |
| ReferenceConfig | 否 | - 方法：refer()<br/> - 属性：interfaceClass、group、version、timeout、retry、cluster、loadbalance | 一个 ReferenceConfig 实例代表一个 RPC 服务 |
| MethodConfig | 否 | name、oninvoke、onreturn、onthrow | ServiceConfig/ReferenceConfig 内嵌的方法级别配置 |
| ArgumentConfig | 否 | index、type、callback | MethodConfig 内嵌的参数级别配置 |

{{% alert title="注意" color="info" %}}
Dubbo 支持模块化的应用开发，简单来讲就是在一个 JVM 进程内的多个相互隔离的模块，每个模块可以称之为一个应用，不同应用间的服务发布、服务调用、服务生命周期互相隔离。当与 Spring ApplicationContext 一一对应时，可以实现基于 ApplicationContext 的 Dubbo 资源隔离。具体请参见 [参考手册 - Dubbo 多模块设计与使用]()

![多模块应用开发](https://www.yuque.com/apache-dubbo/dubbo3/vpv8nu)
{{% /alert %}}

## 更多示例

### 发布多个服务
以下示例注册并发布任意多个服务 FooService、BarService，这些服务都将使用 providerConfig 中配置的默认超时时间，省去多个服务重复配置的烦恼。

```java
public static void main(String[] args) {
    ProviderConfig providerConfig = new ProviderConfig();
    providerConfig.setTimeout(5000);

    ProtocolConfig protocolConfig = new ProtocolConfig(CommonConstants.TRIPLE, 50051);

    DubboBootstrap.getInstance()
        .protocol(protocolConfig)
        .provider(providerConfig)
        .service(ServiceBuilder.newBuilder().ref(new FooServiceImpl()).build())
        .service(ServiceBuilder.newBuilder().ref(new BarServiceImpl()).build())
        .start()
        .await();
}
```

### 发布单个服务
直接调用 ServiceConfig.export() 发布服务，适用于运行态动态发布或订阅一个服务，对于 ReferenceConfig 同理。对于正常的应用启动流程，推荐使用 DubboBootstrap 而非直接调用 ServiceConfig.export() 发布单个服务。

1. 通过 ServiceConfig 发布服务
```java
public static void main(String[] args) {
    ServiceConfig<DemoService> demoServiceConfig = new ServiceConfig<>();
    demoServiceConfig.setInterface(DemoService.class);
    demoServiceConfig.setRef(new DemoServiceImpl());
    demoServiceConfig.setVersion("1.0.0");

    demoServiceConfig.export(); // this service will be registered to the default instance of DubboBootstrap.getInstance()
}
```

2. 通过 ReferenceConfig 订阅服务

```java
private DemoService referService() {
    ReferenceConfig<DemoService> reference = new ReferenceConfig<>();
    reference.setInterfaceClass(DemoService.class);

    ReferenceCache cache = SimpleReferenceCache.getCache();
    try {
        return cache.get(reference);
    } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
    }
}
```

由于 ReferenceConfig.get() 创建的代理对象持有连接、地址等大量资源，因此建议缓存复用，Dubbo 官方提供了 SimpleReferenceCache 实现参考实现。关于 SimpleReferenceCache 更多内容，请参考 [RPC 框架]()。

### 获得引用代理
使用 DubboBootstrap 作为启动入口，订阅服务并获得代理对象。

```java
public static void main(String[] args) {
    ReferenceConfig<GreetingsService> reference =
            ReferenceBuilder.<GreetingsService>newBuilder()
            .interfaceClass(GreetingsService.class)
            .build();
    DubboBootstrap.getInstance().reference(reference).start();
    GreetingsService service = reference.get();
}
```

### 注册中心和应用名
相比于 RPC server、RPC client，基于 API 的微服务应用开发需要配置应用名、注册中心。

```java
public static void main(String[] args) {
    DubboBootstrap.getInstance()
        .application()
        .registry(new RegistryConfig("nacos://127.0.0.1:8848"))
        .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
        .service(ServiceBuilder.newBuilder().ref(new DemoServiceImpl()).build())
        .service(ServiceBuilder.newBuilder().ref(new FooServiceImpl()).build())
        .start()
        .await();
}
```

### 多个注册中心
多个注册中心可指定不同的 id，服务通过 id 关联注册中心实例。如下示例中，GreetingsService 发布到 bjRegistry，DemoService 发布到 hzRegistry。

```java
public static void main(String[] args) {
    RegistryConfig bjRegistry = new RegistryConfig();
    bjRegistry.setId("bj");
    bjRegistry.setAddress("nacos://127.0.0.1:8848");

    RegistryConfig hzRegistry = new RegistryConfig();
    hzRegistry.setId("hz");
    hzRegistry.setAddress("nacos://127.0.0.2:8848");

    DubboBootstrap.getInstance()
            .registry(bjRegistry)
            .registry(hzRegistry)
            .service(ServiceBuilder.newBuilder().registryIds("bj").interfaceClass(GreetingsService.class).ref(new GreetingsServiceImpl()).build())
            .service(ServiceBuilder.newBuilder().registryIds("hz").interfaceClass(DemoService.class).ref(new DemoServiceImpl()).build())
            .start()
            .await();
}
```
