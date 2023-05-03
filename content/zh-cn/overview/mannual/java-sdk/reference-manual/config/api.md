---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/api/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/api/
description: 以 API 的方式来配置你的 Dubbo 应用
linkTitle: ' API 配置'
title: API 配置
type: docs
weight: 2
---






通过 API 编码方式组装配置、启动 Dubbo、发布及订阅服务。此方式可以支持动态创建 ReferenceConfig/ServiceConfig，结合泛化调用可以满足 API Gateway 或测试平台的需要。

> 参考 [API示例](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api)

## 服务提供者

通过 ServiceConfig 暴露服务接口，发布服务接口到注册中心。

> 注意：为了更好支持 Dubbo3 应用级服务发现，推荐使用新的 [DubboBootstrap API](#bootstrap-api)。

```java
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ProviderConfig;
import org.apache.dubbo.config.ServiceConfig;
import com.xxx.DemoService;
import com.xxx.DemoServiceImpl;

public class DemoProvider {
    public static void main(String[] args) {
        // 服务实现
        DemoService demoService = new DemoServiceImpl();

        // 当前应用配置
        ApplicationConfig application = new ApplicationConfig();
        application.setName("demo-provider");

        // 连接注册中心配置
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("zookeeper://10.20.130.230:2181");

        // 服务提供者协议配置
        ProtocolConfig protocol = new ProtocolConfig();
        protocol.setName("dubbo");
        protocol.setPort(12345);
        protocol.setThreads(200);

        // 注意：ServiceConfig为重对象，内部封装了与注册中心的连接，以及开启服务端口
        // 服务提供者暴露服务配置
        ServiceConfig<DemoService> service = new ServiceConfig<DemoService>(); // 此实例很重，封装了与注册中心的连接，请自行缓存，否则可能造成内存和连接泄漏
        service.setApplication(application);
        service.setRegistry(registry); // 多个注册中心可以用setRegistries()
        service.setProtocol(protocol); // 多个协议可以用setProtocols()
        service.setInterface(DemoService.class);
        service.setRef(demoService);
        service.setVersion("1.0.0");

        // 暴露及注册服务
        service.export();

        // 挂起等待(防止进程退出）
        System.in.read();
    }
}
```

## 服务消费者

通过 ReferenceConfig 引用远程服务，从注册中心订阅服务接口。

> 注意：为了更好支持 Dubbo3 应用级服务发现，推荐使用新的 [DubboBootstrap API](#bootstrap-api)。

```java
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ConsumerConfig;
import org.apache.dubbo.config.ReferenceConfig;
import com.xxx.DemoService;

public class DemoConsumer {
    public static void main(String[] args) {
        // 当前应用配置
        ApplicationConfig application = new ApplicationConfig();
        application.setName("demo-consumer");

        // 连接注册中心配置
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("zookeeper://10.20.130.230:2181");

        // 注意：ReferenceConfig为重对象，内部封装了与注册中心的连接，以及与服务提供方的连接
        // 引用远程服务
        ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>(); // 此实例很重，封装了与注册中心的连接以及与提供者的连接，请自行缓存，否则可能造成内存和连接泄漏
        reference.setApplication(application);
        reference.setRegistry(registry); // 多个注册中心可以用setRegistries()
        reference.setInterface(DemoService.class);
        reference.setVersion("1.0.0");

        // 和本地bean一样使用demoService
        // 注意：此代理对象内部封装了所有通讯细节，对象较重，请缓存复用
        DemoService demoService = reference.get();
        demoService.sayHello("Dubbo");
    }
}
```

## Bootstrap API

通过 DubboBootstrap API 可以减少重复配置，更好控制启动过程，支持批量发布/订阅服务接口，还可以更好支持 Dubbo3 的应用级服务发现。

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

        // 服务提供者协议配置
        ProtocolConfig protocol = new ProtocolConfig();
        protocol.setName("dubbo");
        protocol.setPort(12345);
        protocol.setThreads(200);

        // 注意：ServiceConfig为重对象，内部封装了与注册中心的连接，以及开启服务端口
        // 服务提供者暴露服务配置
        ServiceConfig<DemoService> demoServiceConfig = new ServiceConfig<>();
        demoServiceConfig.setInterface(DemoService.class);
        demoServiceConfig.setRef(new DemoServiceImpl());
        demoServiceConfig.setVersion("1.0.0");

        // 第二个服务配置
        ServiceConfig<FooService> fooServiceConfig = new ServiceConfig<>();
        fooServiceConfig.setInterface(FooService.class);
        fooServiceConfig.setRef(new FooServiceImpl());
        fooServiceConfig.setVersion("1.0.0");

        ...

        // 通过DubboBootstrap简化配置组装，控制启动过程
        DubboBootstrap.getInstance()
                .application("demo-provider") // 应用配置
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181")) // 注册中心配置
                .protocol(protocol) // 全局默认协议配置
                .service(demoServiceConfig) // 添加ServiceConfig
                .service(fooServiceConfig)
                .start()    // 启动Dubbo
                .await();   // 挂起等待(防止进程退出）
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

        // 引用远程服务
        ReferenceConfig<DemoService> demoServiceReference = new ReferenceConfig<DemoService>();
        demoServiceReference.setInterface(DemoService.class);
        demoServiceReference.setVersion("1.0.0");

        ReferenceConfig<FooService> fooServiceReference = new ReferenceConfig<FooService>();
        fooServiceReference.setInterface(FooService.class);
        fooServiceReference.setVersion("1.0.0");

        // 通过DubboBootstrap简化配置组装，控制启动过程
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application("demo-consumer") // 应用配置
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181")) // 注册中心配置
                .reference(demoServiceReference) // 添加ReferenceConfig
                .reference(fooServiceReference)
                .start();    // 启动Dubbo

        ...

        // 和本地bean一样使用demoService
        // 通过Interface获取远程服务接口代理，不需要依赖ReferenceConfig对象
        DemoService demoService = DubboBootstrap.getInstance().getCache().get(DemoService.class);
        demoService.sayHello("Dubbo");

        FooService fooService = DubboBootstrap.getInstance().getCache().get(FooService.class);
        fooService.greeting("Dubbo");
    }

}

```

## 其它配置

API 提供了最灵活丰富的配置能力，以下是一些可配置组件示例。

### 基本配置

可以在 DubboBootstrap 中设置全局基本配置，包括应用配置、协议配置、注册中心、配置中心、元数据中心、模块、监控、SSL、provider 配置、consumer 配置等。

```java
// 注册中心
RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://192.168.10.1:2181");
...

// 服务提供者协议配置
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("dubbo");
protocol.setPort(12345);
protocol.setThreads(200);
...

// 配置中心
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("zookeeper://192.168.10.2:2181");
...

// 元数据中心
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

// Provider配置（ServiceConfig默认配置）
ProviderConfig provider = new ProviderConfig();
provider.setGroup("demo");
provider.setVersion("1.0.0");
...

// Consumer配置（ReferenceConfig默认配置）
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

### 方法级设置

```java
...

// 方法级配置
List<MethodConfig> methods = new ArrayList<MethodConfig>();
MethodConfig method = new MethodConfig();
method.setName("sayHello");
method.setTimeout(10000);
method.setRetries(0);
methods.add(method);

// 引用远程服务
ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>(); // 此实例很重，封装了与注册中心的连接以及与提供者的连接，请自行缓存，否则可能造成内存和连接泄漏
...
reference.setMethods(methods); // 设置方法级配置

...
```

### 点对点直连

```java

...

// 此实例很重，封装了与注册中心的连接以及与提供者的连接，请自行缓存，否则可能造成内存和连接泄漏
ReferenceConfig<DemoService> reference = new ReferenceConfig<DemoService>();
// 如果点对点直连，可以用reference.setUrl()指定目标地址，设置url后将绕过注册中心，
// 其中，协议对应provider.setProtocol()的值，端口对应provider.setPort()的值，
// 路径对应service.setPath()的值，如果未设置path，缺省path为接口名
reference.setUrl("dubbo://10.20.130.230:20880/com.xxx.DemoService");

...
```