---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config/api/
    - /en/docs3-v2/java-sdk/reference-manual/config/api/
description: Configure your Dubbo application via API
linkTitle: API Configuration
title: API Configuration
type: docs
weight: 2
---

As an RPC framework, Dubbo defines a complete set of API interfaces, allowing us to develop Dubbo applications based on the native API. For specific examples of using the native API to develop lightweight RPC and microservices applications, see the examples in [Tutorial - API Development Mode](/en/overview/mannual/java-sdk/tasks/develop/api/). Its applicable scenarios fall into two categories:
* **Lightweight RPC Server & Client**, typically used for simple remote call scenarios within applications, basic components, middleware, etc.
* **Microservice Applications**, developing microservices directly using APIs without relying on Spring or Spring Boot; using APIs directly can also be useful for gateway or testing platform integration scenarios.

The current entry APIs primarily include `Bootstrap`, `ServiceConfig`, `ReferenceConfig`, etc., which are used for Dubbo application development in different scenarios.

## Bootstrap API

The DubboBootstrap instance represents a Dubbo application, serving as the startup entry point for the entire Dubbo application. Based on DubboBootstrap, we can set up protocol, service, registry, metrics, etc., to register services and connect to the registry, similar to adjusting application.yml or application.properties files in Spring Boot.

It is recommended to use DubboBootstrap.start() as a centralized startup entry for the application. However, for convenience in publishing certain services independently after the process has started, Dubbo also allows direct calls to ServiceConfig.export() or ReferenceConfig.refer() methods to publish services. In this case, Service/Reference will register to the default DubboBootstrap instance, effectively similar to calling DubboBootstrap.service(...).start().

```java
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ProviderConfig;
import org.apache.dubbo.config.ServiceConfig;
import com.xxx.DemoService;
import com.xxx.DemoServiceImpl;

public class DemoProvider {
    public static void main(String[] args) {

        ConfigCenterConfig configCenter = new ConfigCenterConfig();
        configCenter.setAddress("zookeeper://127.0.0.1:2181");

        // Provider protocol configuration
        ProtocolConfig protocol = new ProtocolConfig();
        protocol.setName("dubbo");
        protocol.setPort(12345);
        protocol.setThreads(200);

        // Note: ServiceConfig is a heavy object, encapsulating the connection with the registry and opening the service port
        // Provider service exposure configuration
        ServiceConfig<DemoService> demoServiceConfig = new ServiceConfig<>();
        demoServiceConfig.setInterface(DemoService.class);
        demoServiceConfig.setRef(new DemoServiceImpl());
        demoServiceConfig.setVersion("1.0.0");

        // Second service configuration
        ServiceConfig<FooService> fooServiceConfig = new ServiceConfig<>();
        fooServiceConfig.setInterface(FooService.class);
        fooServiceConfig.setRef(new FooServiceImpl());
        fooServiceConfig.setVersion("1.0.0");

        ...

        // Simplifying configuration assembly and controlling the startup process through DubboBootstrap
        DubboBootstrap.getInstance()
                .application("demo-provider") // Application configuration
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181")) // Registry configuration
                .protocol(protocol) // Global default protocol configuration
                .service(demoServiceConfig) // Add ServiceConfig
                .service(fooServiceConfig)
                .start()    // Start Dubbo
                .await();   // Suspend wait (prevent process exit)
    }
}
```

```java
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ProviderConfig;
import org.apache.dubbo.config.ServiceConfig;
import com.xxx.DemoService;
import com.xxx.DemoServiceImpl;

public class DemoConsumer {
    public static void main(String[] args) {

        // Referencing remote service
        ReferenceConfig<DemoService> demoServiceReference = new ReferenceConfig<DemoService>();
        demoServiceReference.setInterface(DemoService.class);
        demoServiceReference.setVersion("1.0.0");

        ReferenceConfig<FooService> fooServiceReference = new ReferenceConfig<FooService>();
        fooServiceReference.setInterface(FooService.class);
        fooServiceReference.setVersion("1.0.0");

        // Simplifying configuration assembly and controlling the startup process through DubboBootstrap
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application("demo-consumer") // Application configuration
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181")) // Registry configuration
                .reference(demoServiceReference) // Add ReferenceConfig
                .reference(fooServiceReference)
                .start();    // Start Dubbo

        ...

        // Use demoService just like local bean
        // Get remote service interface proxy through Interface, no need to rely on ReferenceConfig object
        DemoService demoService = DubboBootstrap.getInstance().getCache().get(DemoService.class);
        demoService.sayHello("Dubbo");

        FooService fooService = fooServiceReference.get();
        fooService.greeting("Dubbo");
    }

}
```

### Basic Configuration

Global basic configurations can be set in DubboBootstrap, including application configuration, protocol configuration, registry, configuration center, metadata center, module, monitoring, SSL, provider configuration, consumer configuration, etc.

```java
// Registry
RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://192.168.10.1:2181");
...

// Provider protocol configuration
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("dubbo");
protocol.setPort(12345);
protocol.setThreads(200);
...

// Configuration Center
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("zookeeper://192.168.10.2:2181");
...

// Metadata Center
MetadataReportConfig metadataReport = new MetadataReportConfig();
metadataReport.setAddress("zookeeper://192.168.10.3:2181");
...

// Metrics
MetricsConfig metrics = new MetricsConfig();
metrics.setProtocol("dubbo");
...

// SSL
SslConfig ssl = new SslConfig();
ssl.setServerKeyCertChainPath("/path/ssl/server-key-cert-chain");
ssl.setServerPrivateKeyPath("/path/ssl/server-private-key");
...

// Provider configuration (default configuration for ServiceConfig)
ProviderConfig provider = new ProviderConfig();
provider.setGroup("demo");
provider.setVersion("1.0.0");
...

// Consumer configuration (default configuration for ReferenceConfig)
ConsumerConfig consumer = new ConsumerConfig();
consumer.setGroup("demo");
consumer.setVersion("1.0.0");
consumer.setTimeout(2000);
...

DubboBootstrap.getInstance()
    .application("demo-app")
    .registry(registry)
    .protocol(protocol)
    .configCenter(configCenter)
    .metadataReport(metadataReport)
    .module(new ModuleConfig("module"))
    .metrics(metrics)
  	.ssl(ssl)
  	.provider(provider)
  	.consumer(consumer)
  	...
  	.start();

```

### Method-level Settings

```java
...

// Method-level configuration
List<MethodConfig> methods = new ArrayList<MethodConfig>();
MethodConfig method = new MethodConfig();
method.setName("sayHello");
method.setTimeout(10000);
method.setRetries(0);
methods.add(method);

// Referencing remote service
ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>(); // This instance is heavy, encapsulating the connection to the registry and the connection to the provider, please cache it, otherwise it may cause memory and connection leaks
...
reference.setMethods(methods); // Set method-level configuration

...
```

### Point-to-Point Direct Connection

```java

...

// This instance is heavy, encapsulating the connection to the registry and the connection to the provider, please cache it, otherwise it may cause memory and connection leaks
ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>();
// For direct point-to-point connection, you can specify the target address using reference.setUrl(), and setting the URL will bypass the registry,
// where the protocol corresponds to provider.setProtocol()'s value, the port corresponds to provider.setPort()'s value,
// and the path corresponds to service.setPath()'s value. If the path is not set, the default path is the interface name.
reference.setUrl("dubbo://10.20.130.230:20880/com.xxx.DemoService");

...
```

## ServiceConfig

Through ServiceConfig, you can publish services directly, registering the service interface to an in-memory list and the registry. This can be very useful for scenarios that require dynamic service publishing.

> Note: For ordinary application development scenarios, we recommend using [DubboBootstrap API](#bootstrap-api).

```java
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ProviderConfig;
import org.apache.dubbo.config.ServiceConfig;
import com.xxx.DemoService;
import com.xxx.DemoServiceImpl;

public class DemoProvider {
    public static void main(String[] args) {
        // Service implementation
        DemoService demoService = new DemoServiceImpl();

        // Current application configuration
        ApplicationConfig application = new ApplicationConfig();
        application.setName("demo-provider");

        // Connection to registry configuration
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("zookeeper://10.20.130.230:2181");

        // Provider protocol configuration
        ProtocolConfig protocol = new ProtocolConfig();
        protocol.setName("dubbo");
        protocol.setPort(12345);
        protocol.setThreads(200);

        // Note: ServiceConfig is a heavy object, encapsulating the connection to the registry and opening the service port
        // Provider service exposure configuration
        ServiceConfig<DemoService> service = new ServiceConfig<DemoService>(); // This instance is heavy, encapsulating the connection to the registry, please cache it, otherwise it may cause memory and connection leaks
        service.setApplication(application);
        service.setRegistry(registry); // Multiple registries can use setRegistries()
        service.setProtocol(protocol); // Multiple protocols can use setProtocols()
        service.setInterface(DemoService.class);
        service.setRef(demoService);
        service.setVersion("1.0.0");

        // Expose and register the service
        service.export();

        // Suspend wait (prevent process exit)
        System.in.read();
    }
}
```

## ReferenceConfig

Through ReferenceConfig, you can reference remote services and subscribe to service interfaces from the registry. This can be very useful for scenarios that require dynamic service publishing.

> Note: For ordinary application development, we recommend using [DubboBootstrap API](#bootstrap-api).

```java
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ConsumerConfig;
import org.apache.dubbo.config.ReferenceConfig;
import com.xxx.DemoService;

public class DemoConsumer {
    public static void main(String[] args) {
        // Current application configuration
        ApplicationConfig application = new ApplicationConfig();
        application.setName("demo-consumer");

        // Connection to registry configuration
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("zookeeper://10.20.130.230:2181");

        // Note: ReferenceConfig is a heavy object, encapsulating the connection to the registry and the connection to the service provider
        // Referencing remote service
        ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>(); // This instance is heavy, encapsulating the connection to the registry and to the provider, please cache it, otherwise it may cause memory and connection leaks
        reference.setApplication(application);
        reference.setRegistry(registry); // Multiple registries can use setRegistries()
        reference.setInterface(DemoService.class);
        reference.setVersion("1.0.0");

        // Use demoService just like local bean
        // Note: This proxy object encapsulates all communication details and is relatively heavy, please cache for reuse
        DemoService demoService = reference.get();
        demoService.sayHello("Dubbo");
    }
}
```

## Multi-instance Deployment

The background of multi-instance deployment originates from the large-scale application deployment scenario of Dubbo within Alibaba Group. The main problems encountered by Alibaba Group include:
1. There are many middleware frameworks within Alibaba Group, each providing various class loading methods. Different business parties expect the configuration and other information within the same application to be mutually isolated.
2. Some business parties’ custom logic requires support for dynamic hot deployment mode, specifically reflected in the dynamic destruction of a certain virtual environment, which necessitates a more refined management of Dubbo's lifecycle.
3. Various frameworks within Alibaba Group have been customized for the Spring container and need to allow Dubbo to support scenarios where multiple Spring Contexts independently manage their lifecycles.

![Multi-instance architecture diagram](/imgs/v3/manual/java/multi-instance/arch.png)

The entire design of Dubbo multi-instances is configured according to a three-layer model: Framework layer, Application layer, and Module layer.

Based on this three-layer mechanism, we can isolate Dubbo according to certain rules:
1. Framework and Framework are completely isolated, equivalent to using two completely different Dubbo instances.
2. Applications are isolated by application name, while sharing Protocol and Serialization layers to some extent, aiming to allow multiple applications to be hosted on the same dubbo port (20880), with each application reporting address information independently.
3. Modules can be user-defined isolated, which can be either a state in the hot deployment period or a Spring Context's Context. Through Modules, users can manage the granularity of Dubbo’s lifecycle at its minimal.

To achieve Dubbo's multi-instance implementation, the most significant change made to the Dubbo framework is modifying most of the logic for obtaining parameters from static variables. The most notable change is the URL object used for parameter transfer within Dubbo now carries the ScopeModel state, which corresponds to the specific data-bearing objects of the aforementioned three-layer model.
For more implementation principles and design details about multi-instances, please refer to [Source Architecture - Multi-instance Design and Implementation](/en/overview/mannual/java-sdk/reference-manual/architecture/multi-instance/).

```java
ServiceConfig<DemoService> service = new ServiceConfig<>();
service.setInterface(DemoService.class);
service.setRef(new DemoServiceImpl());

ReferenceConfig<DemoService> reference1 = new ReferenceConfig<>();
reference1.setInterface(DemoService.class);

ReferenceConfig<DemoService> reference2 = new ReferenceConfig<>();
reference2.setInterface(DemoService.class);

// Create a launcher (automatically create a new ApplicationModel)
DubboBootstrap bootstrap1 = DubboBootstrap.newInstance();
// Specify application name
bootstrap1.application(new ApplicationConfig("dubbo-demo-app-1"))
	.registry(new RegistryConfig("nacos://localhost:8848"))
	// Create a module
	.newModule()
		// Publish service within the module
		.service(service)
	.endModule()
	// Create another module
	.newModule()
		// Subscribe to service within the module
		.reference(reference1)
	.endModule()
	.start();

// Create another launcher (automatically create a new ApplicationModel)
DubboBootstrap bootstrap2 = DubboBootstrap.newInstance();
// Specify application name
bootstrap2.application(new ApplicationConfig("dubbo-demo-app-2"))
	.registry(new RegistryConfig("nacos://localhost:8848"))
	// Create a module
	.newModule()
		// Subscribe to service within the module
		.reference(reference2)
	.endModule()
	.start();

// stub1 and stub2 are two independent subscriptions, completely isolated

// Subscribed stub
DemoService stub1 = reference1.get();
System.out.println(stub1.sayHello("Hello World!"));

// Subscribed stub
DemoService stub2 = reference2.get();
System.out.println(stub2.sayHello("Hello World!"));

bootstrap1.stop();
bootstrap2.stop();
```

This example exposes a service of DemoService, provided by the application dubbo-demo-app-1. Simultaneously, we created two subscriptions, one in the application dubbo-demo-app-1 and another in dubbo-demo-app-2, and then invoked the subscriptions to obtain the expected results.

It is worth noting that although the service information for both subscriptions is entirely consistent, after the multi-instance transformation, these two subscriptions are completely isolated for the consumer side, meaning that the latest version of Dubbo now supports creating multiple subscriptions by changing parameters in a way similar to tuples.

