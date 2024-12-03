---
description: "Dubbo 多实例、多应用设计原理、实现与使用方法。"
linkTitle: 多实例设计理念
title: 多实例部署的设计理念
type: docs
weight: 1
---

## 背景

Java 提供的静态变量（static field）能力可以将持有对象引用的行为绑定到类上面来，这给开发者提供了巨大的便利。注入单例模式、工厂模式等设计模式的实现方案都依赖了静态变量的功能。通过使用静态变量，开发者可以在任何时间、任何地点简单地获取到所需要的对象信息。
```java
public class Test {
    public static Object obj;
}
Test.obj = xxx;
```
在一直以来的 Dubbo 框架开发中，静态变量受到了广泛地应用，诸如使用一个全局共享的 ConfigManager 来存储全局配置信息、ServiceRepository 来存储服务信息，不论从中心化管理配置或者是参数获取的便利性的角度来说，这种设计都是最佳的。在 Dubbo 2.7 以前的所有版本，Dubbo 所需要的运行时配置信息都通过全局静态变量获取，通过 RPC 服务三元组（interface + version + group）的方式进行唯一定位。

但是随着 Dubbo 用户基数的不断扩大以及在阿里集团内由 Dubbo 作为内核的 HSF3 框架都对原来的这种设计模式提出了挑战。

对于开源用户，社区收到的诉求主要包括以下几点：

1. 在同一个应用内能够创建多个三元组一样的订阅。这个行为在 Dubbo 2.7 中虽然没有做强限制，但是由于 Dubbo 很多参数是取自全局的，而这个获取的索引使用的就是三元组。如果用户创建了两个三元组一样的订阅，他们的参数会被相互覆盖，地址推送等功能也会收到很大的影响。
2. Java 提供了自定义 ClassLoader 的机制可以自定义指定类的加载器来源，但是对于 Dubbo 来说并没有去支持多 ClassLoader 的场景，在动态代理生成和序列化场景下都不支持 ClassLoader 切换的行为。
3. Dubbo 众多的测试用例都共享了同一份配置信息，导致在进行单元测试的时候极为容易造成环境污染的问题。

对于阿里集团内大规模落地来说，我们遇到的问题主要有：

1. 阿里集团内有众多的中间件框架，这些框架提供了各种各样的类加载方式，同时业务方期望在同一应用内的配置等信息是相互隔离的。
2. 一些业务方的定制逻辑需要支持动态热部署的模式，具体体现在动态对某个虚拟环境进行销毁，这需要 Dubbo 内的生命周期管理更加完善。
3. 集团内有多个对 Spring 容器进行定制化开发的框架，需要 Dubbo 能够支持多个 Spring Context 独立管理生命周期的场景。

基于众多的这些原因，在八月初的时候我们决定对 Dubbo 的生命周期进行重构，经过一个月的紧张开发，目前社区版本已经完整支持了多实例化的功能，Dubbo 的生命周期也变得更加清晰。

## 设计

整个 Dubbo 多实例的设计我们按照了三层模型来配置，分别是 Framework 框架层、Application 应用层、Module 模块层。
![image.png](https://cdn.nlark.com/yuque/0/2021/png/209479/1633766738924-498b5ac4-d96b-48f4-a55f-8cc946800bee.png#clientId=uc9c7eb9b-dec6-4&from=paste&height=446&id=ub35f4a80&originHeight=892&originWidth=2366&originalType=binary&ratio=1&size=483065&status=done&style=none&taskId=u01b03e88-733f-422b-94ea-cf45220737c&width=1183)
基于三层机制，我们可以将 Dubbo 按照一定规则进行隔离：

1. Framework 与 Framework 之间完全隔离，相当于是使用了两个完全不同的 Dubbo 实例
2. Application 与 Application 之间按照应用名进行隔离，但是相互有些地共享 Protocol、Serialization 层，目标是达到在同一个 dubbo 端口（20880）上可以承载多个应用，而每个应用独立上报地址信息。
3. Module 与 Module 之间可以由用户自定义进行进行隔离，可以是热部署周期的一个状态、也可以是 Spring Context 的一个 Context。通过 Module，用户可以对 Dubbo 的生命周期粒度进行最小的管理。

为了实现 Dubbo 多实例化，Dubbo 框架内做的最多的变化是修改掉大部分的从静态变量中获取的参数的逻辑，最明显的逻辑是 Dubbo 内部用于参数传递的 URL 对象带上了 ScopeModel 状态，这个 ScopeModel 对应的就是上面提到的三层模型的具体数据承载对象。

## 使用方式

多实例重构版本之后的 Dubbo 对于大多数用户的使用来说是无感知的，改造后的 DubboBootstrap 已经变成一个独立的启动器，用户可以通过 DubboBootstrap 定制多实例的使用。

下面是使用多实例的一个简单的例子。

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



