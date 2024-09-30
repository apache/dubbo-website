---
description: "The design principles, implementation, and usage methods for multi-instance and multi-application in Dubbo."
linkTitle: Multi-instance Design Concept
title: Design Concept for Multi-instance Deployment
type: docs
weight: 1
---

## Background

Java's static variable capability allows binding behaviors holding object references to classes, providing significant convenience to developers. Implementation solutions for design patterns like Singleton and Factory rely on static variables. By using static variables, developers can easily access needed object information anytime, anywhere.
```java
public class Test {
    public static Object obj;
}
Test.obj = xxx;
```
In the long-standing development of the Dubbo framework, static variables have been widely used, such as using a globally shared ConfigManager to store global configuration information, and ServiceRepository to store service information. This design is optimal from the perspective of centralized management of configuration or parameter acquisition. In all versions before Dubbo 2.7, runtime configuration information needed by Dubbo was accessed through global static variables, uniquely identified via the RPC service triplet (interface + version + group).

However, with the growing user base of Dubbo and challenges brought by the HSF3 framework, which uses Dubbo as its core, new requirements have emerged.

For open-source users, the community feedback mainly includes:

1. The ability to create multiple identical triplet subscriptions within the same application. While Dubbo 2.7 does not strictly limit this behavior, many parameters are sourced from global settings, and the indexing used for retrieval relies on triplets. If users create two identical triplet subscriptions, their parameters could overwrite each other, significantly impacting functionalities such as address pushing.
2. Java provides a mechanism for custom ClassLoader, but Dubbo does not support scenarios requiring multiple ClassLoaders, lacking ClassLoader switching behavior in dynamic proxy generation and serialization.
3. Numerous test cases in Dubbo share the same configuration information, leading to environmental pollution during unit testing.

For large-scale implementations within Alibaba Group, the main challenges include:

1. Numerous middleware frameworks within Alibaba offer various class loading methods, while business parties expect configuration and other information within the same application to be isolated.
2. Customized logic for some business parties needs to support dynamic hot deployment, specifically demonstrated in dynamically destroying certain virtual environments, requiring improved lifecycle management within Dubbo.
3. Multiple frameworks within the group customizing the Spring container require Dubbo to support scenarios with multiple Spring Contexts managing lifecycles independently.

Based on these reasons, we decided to refactor Dubbo's lifecycle in early August. After a month of intensive development, the community version now fully supports multi-instantiation, and Dubbo's lifecycle has become clearer.

## Design

The entire design of Dubbo's multi-instance is configured according to a three-layer model: Framework layer, Application layer, and Module layer.
![image.png](https://cdn.nlark.com/yuque/0/2021/png/209479/1633766738924-498b5ac4-d96b-48f4-a55f-8cc946800bee.png#clientId=uc9c7eb9b-dec6-4&from=paste&height=446&id=ub35f4a80&originHeight=892&originWidth=2366&originalType=binary&ratio=1&size=483065&status=done&style=none&taskId=u01b03e88-733f-422b-94ea-cf45220737c&width=1183)
Based on this three-layer mechanism, we can isolate Dubbo according to specific rules:

1. Complete isolation between Frameworks, essentially using two entirely different Dubbo instances.
2. Isolation between Applications based on application names while sharing Protocol and Serialization layers minimally, aiming to host multiple applications on the same Dubbo port (20880) while each application independently reports address information.
3. Isolation between Modules can be user-defined, representing either a state of a hot-deployment cycle or a Spring Context. Through Modules, users can perform minimal lifecycle management of Dubbo.

To achieve Dubbo multi-instantiation, many of the logic changes within the Dubbo framework involved altering the processes that obtained parameters from static variables. The most notable change is that the URL object used for parameter passing within Dubbo now carries ScopeModel status, corresponding to the specific data carrier of the mentioned three-layer model.

## Usage

The multi-instance refactoring of Dubbo is largely seamless for most users. The modified DubboBootstrap has been transformed into an independent launcher, allowing users to customize the use of multiple instances.

Here’s a simple example of using multiple instances.

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
        // Create a module
        .newModule()
        	// Subscribe to service within the module
    		.reference(reference1)
        .endModule()
        .start();

	// Create a launcher (automatically create a new ApplicationModel)
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

	// stub1 and stub2 are two independent subscriptions, isolated from each other.

	// Subscribed stub
    DemoService stub1 = reference1.get();
    System.out.println(stub1.sayHello("Hello World!"));

	// Subscribed stub
    DemoService stub2 = reference2.get();
    System.out.println(stub2.sayHello("Hello World!"));

    bootstrap1.stop();
    bootstrap2.stop();
```

This example exposes a DemoService, provided by the application dubbo-demo-app-1. At the same time, we create two subscriptions, in the applications dubbo-demo-app-1 and dubbo-demo-app-2, and we call both subscriptions to achieve the expected results.

It is worth noting that although the service information of the two subscriptions is completely identical, after the multi-instantiation modification, these subscriptions are entirely isolated from the consumer's perspective. The latest version of Dubbo now supports the behavior of creating multiple subscriptions by changing parameters, even when the triplets are identical.

