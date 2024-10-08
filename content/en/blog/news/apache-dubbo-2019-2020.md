---
title: "Annual Review and Summary of Apache Dubbo from 2019 to 2020"
linkTitle: "Annual Review and Summary of Apache Dubbo from 2019 to 2020"
date: 2020-05-11
tags: ["News"]
description: >
    In this article, we will summarize the achievements made by the Dubbo community in the past year.
---

Thank you all for your attention to the Dubbo community. In this article, we will summarize the achievements made by the Dubbo community over the past year, covering both community and framework evolution, and look forward to future plans (roadmap) for the Dubbo community and framework. Community building is a very important aspect of promoting Dubbo's healthy and sustainable development. We need to maintain positive interactions within the community, have active contributors, and engage in constructive discussions. Over the past year, the entire Dubbo community has made significant progress in this regard. In terms of framework evolution, we primarily released 6 feature versions from 2.7.0 to 2.7.5, covering various aspects including programming models, protocols, service governance, and performance optimization. In addition to released features, we also explored deeply into areas such as Dubbo 3.0 protocol, service introspection, and cloud-native directions. Support for these areas will be crucial for Dubbo's future work, and we hope to share more detailed thoughts and plans through this article.

## Community Review

Looking back on the development of the Dubbo community over the past year, one important milestone was graduating from Apache incubation in May 2019. Dubbo became the second project donated by Alibaba to graduate from Apache. I had the privilege of participating in the entire process from restarting the open-source project, entering Apache incubation to graduation, during which the community did a lot of work, including email list building, code standard checks, documentation and code internationalization, and handling issues/pull requests. These efforts were required by the Apache community and also played a positive role in promoting Dubbo's development.

After graduating from Apache, related Dubbo projects were also migrated, all moved under the [Apache](https://github.com/apache?utf8=✓&q=dubbo&type=&language=) organization:

The Dubbo community has a total of 24 projects. Maintaining so many projects is not something that can be done solely by a few active developers, but is the result of the entire community's efforts. I summarized all the Committers/PMCs nominated over the past year, with a total of 27 people nominated (23 Committers and 4 PMCs). As shown in the pie chart below, less than 20% of the contributors come from Alibaba, while over 80% come from various organizations of developers or enthusiasts. This distribution of Committers represents one of the most important changes brought about by joining Apache: the Dubbo project belongs to the entire community, reflecting the common aspirations of different organizations and developers. Its development is not controlled or decided by one company but decided after community discussions. If you are interested in participating in the Dubbo community, you can engage in discussions, decision-making, and coding related to Dubbo's development, and we look forward to everyone becoming the next Committer.

![community distribution](/imgs/blog/community-distribution.png) 

Over the past year, the Dubbo community organized more than 10 offline meetup events, covering almost all cities in China where developers gather, maintaining close communication with many Dubbo developers and users. Through these offline or online live events, over 100 topics were shared, deeply explaining the latest developments, functionality module development, and recent plans of the Dubbo community. The vast majority of these topics were gathered through community efforts, ultimately presented by enterprises deeply involved with Dubbo, such as Ctrip, Industrial and Commercial Bank of China, Koala, and Trust Capacity.

![community meetup](/imgs/blog/community-meetup.png) 

From GitHub, Dubbo also received a very high level of attention over the past year, with a significant milestone being the Star count surpassing 30,000, which increased nearly five times since the restart of the open-source project. The number of contributors rose from initially a few dozen to currently 282, of which approximately 60 to 70 have been nominated as Committers. Both the number of contributors and the proportion of Committers has seen significant improvement. Another metric is the number of released versions, totaling 64. If you want to understand the specific information of each version, you can click through here.

![community github](/imgs/blog/community-github.png) 

Currently, the community maintains three major versions: 2.5.x, 2.6.x, and 2.7.x.

Among them, 2.7.x is our primary development version, with 6 versions released in the past year (2.7.0 - 2.7.5). Each version introduces noteworthy features or functional upgrades, enhancing various aspects from programming models, service governance, performance to protocols.

The 2.6.x version is positioned as a bugfix version, with 3 versions released in the past year, mainly focusing on fixing issues and security vulnerabilities, without introducing new features, ensuring stability across this series of versions.

The 2.5.x version was declared EOF from early last year, only receiving security fixes; by the second half of the year, maintenance had completely ceased. Users still on this version are advised to upgrade to versions 2.6 or 2.7 as soon as possible.

Regarding the distribution of users for versions 2.6 and 2.7, there are currently no official statistics, but based on our tracking of issue distributions and some in-depth users, the usage distribution of these two versions appears to be approximately 40%-60%. Additionally, we have observed a trend where a significant portion of 2.6 users have begun researching and upgrading to version 2.7. After all, whether a framework can meet business development demands is largely dependent on its capability to continuously incorporate new features and keep pace with emerging technology trends, which version 2.6 struggles to satisfy.

For many developers, the primary concern when upgrading to version 2.7 is its stability. Each version of 2.7 introduces many new contents and has a rapid iteration speed, making it a challenge for the community to ensure the stability of each release version. To help users better assess upgrades, we have recently listed a separate issue on GitHub to summarize the stability of current and future versions: [Summary and Upgrade Suggestions for Dubbo Versions #5669](https://github.com/apache/dubbo/issues/5669).

|          | **Version** | **Key Features** | **Upgrade Recommendations**                                                 |
| -------- | ------------ | ------------------------------------------------------------ | ------------------------------- |
| 1        | 2.7.5        | Service introspection, HTTP/2 (gRPC), Protobuf, TLS performance optimization https://github.com/apache/dubbo/releases/tag/dubbo-2.7.5 | Not recommended for large-scale production use            |
| 2        | 2.7.4.1      | [bugfixes and enhancements of 2.7.3](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.4.1) | **Recommended for production use**                |
| 3        | 2.7.3        | [bugfixes and enhancements of 2.7.2](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.3) | **Recommended for production use**                |
| 4        | 2.7.2        | [bugfixes and enhancements of 2.7.1](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.2) | Not recommended for large-scale production use            |
| 5        | 2.7.1        | [bugfixes and enhancements of 2.7.0](https://github.com/apache/dubbo/releases/tag/dubbo-2.7.1) | Not recommended for large-scale production use            |
| 6        | 2.7.0        | Asynchronous programming model - asynchronous consumer/provider, enhanced service governance rules, simplified registration model, Configuration Center, Metadata Center, package restructuring   https://github.com/apache/dubbo/releases/tag/dubbo-2.7.0 | beta version, first version after reconstruction of 2.6.x |

The 2.7.5 version is expected to gradually reach stability in the next 1-2 versions.

Regarding whether subsequent versions will have identifiable suffixes like -beta, RC, etc., to distinguish different stages of release versions, the community has had similar discussions, and future decisions will depend on the development situation.

## Key Features Review

Next, let’s specifically discuss the new features released in version 2.7 from several perspectives, including programming models, performance optimization, service governance, transport protocols, and ecosystem development.

### Programming Model

The key changes related to the programming model in Dubbo include the following:

* CompletableFuture asynchronous service method signatures
* Asynchronous support API for the server
* IDL cross-language service definitions
* Reactive-style method signatures for services

Firstly, let’s look at the enhancements related to asynchronous programming.
A typical service definition in the Java version of Dubbo is as follows:

```java
public interface HelloService {
  // Synchronous style
  String sayHello(String name); 
}
```

To implement asynchronous service calls on the consumer side, a separate asynchronous identifier needs to be configured and used in conjunction with the RpcContext API.

```java
String result = helloService.sayHello("world"); // result is always null
Future future = RpcContext.getContext().getFuture();
```

After version 2.7, we can directly define the method interface as follows to achieve asynchronous on both consumer/provider sides more intuitively:

```java
public interface HelloService {
  // Asynchronous style
  CompletableFuture<String> sayHello(String name); 
}

CompletableFuture<String> future = helloService.sayHello("world"); 
```

The above examples describe Dubbo services based on Java Interfaces. If calls are to be made among heterogeneous microservices in multiple languages, the service would need to be redefined in the respective languages, thus failing to achieve cross-language service reuse. Cross-language serialization also requires special attention.

To address this, version 2.7.5 introduces support for IDL + Protobuf to solve cross-language service definition issues. For details, please refer to the example:

[dubbo-samples-protobuf](https://github.com/apache/dubbo-samples/tree/master/3-extensions/serialization/dubbo-samples-protobuf)

![service idl](/imgs/blog/service-idl.png) 

The support for Reactive-style APIs is somewhat similar to CompletableFuture, allowing users to define service interfaces using RxJava or Reactor APIs.

![idl dubbo compiler](/imgs/blog/idl-dubbo-compiler.png) 

However, it is important to note that the external Reactive API requires underlying transport protocol support to be meaningful. Therefore, currently, Reactive APIs only make sense when using the gRPC protocol. For specific details, refer to the examples and the following section on "[Dubbo's support for gRPC](https://github.com/apache/dubbo-samples/tree/925c3d150d9030bc72988564e4f97eca1f6fcb89/3-extensions/protocol/dubbo-samples-grpc/dubbo-samples-rxjava)".

### Performance Optimization

Version 2.7 has also made significant strides in performance optimization, with obvious improvements in throughput, call chain response time, and service governance chain performance of Dubbo's business system.

1. System Throughput

   The major enhancements related to increasing system throughput include a full asynchronous transformation of the framework, optimization of the consumer thread model, and the introduction of Stream semantic protocols.

   The full asynchronous transformation involves a critical point: the asynchronousization of the Filter chain. Previously, Filters only had a synchronous invoke method. Now, to support asynchronous callbacks, a Listener callback listener has been added to listen and intercept the results of asynchronous calls.

![filter](/imgs/blog/filter.png) 

   In terms of optimizing the consumer thread model, applications that consume a large number of services, like gateway applications, see a significant improvement in system stability and performance. The overall working principle diagram after optimization is shown below; specific analyses can be referenced in the previously published article: [“Consumer Thread Pool Model”](/en/docsv2.7/user/examples/consumer-threadpool/)

   Old thread model working principle:

  ![consumer threadpool](/imgs/blog/consumer-threadpool0.png) 

   New thread model working principle:

   ![consumer threadpool new](/imgs/blog/consumer-threadpool1.png) 

2. RPC Call Chain

   From 2.7.0 to 2.7.5, our testing data indicates that the performance of the call chain has improved by over 30% through a series of optimizations. Overall, the optimization aims to reduce memory allocation and CPU computation during the calling process, comprising two main modifications:

   * Service metadata statification, computing and caching as much as possible during the startup phase to minimize computational costs during calls and accelerate response speed.
   * Reducing memory allocation caused by URL operations during the calling process.

3. Service Governance Chain

   Key concerns in the service governance chain include address pushing, service governance rules pushing, service governance rules computation, routing location, and so on. Especially in large-scale service cluster scenarios, each of these points may become a performance or stability bottleneck. In version 2.7, we have primarily optimized the computation paths related to "address pushing", summarized as follows:

   * Address push event consolidation to avoid redundant calculations in a short time frame.
   * Avoiding URL reallocation during full address pushes.
   * Introducing variable URL states in the URL merging chain to avoid costs caused by URL copying.

### Service Governance

Service governance is also a module that has been significantly enhanced in version 2.7. Overall, it can be divided into three parts:

* Optimization and enhancement related to ordinary routing rules.
* Enhanced routing support for cross-regional and cross-datacenter deployments.
* Metadata center and configuration center.

We will gradually elaborate on these three parts. Below are examples of routing rules in version 2.7.

![route app](/imgs/blog/route-app.png) 

![route service](/imgs/blog/route-service.png) 

Among the notable changes, the routing rules have been rewritten in YAML format, and all future routing rules are expected to use YAML as their basic descriptive language; compared to previously storing routing rules directly in the registry, in version 2.7, with the addition of the configuration center, routing rules are now stored in an independent configuration center by default, with optimized configuration format pushing mechanisms. Additionally, version 2.7 also introduced application-level routing rules for setting traffic rules from the perspective of the entire application.

The newly added cross-registry routing mechanism can achieve load balancing of call traffic across multiple registries, which is quite useful for scenarios requiring cross-region disaster recovery, priority for the same datacenter, or migration of registries.

![cluster load balance](/imgs/blog/cluster-lb.png) 

The supported load balancing strategies for registry clusters currently include:

- Same region priority
- Weighted round-robin
- Specified priority
- Any usable

The metadata center stores descriptions of Dubbo service method definitions, currently mainly utilized for service testing, and may later be used for service API management, gateway parameter mapping, etc.

The new configuration center mainly serves two purposes: storing/pushing configuration rules and application configuration hosting. Next, we will focus on explaining the application configuration hosting-related functions and their impact on Dubbo's development and operational configurations. Dubbo currently supports several configuration sources such as JVM dynamic parameters, configuration centers, API, and local configuration files. These sources implement configuration overrides in a hierarchy from high to low as shown in the diagram:

![config](/imgs/blog/config.png) 

The configuration center acts as a shared version of remote hosting for `dubbo.properties`, with keys having specific naming conventions:

```properties
# Application-level
dubbo.{config-type}[.{config-id}].{config-item} {config-item-value}
# Service-level
dubbo.service.{interface-name}[.{method-name}].{config-item} {config-item-value}
dubbo.reference.{interface-name}[.{method-name}].{config-item} {config-item-value}
# Multiple configuration items
dubbo.{config-type}s.{config-id}.{config-item} {config-item-value}
```

### Transport Protocol

Version 2.7 expanded upon the RPC protocol layer and serialization layer, introducing support for the gRPC protocol in the RPC layer and Protobuf protocol in the serialization layer.

One of the important reasons for supporting gRPC is its construction based on the HTTP/2 protocol, which, as a standard HTTP protocol, has received excellent support across various levels of network devices and gateway proxies, providing greater penetration and versatility. By supporting the gRPC protocol, Dubbo offers a transport protocol option for users wishing to utilize HTTP/2.

gRPC builds RPC semantics on top of HTTP/2 streams, supporting various semantics such as Request - Response, Stream - Response, Request - Stream, and Bi-Stream, accommodating differing business call scenarios.

![service idl2](/imgs/blog/service-idl2.png) 

In Dubbo's design, all RPC protocols are treated equally, whether it is the proprietary Dubbo protocol or extended third-party protocols like Thrift, Hessian, or gRPC. Thanks to this design, we can extend support for any new protocol. For details on how to extend RPC protocols and their application scenarios, please refer to the previously published article “[Using Dubbo to Connect Heterogeneous Microservice Systems](https://mp.weixin.qq.com/s/-fvDeGlCLjz0n60naZJnQg)”.

Protobuf serialization protocol support is considered more for its advantages in cross-language, security, and performance.

## Roadmap 

The community will continue to promote the development of Dubbo in the future, focusing on several key directions:

* Continuing to enhance service governance capabilities to better meet the needs of microservice development and operations;
* At the protocol level, starting to develop the next generation RPC protocol, which will provide richer built-in semantics like Stream, Flow Control, etc., while ensuring better extensibility and friendliness towards gateways;
* Service discovery mechanisms based on application granularity.
* Cloud-native transformations bring changes to the underlying infrastructure and give rise to microservice solutions like ServiceMesh. We need to keep exploring Dubbo;

### Microservice Features

Currently in development or planning are microservice features such as service authentication, circuit breaking, and routing rule enhancements, with expected releases in upcoming versions like 2.7.6. Additionally, based on community demands, further microservice feature support will be added over time.

Taking the service authentication feature currently in development as an example, it addresses a demand encountered by many Dubbo users in practice: although Dubbo services primarily operate internally, some services are expected to be open only for certain scenarios or users, such as services involved in sensitive data operations. This requires support for authentication capability.

Detailed discussions regarding the service authentication feature that Dubbo is developing can be found in [Dubbo Call Authentication Scheme #5461](https://github.com/apache/dubbo/issues/5461). Overall, the authentication features provided by Dubbo constrain the basic process of authentication on the Dubbo side. It is a universal authentication scheme designed to be extensible in elements like token computation and verification, making integration with various authentication and permission management systems easy.

Thanks to the active developers in the community, notably [CodingSinger](https://github.com/CodingSinger), currently employed at iQIYI, who is the initiator and main contributor to the authentication module.

### Protocol - 3.0

Here is the Dubbo 2.0 protocol, which we have previously discussed in detail on several occasions.

![Dubbo Protocol 2.0](/imgs/blog/grpc/dubbo-ptotocol.png) 

The Dubbo 2.0 protocol has revealed some issues in cloud-native and mesh scenarios, such as:

* Lack of extensibility in the protocol
* RPC protocol layer and payload being tightly coupled
* Binary proprietary protocol built on TCP
* Lack of support for Stream semantics

Hence, in response to these issues, the next generation Dubbo protocol will highlight the following features:

**Reactive Stream**
Reactive Streams introduce RPC, bringing richer communication semantics and API programming model support, such as Request-Stream and Bi-Stream.

**Protocol Upgrade**
The protocol includes a built-in application layer protocol negotiation mechanism, featuring a self-built protocol upgrade mechanism and ALPN to facilitate future upgrades of the protocol or compatibility with legacy protocol migrations.

**HTTP/2**
In cloud-native microservice scenarios, protocols built on HTTP/2 offer better generality and penetration.

**Extensibility**
The protocol is extendable, distinguishing protocol header Metadata from RPC method parameters.

**Multi-language Support**
Support for Protobuf provides comprehensive support for cross-language service definitions and serialization transfers.

**Mesh**
The protocol is more friendly towards Mesh, facilitating collaboration with Mesh, including traffic control mechanisms and application-layer configuration negotiations.

**Traffic Control**
The protocol has a built-in flow control mechanism, supporting mechanisms similar to Reactive Stream's Request (n) flow control.

**Protocol Generality**
Maintaining a balance between generality and performance, the protocol supports running on various devices.

### Service Introspection - Application-Level Service Registration

One of Dubbo's greatest advantages is its ease of use, particularly its interface-oriented (RPC method) programming model. However, governance focusing on interfaces has also posed some challenges:

* The number of addresses has increased exponentially, placing considerable pressure on address pushing.
* It does not align well with mainstream microservice model systems like Spring Cloud and Kubernetes.

To this end, we plan to introduce an application-level service registration mechanism with the following key highlights:

* The registry organizes by “Application - Instance IP,” without needing to synchronize RPC interfaces.
* Introducing an independent metadata service to handle RPC interface synchronization.

Below is the basic working principle of application-level service registration (service introspection). Please stay tuned for further analysis and development progress on this aspect.

![service discovery new](/imgs/blog/servicediscovery-new.png) 

### Cloud Native

Cloud-native brings changes to the underlying infrastructure and comprehensive changes in application development, deployment, and operations:

**Infrastructure**

* Changes in infrastructure scheduling mechanisms lead to variations in maintenance (lifecycle) and service governance.
* Service discovery capabilities are descending, with Kubernetes abstracting native service discovery.

**Service Mesh - Cloud-Native Microservice Solutions**

* Mesh offers solutions for cross-language and SDK upgrades, requiring Dubbo SDK to collaborate with Mesh, adapting functionality, protocols, and service governance.
* While Mesh has yet to be extensively deployed, it suits applications more focused on traffic control. Traditional SDK performance advantages are still extant, and transitional scenarios between the two may persist for some time.

From an application scenario perspective, the possible deployment environments for Dubbo include:

1. Not using Kubernetes Native Service, with Kubernetes serving only as a container orchestration and scheduling facility, continuing with Dubbo's self-built service registration and discovery mechanism.
2. Reusing Kubernetes Native Service, wherein Dubbo no longer concerns itself with service registration, with Dubbo Client handling service discovery and traffic allocation.
3. Transitioning Dubbo SDK to Mesh, aiming to adapt to the Mesh architecture for RPC programming and communication solutions while ensuring long-term coexistence and integration between Dubbo and the Mesh governance systems.
4. Providing smooth migration support for mixed deployments across Kubernetes and off-cloud environments, including unified service discovery and network communication solutions.

From Dubbo's perspective, we will focus on the following aspects to provide support for cloud-native infrastructure:

**Lifecycle:** Binding Dubbo to Kubernetes scheduling mechanisms, ensuring automatic alignment of service lifecycles with Pod containers, etc.
**Governance Rules:** Optimizing service governance rules in terms of rule body and format, such as describing rule bodies in YAML and removing direct dependencies of filtering rules on IPs, defining rule-specific CRD resources, etc.
**Service Discovery:** Supporting service discovery for K8S Native Services, including DNS and API-Server, supporting xDS for service discovery.
**Mesh Architecture Collaboration:** Building the next generation of HTTP/2-based communication protocols, supporting standardized data transmission based on xDS.

