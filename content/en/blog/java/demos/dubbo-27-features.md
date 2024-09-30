---
title: "Detailed Explanation of Three Major New Features in Dubbo 2.7"
linkTitle: "Detailed Explanation of Three Major New Features in Dubbo 2.7"
tags: ["Java"]
date: 2018-08-15
description: >
    Asynchronous transformation, transformation of three major centers, enhanced service governance
---

## 1 Background Introduction

Since Alibaba relaunched Dubbo as an open-source project in July 2017, there has been a significant increase in GitHub stars and contributors. On February 9, 2018, Alibaba decided to donate the Dubbo project to Apache, and after a week of voting, it successfully became an Apache incubation project, currently known as **Incubator Dubbo**. It is expected that by April 2019, Dubbo will graduate and become a top-level Apache project.

## 2 Branch Introduction

![Branches](/imgs/blog/270/branches.png)

Dubbo currently has five branches as shown in the figure, among which 2.7.1-release is just a temporary branch and can be ignored; the other four branches will be introduced.

- 2.5.x is approaching the end of its maintenance.
- 2.6.x is a long-term support version, which is also the version of Dubbo prior to its contribution to Apache, with package prefix: com.alibaba, and JDK version corresponding to 1.6.
- 3.x-dev is a forward-looking version that adds some advanced features to Dubbo, such as supporting rx features.
- master is a long-term supported version, version number 2.7.x, which is the development version of Dubbo contributed to Apache, with package prefix: org.apache, and JDK version corresponding to 1.8.

> If you want to study the Dubbo source code, it is recommended to browse the master branch directly.

## 3 New Features of Dubbo 2.7

Dubbo 2.7.x, as the Apache incubation version, has introduced many heavyweight new features in addition to code optimization. This article will introduce three of the most typical new features:

- Asynchronous transformation
- Transformation of three major centers
- Enhanced service governance

## 4 Asynchronous Transformation

### 4.1 Several Calling Methods

![Calling Methods](/imgs/blog/270/invokes.png)

In remote method calls, there are roughly four types of calling methods. The oneway method means that the client sends a message without needing to receive a response. For requests that do not care about the server response, oneway communication is more suitable.

> Note that the void hello() method does not belong to oneway calls in remote method calls, although the void method implies the disregard for return values, it still requires a communication layer response at the RPC level.

sync is the most commonly used communication method and is the default communication method.

future and callback both fall into the category of asynchronous calls, with the difference being: receiving responses using future.get() will cause thread blocking; callbacks typically set a callback thread that automatically executes upon receiving a response without blocking the current thread.

### 4.2 Dubbo 2.6 Asynchronous

The advantage of asynchronous calls is that clients do not need to start multiple threads to achieve parallel calls to multiple remote services, which is relatively lightweight compared to multi-threading. Before introducing asynchronous changes in 2.7, let's review how to use Dubbo's asynchronous capabilities in 2.6.

1. Declare the synchronous interface as `async=true`
    ```xml
    <dubbo:reference id="asyncService" interface="org.apache.dubbo.demo.api.AsyncService" async="true"/>
    ```
    ```java
    public interface AsyncService {
        String sayHello(String name);
    }
    ```
2. Obtain future through the context class
    ```java
    AsyncService.sayHello("Han Meimei");
    Future<String> fooFuture = RpcContext.getContext().getFuture();
    fooFuture.get();
    ```

This usage approach does not conform to asynchronous programming habits and requires obtaining the Future from a context class. If multiple asynchronous calls are made simultaneously, improper usage can easily lead to context pollution. Moreover, Future does not support callback calling methods. These drawbacks have been improved in Dubbo 2.7.

### 4.3 Dubbo 2.7 Asynchronous

1. No special declaration in configuration is needed; just explicitly declare the asynchronous interface
    ```java
    public interface AsyncService {
        String sayHello(String name);
        default CompletableFuture<String> sayHiAsync(String name) {
            return CompletableFuture.completedFuture(sayHello(name));
        }
    }
    ```
2. Use callback methods to handle return values
    ```java
    CompletableFuture<String> future = asyncService.sayHiAsync("Han MeiMei");
    future.whenComplete((retValue, exception) -> {
        if (exception == null) {
            System.out.println(retValue);
        } else {
            exception.printStackTrace();
        }
    });
    ```

Dubbo 2.7 has improved its asynchronous capabilities by utilizing the native interface `CompletableFuture` provided by JDK 1.8. `CompletableFuture` supports both future and callback calling methods, providing users with great flexibility to choose based on their preferences and scenarios.

### 4.4 Asynchronous Design FAQ

Q: If the RPC interface only defines synchronous interfaces, is there a way to use asynchronous calls?

A: The only advantage of asynchronous calls in 2.6 was that they could be executed without modifying the interface layer, and this method is still retained in 2.7; by using the compiler hacker provided by Dubbo, synchronous methods can be automatically rewritten at compile time, please [discuss and follow up here](https://github.com/dubbo/dubbo-async-processor#compiler-hacker-processer).

---

Q: Regarding the design of asynchronous interfaces, why not provide a compiler plugin to automatically compile an XxxAsync interface based on the original interface?

A: Dubbo 2.7 adopted this design, but the proliferation of interfaces led to incremental releases of service classes and the change in interface names affected some relevant logic in service governance. Adding `Async` as a suffix to methods had a relatively smaller impact.

---

Q: Dubbo is divided into client asynchronous and server asynchronous; you just introduced client asynchronous, why not mention server asynchronous?

A: Dubbo 2.7 added support for server asynchronous, but in fact, the business thread pool model of Dubbo itself can be understood as asynchronous calls. I believe that the features of server asynchronous are somewhat redundant.

## 5 Transformation of Three Major Centers

The three major centers refer to: the registry center, the metadata center, and the configuration center.

Before version 2.7, Dubbo was only equipped with a registry center, with the mainstream registry being Zookeeper. The addition of the metadata center and configuration center was naturally to solve corresponding pain points, and below we will explain in detail the reasons for the transformation of the three major centers.

### 5.1 Metadata Transformation

What is metadata? Metadata is defined as data that describes other data. In service governance, metadata such as service interface names, retry counts, version numbers, etc., can all be understood as metadata. Before 2.7, metadata was indiscriminately tossed into the registry center, causing a series of problems:

**Large Push Volume -> Large Storage Volume -> Large Network Transmission -> Significant Latency**

Producers register 30+ parameters, with nearly half not needing to be passed to the registry center; consumers register 25+ parameters, with only a few needing to be passed. With the above theoretical analysis, Dubbo 2.7 made major changes, only publishing data that truly belongs to service governance to the registry center, greatly reducing the load on the registry center.

At the same time, all metadata is published to another component: the metadata center. The metadata center currently supports Redis (recommended) and Zookeeper. This also prepares for the new Dubbo Admin in Dubbo 2.7. I will prepare a separate article to discuss the new version of Dubbo Admin in the future.

Example: Using Zookeeper as the metadata center

```xml
<dubbo:metadata-report address="zookeeper://127.0.0.1:2181"/>
```

### 5.2 Dubbo 2.6 Metadata 

```shell
dubbo://30.5.120.185:20880/com.alibaba.dubbo.demo.DemoService?
anyhost=true&
application=demo-provider&
interface=com.alibaba.dubbo.demo.DemoService&
methods=sayHello&
bean.name=com.alibaba.dubbo.demo.DemoService&
dubbo=2.0.2&
executes=4500&
generic=false&
owner=kirito&
pid=84228&
retries=7&
side=provider&
timestamp=1552965771067
```

From the local Zookeeper, a service data entry is retrieved, and upon decoding, it can be seen that many parameters are indeed unnecessary.

### 5.3 Dubbo 2.7 Metadata

In 2.7, if no additional configuration is made, the data format in Zookeeper will remain consistent with Dubbo 2.6 mainly for compatibility, allowing Dubbo 2.6 clients to call Dubbo 2.7 servers. If migrating entirely to 2.7, configuration parameters can be simplified for the registry center:

```xml
<dubbo:registry address="zookeeper://127.0.0.1:2181" simplified="true"/>
```

Dubbo will only upload the necessary service governance data, and a simplified data entry is shown below:

```shell
dubbo://30.5.120.185:20880/org.apache.dubbo.demo.api.DemoService?
application=demo-provider&
dubbo=2.0.2&
release=2.7.0&
timestamp=1552975501873
```

Non-essential service information will still be stored in full in the metadata center:

![Metadata](/imgs/blog/270/metadata.png)

> Data in the metadata center can be used for service testing, service MOCK, etc. Currently, the default value of simplified in registry center configurations is false due to migration compatibility issues, which will be changed to true in subsequent iterations.

### 5.4 Configuration Center Support

The necessity of a configuration center is often evaluated from three perspectives:

1. Unified management of distributed configurations

2. Dynamic change push

3. Security

Components such as Spring Cloud Config, Apollo, Nacos, etc., offer varying degrees of support for the aforementioned features. In versions before 2.7, specific nodes in Zookeeper were set up: configurators, routers, used to manage some configuration and routing information; they can be understood as a primitive configuration center for Dubbo. In 2.7, Dubbo officially supports configuration centers, with supported registry centers being Zookeeper, Apollo, Nacos (supported in 2.7.1-release).

In Dubbo, the configuration center primarily serves two functions:

- Externalized configuration: centralized storage for startup configurations

- Service governance: storage and notification of service governance rules

Example: Using Zookeeper as the configuration center

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

After introducing the configuration center, care must be taken with configuration item overrides, with priorities as shown in the figure.

![Configuration Override Priority](/imgs/blog/configuration.jpg)

## 6 Enhanced Service Governance

I prefer to view Dubbo as a service governance framework rather than merely an RPC framework. In 2.7, Dubbo has enhanced its service governance capabilities by adding tag routing and abstracting the concepts of application routing and service routing. In the final feature introduction, we will focus on the TagRouter.

> In service governance, the comparison between routing layer and load balancing layer. Distinction 1, Router: m selects n, LoadBalance: n selects 1; Distinction 2, routing is usually combined, while load balancing can only configure one.

For a long time, a common question raised by the Dubbo community was: How does Dubbo achieve traffic isolation and gray release? With the introduction of tag routing in 2.7, users can utilize this feature to meet the above needs.

![Tag Routing](/imgs/blog/270/tag-route.png)

Tag routing provides the capability that when the call link is A -> B -> C -> D, the user can apply tags to the request. The most typical tagging method can utilize attachments (they can be passed along in distributed calls), and the call will prioritize requesting those matched servers, such as A -> B, C -> D. If the C node is not deployed in the cluster, it will degrade to ordinary nodes.

Tagging methods may be influenced by the differences in integrated systems, leading to significant variance. Therefore, Dubbo only provides the basic interface `RpcContext.getContext().setAttachment()` allowing users to use SPI extension or server filter extension to tag test traffic, guiding it into isolated environments/gray environments.

The new version of Dubbo Admin provides configuration options for tag routing:

![Tag Routing Configuration](/imgs/blog/270/tag-route-config.png)

Dubbo users can extend tag routing based on their own systems or refer to the design of tag routing to achieve traffic isolation and gray release in their systems.

## 7 Conclusion

This article introduced three important new features of Dubbo 2.7: asynchronous transformation, transformation of three major centers, and enhanced service governance. Dubbo 2.7 also includes many functional optimizations and feature upgrades, which can be explored in the project's source code in [CHANGES.md](https://github.com/apache/dubbo/blob/master/CHANGES.md). Finally, a migration document for Dubbo 2.7 is provided: [2.7 Migration Document](/en/docsv2.7/user/versions/version-270/), welcome to experience.

