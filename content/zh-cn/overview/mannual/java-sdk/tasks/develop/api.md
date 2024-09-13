---
description: 作为一款 RPC 框架，Dubbo 定义了一套完善的 API 接口，我们可以基于原生 API 开发 RPC 服务和微服务应用
linkTitle: 纯 API 开发模式
title: 使用原生 API 开发 Dubbo 应用
type: docs
weight: 2
---

你可能已经注意到了，文档中大部分的功能、示例都是基于 Spring Boot 模式编写的，但 Spring Boot 或 Spring 仅仅是 Dubbo 适配的一种应用或者微服务开发模式。**作为一款 RPC 框架，Dubbo 定义了一套完善的 API 接口，我们可以基于原生 API 开发 Dubbo 应用**，纯 API 可以实现的业务场景包括：
* **轻量 RPC Server & Client**，通常用于一些应用内、基础组件、中间件等内的简单远程调用场景
* **微服务应用**，不依赖 Spring 的情况下，直接用 API 开发微服务

## API 概览
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

以上是启动 Dubbo RPC Server 的一段代码示例，`DubboBootstrap` 实例代表一个 Dubbo 应用，是整个 Dubbo 应用的启动入口。在 DubboBootstrap 基础上，我们可以设置 `protocol`、`service`、`registry`、`metrics` 等来注册服务、连接注册中心等，这和我们在 Spring Boot 中调整 application.yml 或者 application.properties 文件是对等的作用。

官方推荐使用 `DubboBootstrap.start()` 作为应用的集中启动入口，但为了方便在进程启动后，在运行态单独发布一些服务，Dubbo 框架也允许直接调用 `ServiceConfig.export()` 或 `ReferenceConfig.refer()` 方法发布单个服务，这时 Service/Reference 会注册到默认的 DubboBootstrap 实例中，效果同调用 `DubboBootstrap.service(...).start()` 类似。

以下是开发中会常用到的一些组件，完整组件定义及详细参数说明请参见 [参考手册 - 配置项手册](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#配置项手册)：

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

## 轻量 RPC 示例
本示例演示如何使用轻量 Dubbo SDK 开发 RPC Server 与 Client，示例使用 Java Interface 方式定义、发布和访问 RPC 服务，底层使用 Triple 协议通信。本示例完整代码请参见 <a href="https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api" target="_blank">dubbo-samples</a>。

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Java SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

### Maven 依赖

在基于 Dubbo RPC 编码之前，您只需要在项目添加一个非常轻量的 `dubbo`依赖包即可，以 Maven 为例：
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.3.0</version>
</dependency>
```

### 定义服务

定义一个名为 `DemoService`的标准 Java 接口作为 Dubbo 服务（Dubbo 还支持[基于 IDL 的服务定义模式](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/)）。

```java
public interface DemoService {
   String sayHello(String name);
}
```

实现 `DemoService` 接口并编写业务逻辑代码。

```java
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name + ", response from provider.";
    }
}
```

### 注册服务并启动 Server

启动 server 并在指定端口监听 RPC 请求，在此之前，我们向 server 注册了以下信息：

- 使用 `Triple` 作为通信 RPC 协议与并监听端口 `50051`
- 注册 Dubbo 服务到 `DemoService` server

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

### 访问服务

最简单方式是使用 HTTP/1.1 POST 请求访问服务，参数则以标准 JSON 格式作为 HTTP 负载传递。如下是使用 cURL 命令的访问示例：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/org.apache.dubbo.demo.DemoService/sayHello
```

> 参数必须以数组格式进行传递，如果有多个参数，则格式类似 `["param1", {"param2-field": "param2-value"}, ...]`，具体请参见 triple 协议规范。

接下来，您也可以使用标准的 Dubbo client 请求服务，指定 server 地址即可发起 RPC 调用，其格式为 `protocol://ip:host`

```java
public class Application {
    public static void main(String[] args) {
        DemoService demoService =
            ReferenceBuilder.newBuilder()
            .interfaceClass(DemoService.class)
            .url("tri://localhost:50051")
            .build()
            .get();

        String message = demoService.sayHello("dubbo");
        System.out.println(message);
    }
}
```

恭喜您， 以上即是 Dubbo Java RPC 通信的基本使用方式！  🎉


### 更多示例
除了以上简单使用场景之外，开发者还可以发布多个服务、直接调用 ServiceConfig/ReferenceConfig 发布/订阅单个服务等。

#### 发布多个服务
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

#### 发布单个服务
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

由于 ReferenceConfig.get() 创建的代理对象持有连接、地址等大量资源，因此建议缓存复用，Dubbo 官方提供了 SimpleReferenceCache 实现参考实现。关于 SimpleReferenceCache 更多内容，请参考 [RPC 框架](/zh-cn/overview/mannual/java-sdk/tasks/framework/more/reference-config-cache/)。

#### 获得引用代理
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

## 微服务示例
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

### 发布单个服务
直接调用 ServiceConfig.export() 发布服务，适用于运行态动态发布或订阅一个服务，对于 ReferenceConfig 同理。对于正常的应用启动流程，推荐使用 DubboBootstrap 而非直接调用 ServiceConfig.export() 发布单个服务。

{{% alert title="注意" color="primary" %}}

{{% /alert %}}

1. 通过 ServiceConfig 发布服务
```java
public static void main(String[] args) {
	RegistryConfig hzRegistry = new RegistryConfig();
    hzRegistry.setId("hz");
    hzRegistry.setAddress("nacos://127.0.0.2:8848");

    ServiceConfig<DemoService> demoServiceConfig = new ServiceConfig<>();
    demoServiceConfig.setInterface(DemoService.class);
    demoServiceConfig.setRef(new DemoServiceImpl());
    demoServiceConfig.setVersion("1.0.0");

    demoServiceConfig.setRegistry(hzRegistry);

    demoServiceConfig.export(); // this service will be registered to the default instance of DubboBootstrap.getInstance()
}
```

2. 通过 ReferenceConfig 订阅服务

```java
private DemoService referService() {
    RegistryConfig hzRegistry = new RegistryConfig();
	hzRegistry.setId("hz");
	hzRegistry.setAddress("nacos://127.0.0.2:8848");

    ReferenceConfig<DemoService> reference = new ReferenceConfig<>();
    reference.setInterfaceClass(DemoService.class);

    reference.setRegistry(hzRegistry)

    ReferenceCache cache = SimpleReferenceCache.getCache();
    try {
        return cache.get(reference);
    } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
    }
}
```

## 更多内容

- Triple 协议完全兼容 gRPC，您可以参考这里了解如何  [使用 IDL 编写 gRPC 兼容的服务](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/)，或者 [使用其他通信协议](/zh-cn/overview/mannual/java-sdk/tasks/protocols/)
- 作为 RPC 框架，Dubbo 支持异步调用、连接管理、context上下文等，请参考 [RPC 框架核心功能](/zh-cn/overview/mannual/java-sdk/tasks/framework/)
- 使用 [Dubbo Spring Boot 开发微服务应用](/zh-cn/overview/mannual/java-sdk/tasks/develop/springboot/)
