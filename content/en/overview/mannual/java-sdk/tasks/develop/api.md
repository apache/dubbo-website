---
description: As an RPC framework, Dubbo defines a comprehensive set of API interfaces, allowing us to develop RPC services and microservice applications based on the native API.
linkTitle: Pure API Development Model
title: Developing Dubbo Applications Using Native APIs
type: docs
weight: 2
---

You may have noticed that most of the functions and examples in the documentation are based on the Spring Boot model, but Spring Boot or Spring is merely one application or microservice development model adapted by Dubbo. **As an RPC framework, Dubbo defines a comprehensive set of API interfaces, enabling us to develop Dubbo applications based on the native APIs**. Business scenarios that can be achieved with pure APIs include:
* **Lightweight RPC Server & Client**, typically used for simple remote call scenarios within applications, foundational components, middleware, etc.
* **Microservices Applications**, without relying on Spring, directly using APIs to develop microservices.

## API Overview
```java
public class Application {
    public static void main(String[] args) {
        DubboBootstrap.getInstance()
            .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
            .service(ServiceBuilder.newBuilder().interfaceClass(DemoService.class).ref(new DemoServiceImpl()).build())
            .start()
            .await();
    }
}
```

The above is a code example of starting a Dubbo RPC Server. The `DubboBootstrap` instance represents a Dubbo application and serves as the entry point for starting the entire Dubbo application. Based on DubboBootstrap, we can set `protocol`, `service`, `registry`, `metrics`, etc., to register services, connect to the registry, etc., similar to adjusting application.yml or application.properties files in Spring Boot.

The official recommendation is to use `DubboBootstrap.start()` as the centralized entry for application startup, but to facilitate the separate publication of some services after the process starts, the Dubbo framework also allows directly calling `ServiceConfig.export()` or `ReferenceConfig.refer()` methods to publish individual services. In this case, Service/Reference will register with the default DubboBootstrap instance, similar to calling `DubboBootstrap.service(...).start()`.

Below are some components commonly used in development. For a complete component definition and detailed parameter description, please refer to the [Reference Manual - Configuration Items Manual](/en/overview/mannual/java-sdk/reference-manual/config/properties/#Configuration%20Manual):

| API Component | Globally Unique | Core Methods or Properties | Description |
| --- | --- | --- | --- |
| <span style="display:inline-block;width:160px">DubboBootstrap</span> | Yes (except for multi-application scenarios) | start(), stop() | The DubboBootstrap instance represents a Dubbo application and serves as the entry point for starting the entire Dubbo application. |
| ApplicationConfig | Yes | name | Application name and some global configurations at the application level |
| MetricsConfig | Yes | protocol, prometheus, tracing | Configurations related to Metrics and tracing collection |
| ProtocolConfig | No. Services in multi-protocol scenarios are associated by id | id, name, port, serialization, threadpool | RPC protocol port, serialization protocol, runtime behavior configuration |
| RegistrtyConfig | No. Services in multi-registry scenarios are associated by id | id, address, protocol, group | Registry implementation, address, subscription, etc. configurations |
| ConfigCenterConfig | No. Services in multi-configuration center scenarios are associated by id | id, address, protocol, group, namespace | Configuration center implementation, address, group isolation, etc. configurations |
| MetadataReportConfig | No. Services in multi-metadata center scenarios are associated by id | id, address, protocol, group, namespace | Metadata center implementation, address, group isolation, etc. configurations |
| ProviderConfig | No | Reference ServiceConfig | Default values for multiple ServiceConfig |
| ConsumerConfig | No | Reference ReferenceConfig | Default values for multiple ReferenceConfig |
| ServiceConfig | No | - Method: export()<br/> - Properties: interfaceClass, ref, group, version, timeout, retry | A ServiceConfig instance represents an RPC service |
| ReferenceConfig | No | - Method: refer()<br/> - Properties: interfaceClass, group, version, timeout, retry, cluster, loadbalance | A ReferenceConfig instance represents an RPC service |
| MethodConfig | No | name, oninvoke, onreturn, onthrow | Method-level configuration embedded in ServiceConfig/ReferenceConfig |
| ArgumentConfig | No | index, type, callback | Parameter-level configuration embedded in MethodConfig |

## Lightweight RPC Example
This example demonstrates how to use the lightweight Dubbo SDK to develop RPC Server and Client. The example defines, publishes, and accesses RPC services using Java Interface, with Triple protocol communications. For complete code, please see <a href="https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api" target="_blank">dubbo-samples</a>.

Based on the Triple protocol defined by Dubbo, you can easily write browser and gRPC compatible RPC services and run them simultaneously on HTTP/1 and HTTP/2. The Dubbo Java SDK supports defining services using IDL or language-specific methods and provides a lightweight API for publishing or calling these services.

### Maven Dependency

Before coding with Dubbo RPC, you only need to add a lightweight `dubbo` dependency package to your project. For Maven, it looks like this:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.3.0</version>
</dependency>
```

### Define Service

Define a standard Java interface named `DemoService` as a Dubbo service (Dubbo also supports [IDL-based service definition patterns](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/)).

```java
public interface DemoService {
   String sayHello(String name);
}
```

Implement the `DemoService` interface and write the business logic code.

```java
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name + ", response from provider.";
    }
}
```

### Register Service and Start Server

Start the server and listen for RPC requests on the specified port. Before this, we registered the following information with the server:

- Using `Triple` as the communication RPC protocol and listening on port `50051`
- Registering the Dubbo service to `DemoService` server

```java
public class Application {
    public static void main(String[] args) {
        DubboBootstrap.getInstance()
            .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
            .service(ServiceBuilder.newBuilder().interfaceClass(DemoService.class).ref(new DemoServiceImpl()).build())
            .start()
            .await();
    }
}
```

### Access Service

The simplest way is to use an HTTP/1.1 POST request to access the service, with parameters passed as standard JSON format in the HTTP payload. Here is an example using the cURL command:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/org.apache.dubbo.demo.DemoService/sayHello
```

> Parameters must be passed in array format. If there are multiple parameters, the format should be like `["param1", {"param2-field": "param2-value"}, ...]`, please refer to the triple protocol specification for specifics.

Next, you can also use a standard Dubbo client to request the service, specifying the server address to initiate an RPC call. The format is `protocol://ip:host`.

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

Congratulations! The above is the basic usage of Dubbo Java RPC communication! 🎉

### More Examples
Besides the simple usage scenarios above, developers can also publish multiple services, directly call ServiceConfig/ReferenceConfig to publish/subscribe individual services, etc.

#### Publish Multiple Services
The following example registers and publishes any number of services FooService, BarService. These services will all use the default timeout configured in providerConfig, avoiding the hassle of repeated configurations for multiple services.

```java
public static void main(String[] args) {
    ProviderConfig providerConfig = new ProviderConfig();
    providerConfig.setTimeout(5000);

    ProtocolConfig protocolConfig = new ProtocolConfig(CommonConstants.TRIPLE, 50051);

    DubboBootstrap.getInstance()
        .protocol(protocolConfig)
        .provider(providerConfig)
        .service(ServiceBuilder.newBuilder().interfaceClass(FooService.class).ref(new FooServiceImpl()).build())
        .service(ServiceBuilder.newBuilder().interfaceClass(BarService.class).ref(new BarServiceImpl()).build())
        .start()
        .await();
}
```

#### Publish Individual Services
Directly call ServiceConfig.export() to publish services suitable for dynamic publication or subscription of a single service in runtime; it is similar for ReferenceConfig. For routine application startup processes, it is recommended to use DubboBootstrap instead of directly calling ServiceConfig.export() to publish individual services.

1. Publishing a service through ServiceConfig
```java
public static void main(String[] args) {
    ServiceConfig<DemoService> demoServiceConfig = new ServiceConfig<>();
    demoServiceConfig.setInterface(DemoService.class);
    demoServiceConfig.setRef(new DemoServiceImpl());
    demoServiceConfig.setVersion("1.0.0");

    demoServiceConfig.export(); // this service will be registered to the default instance of DubboBootstrap.getInstance()
}
```

2. Subscribing to services through ReferenceConfig

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

Because the proxy object created by ReferenceConfig.get() holds a lot of resources such as connections and addresses, it is recommended to cache and reuse it. Dubbo officially provides a SimpleReferenceCache implementation for reference. For more content on SimpleReferenceCache, please refer to [RPC Framework](/en/overview/mannual/java-sdk/tasks/framework/more/reference-config-cache/).

#### Getting Reference Proxy
Use DubboBootstrap as the startup entry, subscribe to services, and obtain proxy objects.

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

## Microservices Example
### Registry Center and Application Name
Compared to RPC server and RPC client, developing microservice applications based on APIs requires configurations for the application name and registry center.

```java
public static void main(String[] args) {
    DubboBootstrap.getInstance()
        .application()
        .registry(new RegistryConfig("nacos://127.0.0.1:8848"))
        .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
        .service(ServiceBuilder.newBuilder().interfaceClass(DemoService.class).ref(new DemoServiceImpl()).build())
        .service(ServiceBuilder.newBuilder().interfaceClass(FooService.class).ref(new FooServiceImpl()).build())
        .start()
        .await();
}
```

### Multiple Registry Centers
Multiple registry centers can specify different ids, and services are associated with the registry center instances by id. In the following example, GreetingsService is published to bjRegistry, while DemoService is published to hzRegistry.

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

### Publish Individual Services
Directly call ServiceConfig.export() to publish services, suitable for dynamically publishing or subscribing to a single service in runtime; it is similar for ReferenceConfig. For routine application startup processes, it is recommended to use DubboBootstrap instead of directly calling ServiceConfig.export() to publish individual services.

{{% alert title="Note" color="primary" %}}

{{% /alert %}}

1. Publishing a service through ServiceConfig
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

2. Subscribing to services through ReferenceConfig

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

## More Content

- The Triple protocol is fully compatible with gRPC, you can refer to here to learn how to [write gRPC compatible services using IDL](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/), or [use other communication protocols](/en/overview/mannual/java-sdk/tasks/protocols/)
- As an RPC framework, Dubbo supports asynchronous calls, connection management, context, etc., please refer to [Core Functions of RPC Framework](/en/overview/mannual/java-sdk/tasks/framework/)
- Use [Dubbo Spring Boot to develop microservice applications](/en/overview/mannual/java-sdk/tasks/develop/springboot/)

