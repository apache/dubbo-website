---
title: "The Past and Present of Dubbo Go"
linkTitle: "The Past and Present of Dubbo Go"
tags: ["Go", "News"]
date: 2021-01-11
description: This article documents the development history of Dubbo Go
---

![img](/imgs/blog/dubbo-go/dubbo-go-history.png)

dubbo-go is currently the hottest project in the Dubbo multilingual ecosystem. The earliest version of dubbo-go dates back to 2016, when the initial version was written by the community member Yu. At that time, many things didn’t have ready-made solutions, such as the absence of an event-based network processing engine like netty in Go, and the hessian2 protocol didn’t have an implementation in Go. Furthermore, Dubbo had not yet resumed maintenance. Therefore, everything from the protocol library to the network engine, and finally to the upper-level dubbo-go, was essentially written from scratch.

In 2018, Ctrip began developing some middleware for the Go language to build an internal Go ecosystem, necessitating a Go service framework that could interoperate with Ctrip's existing Dubbo SOA ecosystem. Thus, I was responsible for refactoring dubbo-go and open-sourcing this version. At that time, many open-source Go service frameworks were surveyed, and the only one that supported the hessian2 protocol and could connect with Dubbo was the early version of dubbo-go written by Yu. Due to Ctrip extending the community version of Dubbo, we required a more extensible version of Go, as the existing version's functionality was relatively simple, so we collaborated with the author to refactor a better version. After about six months, by June 2019, we had effectively refactored dubbo-go, drawing inspiration from Dubbo's overall code architecture and completely rewriting a comprehensive Golang RPC/microservices framework with both server and consumer capabilities.

Later, we contributed the refactored version dubbo-go 1.0 to the Apache Foundation, and over two months have passed since then, with the community recently releasing version 1.1. To date, several companies, including Ctrip, have started trial and promotion in production environments.

### Start dubbo-go

The current dubbo-go has achieved good integration with the Java version, and dubbo-go itself is a complete Golang RPC/microservices framework, which can also operate independently from Java Dubbo.

Here's a simple usage example, illustrating a hello world example.

![img](/imgs/blog/dubbo-go/java-provider.png)

The above image shows a simple Java service registered as a Dubbo service, illustrating a basic user information retrieval example.

![img](/imgs/blog/dubbo-go/go-consumer.png)

The above image shows the dubbo-go client, which subscribes to and calls this Java Dubbo service. The Go client needs to explicitly call SetConsumerService to register the desired service, before invoking the registerPOJO method from the dubbo-go-hessian2 library to register the user object, facilitating custom POJO type conversion between Java and Go. The service invocation method is simply to declare a GetUser closure, which can be directly called.

![img](/imgs/blog/dubbo-go/go-provider.png)

Similarly, as shown above, a GetUser server can also be published based on dubbo-go, with a similar usage method. After publishing, it can be called by the dubbo Java client.

![img](/imgs/blog/dubbo-go/java-go-interop.png)

As shown in the image above, we have reached a point where the same dubbo-go client code can call the dubbo-go server as well as the Dubbo Java server; and the same dubbo-go server code can be called by both dubbo-go clients and Java clients. Therefore, utilizing Dubbo as the PPC framework, there is essentially no barrier for Go applications to interoperate with Java applications, enabling completely cross-language RPC calls. More importantly, dubbo-go inherits many advantages of Dubbo, such as ease of extensibility and powerful service governance functions. If you encounter similar needs to interface with Dubbo Java or are looking for a fully-featured service governance Go microservices framework while developing applications in Go, consider our dubbo-go project.

### Components of dubbo-go

Following is an introduction to the components of dubbo-go, which has been split into multiple projects for easy reuse in other projects and is fully open-sourced under the Apache license.

##### apache/dubbo-go

The main project of dubbo-go, complete Go language implementation of Dubbo server and client.

##### apache/dubbo-go-hessian2

The most widely used and compatible Go implementation of the hessian2 protocol with the Java version, which has been utilized in various Golang RPC & Service Mesh projects.

##### dubbo-go/getty

The dubbo-go asynchronous network I/O library, which decouples the network processing layer.

##### dubbo-go/gost

Basic library defining timeWheel, hashSet, taskPool, etc.

##### dubbo-go/dubbo-go-benchmark

Tool for basic stress testing and performance testing of dubbo-go.

##### apache/dubbo-go-hessian2

![img](/imgs/blog/dubbo-go/dubbo-go-hessian2.png)

Let’s introduce the dubbo-go-hessian2 project. This project is the Go implementation of the hessian2 protocol, fundamentally enabling mapping Java's basic data types and complex data types (such as wrapper classes and list interface implementations) to their corresponding Go counterparts.

For details, refer to:

*https://github.com/hessian-group/hessian-type-mapping*

Moreover, Dubbo Java server can serialize exception classes and transmit them through the hessian2 protocol over the network to the consumer side, allowing the consumer side to deserialize the exception object and handle it. After some tidying up, we now support defining over 40 types of Java exceptions at the Go consumer side to capture Java exceptions, enabling direct capture of exceptions thrown by the Java server when using dubbo-go.

Additionally, we support high-precision calculations of Java's BigDecimal class, as there are similar needs for financial-related calculations.

Furthermore, we map Java method aliases mainly due to Go's requirement that serialized method names must start with an uppercase letter, a convention not present in Java. Therefore, we added support for a hessian tag to allow users to manually map Java method names.

Currently, dubbo-go meets the majority of type interoperability needs with Java, and we are also implementing support for Java generics.

##### dubbo-go/getty

![img](/imgs/blog/dubbo-go/dubbo-go-getty.png)

Go is inherently an async network I/O model; the network servers written in Go on Linux also use epoll as the underlying data transfer driver, similar to Java's NIO implementation on Linux. Thus, Go's network processing is inherently asynchronous. What we need to encapsulate primarily involves the async network read and write operations based on Go and the subsequent middleware processing layer. Getty divides network data handling into three layers: incoming requests pass through the streaming layer encapsulating network I/O, the codec layer serializing and deserializing data based on different protocols, and finally escalate to the handler layer for upper-level consumption. Conversely, outgoing traffic follows a similar path in reverse. Every connection's I/O coroutines appear in pairs; for instance, a read coroutine is responsible for reading, codec logic, and outputting to the listener layer, with the final events being handled by a business coroutine pool.

This project is currently decoupled from dubbo-go, so if anyone has similar needs, they can use it directly, with support for tcp/udp/websocket already in place.

##### apache/dubbo-go

![img](/imgs/blog/dubbo-go/dubbo-go-arch.png)

The main project of dubbo-go, our refactored version is based on Dubbo's layered code design, depicted in the image above. It largely aligns with the existing layer structure of the Java version of Dubbo, hence dubbo-go inherits some excellent features from Dubbo, such as a clean code architecture, ease of extensibility, and comprehensive service governance capabilities.

We at Ctrip use our own registration center, allowing us to flexibly extend on the basis of the dubbo-go extension mechanism without modifying the source code of dubbo-go.

### dubbo-go Features

##### Implemented Features

Currently, dubbo-go has implemented commonly used features of Dubbo (such as load balancing, cluster strategies, multiple versions and implementations of services, multi-registry and multi-protocol publication, generalized invocation, service degradation and circuit breaking, etc.), with service registration and discovery supporting popular registry centers like zookeeper/etcd/consul/nacos. We won't elaborate here, but you can view the supported functionalities in the project readme's feature list at *https://github.com/apache/dubbo-go#feature-list*

Currently, the community is developing functionalities based on demands raised by early users during usage, focusing on essential production needs such as monitoring, tracking of call chains, service routing, and dynamic configuration centers.

##### Generalized Invocation in dubbo-go

![img](/imgs/blog/dubbo-go/dubbo-go-generic-invoke.png)

Here’s a detailed introduction to several key functionalities. First is generalized invocation, illustrated in the image above, which was proposed by a community member. This individual’s company has many Dubbo services, and they developed a Go-based API gateway to expose Dubbo services as external HTTP interfaces. Since there are too many internal Dubbo services, it’s impractical to create a consumer interface for every Dubbo service, as client-side changes would then be necessary whenever the server changes. Thus, the approach involves making generalized calls based on dubbo-go, with the api-gateway analyzing the external request address to identify the target Dubbo service to call. Generalized invocation in dubbo-go requires specifying the service, method, and parameters.

The principle is that dubbo-go acts as the consumer, and actually proxies the local genericService.invoke method, with parameters containing the service name, method name, and necessary parameter types and values targeted at the service being called. This data is later converted through dubbo-go-hessian2 into a map type, sent over the network to the corresponding Java server, where it automatically deserializes into its own POJO types. This achieves the goal of having dubbo-go as the client performing generalized invocation of the Dubbo server.

##### Circuit Breaking and Degradation in dubbo-go

![img](/imgs/blog/dubbo-go/dubbo-go-curcuit-breaker.png)

Circuit breaking and degradation support is based on Hystrix's Go version, allowing users to define circuit breaking rules and code segments triggered by degradation. The circuit breaking feature is implemented as an independent dubbo-go filter, enabling flexible activation or deactivation. If not enabled, the dependency doesn't need to be included during packaging. The Filter layer is an abstract responsibility chain pattern for request routing in dubbo-go, with many features implemented based on dynamically extended filter chains, including trace, least active load balancing, logging, etc. Designing circuit breaking as an independent filter for service invocation effectively meets the microservice architecture's service governance demand for "failing gracefully."

##### Dynamic Configuration in dubbo-go

The dynamic configuration center transitioned from URL configurations to supporting YAML format configurations in Dubbo versions 2.6 to 2.7, with granularity evolving from service-level to application-level configuration, though version 2.7 maintains compatibility with the URL format from version 2.6. Considering interoperability with Dubbo 2.6 and 2.7, dubbo-go supports both URL and configuration file service configurations, maintaining consistency with Dubbo. Currently, it supports zookeeper and apollo as configuration centers.

### dubbo-go Roadmap 2019-2020

![img](/imgs/blog/dubbo-go/dubbo-go-roadmap-2019.png)

Finally, a point of interest, regarding the community’s plans for dubbo-go in the second half of 2019. The focus seems primarily on completing existing functionalities and addressing some issues. Our goal is to achieve runtime compatibility and functional consistency between Java and Go, addressing gaps where dubbo-go, as a complete Go microservices framework, can be improved.

Another noteworthy aspect is that by the end of this year, dubbo-go expects to release an extension supporting Kubernetes as a registry center, actively embracing the cloud-native ecosystem. Regarding cloud-native support, the community has been engaging in discussions about the relationship between dubbo-go and Service Mesh, and its positioning within that context. It's certain that dubbo-go will collaborate with the Dubbo community in the planning for Service Mesh and play a significant role. We preliminarily expect to propose an integration plan with open-source community projects related to Service Mesh next year, so stay tuned.

The dubbo-go community is currently in a rapid, healthy growth phase. In less than three months since its donation to Apache, it has attracted numerous active developers and interested users. We welcome everyone to engage in discussions in the community regarding any issues encountered while using or learning dubbo-go, and we encourage those who may have potential needs or interests in dubbo-go to join the community.

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe src="https://player.bilibili.com/player.html?aid=413770787&cid=210657864&page=1&as_wide=1&high_quality=1&danmaku=0" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen title=""></iframe>
</div>

### About the Author

He Xinming, currently employed at Ctrip, is a technical expert in the Basic Middleware Development Department, co-founder and main author of dubbo-go, and an Apache Dubbo committer, focusing on the internet middleware and platform domains.

