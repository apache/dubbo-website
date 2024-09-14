---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/api/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/api/
description: 以 API 的方式来配置你的 Dubbo 应用
linkTitle: API 配置
title: API 配置
type: docs
weight: 2
---

作为一款 RPC 框架，Dubbo 定义了一套完善的 API 接口，我们可以基于原生 API 开发 Dubbo 应用，关于如何使用原生API开发轻量RPC、微服务应用等的具体示例可查看 [使用教程 - API开发模式](/zh-cn/overview/mannual/java-sdk/tasks/develop/api/) 中的示例。它的适用场景包括以下两类：
* **轻量 RPC Server & Client**，通常用于一些应用内、基础组件、中间件等内的简单远程调用场景
* **微服务应用**，不依赖 Spring、Spring Boot 的情况下，直接用 API 开发微服务；同时，直接使用 API 对于一些网关或测试平台集成场景也可能比较有用。

目前的入口 API 主要有 `Bootstrap`、`ServiceConfig`、`ReferenceConfig` 等，分别用于不同场景下的 Dubbo 应用开发。

## Bootstrap API

DubboBootstrap 实例代表一个 Dubbo 应用，是整个 Dubbo 应用的启动入口。在 DubboBootstrap 基础上，我们可以设置 protocol、service、registry、metrics 等来注册服务、连接注册中心等，这和我们在 Spring Boot 中调整 application.yml 或者 application.properties 文件是对等的作用。

官方推荐使用 DubboBootstrap.start() 作为应用的集中启动入口，但为了方便在进程启动后，在运行态单独发布一些服务，Dubbo 也允许直接调用 ServiceConfig.export() 或 ReferenceConfig.refer() 方法发布服务，这时 Service/Reference 会注册到默认的 DubboBootstrap 实例中，效果同调用 DubboBootstrap.service(...).start() 类似。

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

        FooService fooService = fooServiceReference.get();
        fooService.greeting("Dubbo");
    }

}
```

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

## ServiceConfig

通过 ServiceConfig 可以直接发布服务，将服务接口注册到内存列表和注册中心。这对于一些需要动态发布服务的场景可能非常有用。

> 注意：对于普通的应用开发场景，我们更推荐使用 [DubboBootstrap API](#bootstrap-api)。

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

## ReferenceConfig

通过 ReferenceConfig 引用远程服务，从注册中心订阅服务接口。这对于一些需要动态发布服务的场景是可能会非常有用。

> 注意：对于普通应用开发，我们推荐使用 [DubboBootstrap API](#bootstrap-api)。

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

## 多实例部署

多实例部署的背景起源于 Dubbo 在阿里集团内的大规模应用部署场景，阿里集团遇到的问题主要有：
1. 阿里集团内有众多的中间件框架，这些框架提供了各种各样的类加载方式，不同的业务方期望在同一应用内的配置等信息是相互隔离的。
2. 一些业务方的定制逻辑需要支持动态热部署模式，具体体现在动态对某个虚拟环境进行销毁，这需要 Dubbo 内的生命周期管理更加完善。
3. 阿里集团内有多个对 Spring 容器进行定制化开发的框架，需要 Dubbo 能够支持多个 Spring Context 独立管理生命周期的场景。

![多实例架构图](/imgs/v3/manual/java/multi-instance/arch.png)


整个 Dubbo 多实例的设计我们按照了三层模型来配置，分别是 Framework 框架层、Application 应用层、Module 模块层。

基于三层机制，我们可以将 Dubbo 按照一定规则进行隔离：
1. Framework 与 Framework 之间完全隔离，相当于是使用了两个完全不同的 Dubbo 实例
2. Application 与 Application 之间按照应用名进行隔离，但是相互有些地共享 Protocol、Serialization 层，目标是达到在同一个 dubbo 端口（20880）上可以承载多个应用，而每个应用独立上报地址信息。
3. Module 与 Module 之间可以由用户自定义进行进行隔离，可以是热部署周期的一个状态、也可以是 Spring Context 的一个 Context。通过 Module，用户可以对 Dubbo 的生命周期粒度进行最小的管理。

为了实现 Dubbo 多实例化，Dubbo 框架内做的最多的变化是修改掉大部分的从静态变量中获取的参数的逻辑，最明显的逻辑是 Dubbo 内部用于参数传递的 URL 对象带上了 ScopeModel 状态，这个 ScopeModel 对应的就是上面提到的三层模型的具体数据承载对象。
关于多示例的更多实现原理、设计细节等，请参考 [源码架构 - 多实例设计与实现](/zh-cn/overview/mannual/java-sdk/reference-manual/architecture/multi-instance/)。


```java
ServiceConfig<DemoService> service = new ServiceConfig<>();
service.setInterface(DemoService.class);
service.setRef(new DemoServiceImpl());

ReferenceConfig<DemoService> reference1 = new ReferenceConfig<>();
reference1.setInterface(DemoService.class);

ReferenceConfig<DemoService> reference2 = new ReferenceConfig<>();
reference2.setInterface(DemoService.class);

// 创建一个启动器（自动创建新 ApplicationModel）
DubboBootstrap bootstrap1 = DubboBootstrap.newInstance();
// 指定应用名
bootstrap1.application(new ApplicationConfig("dubbo-demo-app-1"))
	.registry(new RegistryConfig("nacos://localhost:8848"))
	// 创建一个模块
	.newModule()
		// 在模块内发布服务
		.service(service)
	.endModule()
	// 创建一个模块
	.newModule()
		// 在模块内订阅服务
		.reference(reference1)
	.endModule()
	.start();

// 创建一个启动器（自动创建新 ApplicationModel）
DubboBootstrap bootstrap2 = DubboBootstrap.newInstance();
// 指定应用名
bootstrap2.application(new ApplicationConfig("dubbo-demo-app-2"))
	.registry(new RegistryConfig("nacos://localhost:8848"))
	// 创建一个模块
	.newModule()
		// 在模块内订阅服务
		.reference(reference2)
	.endModule()
	.start();

// stub1 与 stub2 是两个独立的订阅，互相隔离

// 订阅的 stub
DemoService stub1 = reference1.get();
System.out.println(stub1.sayHello("Hello World!"));

// 订阅的 stub
DemoService stub2 = reference2.get();
System.out.println(stub2.sayHello("Hello World!"));

bootstrap1.stop();
bootstrap2.stop();
```

这个例子对外发布了一个 DemoService 的服务，由 dubbo-demo-app-1 这个应用提供。同时我们创建了两个订阅，分别是在 dubbo-demo-app-1 应用和 dubbo-demo-app-2 应用中，然后我们去对两个订阅进行调用，得到预期的结果。

这里需要注意的是虽然两个订阅的服务信息是完全一致的，在多实例化改造后，这两个订阅对于消费端来说是完全隔离的，也就是在最新版本的 Dubbo 中是支持三元组一样的情况下通过变更参数来创建多个订阅的行为的了。

