---
type: docs
title: "API Configuration"
linkTitle: "API Configuration"
weight: 2
description: "Use API to configure your Dubbo application"
---

Assemble configuration, start Dubbo, publish and subscribe services through API coding. This method can support dynamic creation of ReferenceConfig/ServiceConfig, combined with generalized calls to meet the needs of API Gateway or test platform.

> Reference [API Samples](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api)

## service provider

Expose the service interface through ServiceConfig, and publish the service interface to the registration center.

> Note: In order to better support Dubbo3 application-level service discovery, it is recommended to use the new [DubboBootstrap API](#bootstrap-api).

```java
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ProviderConfig;
import org.apache.dubbo.config.ServiceConfig;
import com.xxx.DemoService;
import com.xxx.DemoServiceImpl;

public class DemoProvider {
    public static void main(String[] args) {
        // service implementation
        DemoService demoService = new DemoServiceImpl();

        // current application configuration
        ApplicationConfig application = new ApplicationConfig();
        application.setName("demo-provider");

        // connect registry configuration
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("zookeeper://10.20.130.230:2181");

        // service provider protocol configuration
        ProtocolConfig protocol = new ProtocolConfig();
        protocol.setName("dubbo");
        protocol.setPort(12345);
        protocol.setThreads(200);

        // Note: ServiceConfig is a heavy object, which internally encapsulates the connection with the registration center and opens the service port
        // The service provider exposes the service configuration
        ServiceConfig<DemoService> service = new ServiceConfig<DemoService>(); // This instance is very heavy and encapsulates the connection with the registration center, please cache it yourself, otherwise it may cause memory and connection leaks
        service. setApplication(application);
        service.setRegistry(registry); // Multiple registries can use setRegistries()
        service.setProtocol(protocol); // multiple protocols can use setProtocols()
        service.setInterface(DemoService.class);
        service.setRef(demoService);
        service.setVersion("1.0.0");

        // expose and register services
        service. export();

        // Suspend waiting (to prevent the process from exiting)
        System.in.read();
    }
}
```

## Service Consumer

Reference the remote service through ReferenceConfig, and subscribe to the service interface from the registry.

> Note: In order to better support Dubbo3 application-level service discovery, it is recommended to use the new [DubboBootstrap API](#bootstrap-api).

```java
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ConsumerConfig;
import org.apache.dubbo.config.ReferenceConfig;
import com.xxx.DemoService;

public class DemoConsumer {
    public static void main(String[] args) {
        // current application configuration
        ApplicationConfig application = new ApplicationConfig();
        application.setName("demo-consumer");

        // connect registry configuration
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("zookeeper://10.20.130.230:2181");

        // Note: ReferenceConfig is a heavy object, which internally encapsulates the connection with the registry and the connection with the service provider
        // reference the remote service
        ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>(); // This instance is very heavy and encapsulates the connection with the registry and the provider, please cache it yourself, otherwise it may cause memory and connection leaks
        reference.setApplication(application);
        reference.setRegistry(registry); // Multiple registries can use setRegistries()
        reference.setInterface(DemoService.class);
        reference.setVersion("1.0.0");

        // use demoService like local bean
        // Note: This proxy object internally encapsulates all communication details, the object is heavy, please cache and reuse
        DemoService demoService = reference. get();
        demoService.sayHello("Dubbo");
    }
}
```

## Bootstrap API

DubboBootstrap API can reduce repeated configuration, better control the startup process, support batch publishing/subscribing service interfaces, and better support Dubbo3's application-level service discovery.

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

        // service provider protocol configuration
        ProtocolConfig protocol = new ProtocolConfig();
        protocol.setName("dubbo");
        protocol.setPort(12345);
        protocol.setThreads(200);

        // Note: ServiceConfig is a heavy object, which internally encapsulates the connection with the registration center and opens the service port
        // The service provider exposes the service configuration
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

        // Use DubboBootstrap to simplify configuration assembly and control the startup process
        DubboBootstrap. getInstance()
                .application("demo-provider") // application configuration
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181")) // registry configuration
                .protocol(protocol) // global default protocol configuration
                .service(demoServiceConfig) // add ServiceConfig
                .service(fooServiceConfig)
                .start() // start Dubbo
                .await(); // suspend waiting (to prevent the process from exiting)
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

        // reference the remote service
        ReferenceConfig<DemoService> demoServiceReference = new ReferenceConfig<DemoService>();
        demoServiceReference.setInterface(DemoService.class);
        demoServiceReference.setVersion("1.0.0");

        ReferenceConfig<FooService> fooServiceReference = new ReferenceConfig<FooService>();
        fooServiceReference.setInterface(FooService.class);
        fooServiceReference.setVersion("1.0.0");

        // Use DubboBootstrap to simplify configuration assembly and control the startup process
        DubboBootstrap bootstrap = DubboBootstrap. getInstance();
        bootstrap.application("demo-consumer") // application configuration
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181")) // registry configuration
                .reference(demoServiceReference) // add ReferenceConfig
                .service(fooServiceReference)
                .start(); // Start Dubbo

        ...

        // use demoService like local bean
        // Obtain the remote service interface proxy through Interface, without relying on the ReferenceConfig object
        DemoService demoService = DubboBootstrap.getInstance().getCache().get(DemoService.class);
        demoService.sayHello("Dubbo");

        FooService fooService = DubboBootstrap.getInstance().getCache().get(FooService.class);
        fooService. greeting("Dubbo");
    }

}

```

## Other configuration

- basic configuration
- Method level configuration
- Point-to-point direct connection

The API provides the most flexible and rich configuration capabilities, the following are some examples of configurable components.

#### basic configuration

Global basic configuration can be set in DubboBootstrap, including application configuration, protocol configuration, registration center, configuration center, metadata center, module, monitoring, SSL, provider configuration, consumer configuration, etc.

```java
// registry
RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://192.168.10.1:2181");
...

// service provider protocol configuration
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("dubbo");
protocol.setPort(12345);
protocol.setThreads(200);
...

// configuration center
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("zookeeper://192.168.10.2:2181");
...

// metadata center
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

// Provider configuration (ServiceConfig default configuration)
ProviderConfig provider = new ProviderConfig();
provider.setGroup("demo");
provider.setVersion("1.0.0");
...

// Consumer configuration (ReferenceConfig default configuration)
ConsumerConfig consumer = new ConsumerConfig();
consumer.setGroup("demo");
consumer.setVersion("1.0.0");
consumer.setTimeout(2000);
...

DubboBootstrap. getInstance()
    .application("demo-app")
    .registry(registry)
    .protocol(protocol)
    .configCenter(configCenter)
    .metadataReport(metadataReport)
    .module(new ModuleConfig("module"))
    .metrics(metrics)
  .ssl (ssl)
  .provider(provider)
  .consumer(consumer)
  ...
  .start();

```

#### Method level settings

```java
...

// method-level configuration
List<MethodConfig> methods = new ArrayList<MethodConfig>();
MethodConfig method = new MethodConfig();
method. setName("sayHello");
method.setTimeout(10000);
method. setRetries(0);
methods. add(method);

// reference the remote service
ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>(); // This instance is very heavy and encapsulates the connection with the registry and the provider, please cache it yourself, otherwise it may cause memory and connection leaks
...
reference.setMethods(methods); // Set method-level configuration

...
```

#### Point-to-point direct connection

```java

...

// This instance is very heavy, it encapsulates the connection with the registry and the provider, please cache it yourself, otherwise it may cause memory and connection leaks
ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>();
// If point-to-point direct connection, you can use reference.setUrl() to specify the target address. After setting the url, the registration center will be bypassed.
// Among them, the protocol corresponds to the value of provider.setProtocol(), and the port corresponds to the value of provider.setPort().
// The path corresponds to the value of service.setPath(). If no path is set, the default path is the interface name
reference.setUrl("dubbo://10.20.130.230:20880/com.xxx.DemoService");

...
```