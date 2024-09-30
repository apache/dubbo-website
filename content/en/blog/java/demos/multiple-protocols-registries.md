---
title: "Dubbo Connecting Heterogeneous Microservice Architecture - Multi-Protocol & Multi-Registry"
linkTitle: "Dubbo Connecting Heterogeneous Microservice Architecture - Multi-Protocol & Multi-Registry"
tags: ["Java"]
date: 2023-01-05
description: >
    This article introduces Dubbo's multi-protocol and multi-registry support solutions, and how to achieve capabilities such as multi-protocol coexistence, intercommunication, and migration.
---

From a programming development perspective, Dubbo is primarily an RPC service framework. Its greatest advantage lies in providing an interface-based service programming model that shields developers from the underlying remote communication details. At the same time, Dubbo is also a service governance framework, offering solutions for service discovery, traffic scheduling, and other service governance aspects for microservices deployed in a distributed manner.

In this article, we will explore how to leverage Dubbo's support for multiple protocols and service discovery models to achieve interconnectivity between heterogeneous microservice architectures. In practical business scenarios, this can address communication issues under heterogeneous technology stacks, facilitate smooth migrations, and solve challenges like address discovery and traffic scheduling in large-scale, cross-regional, and multi-cluster deployments.

## Interface-Based Transparent Service Development Framework

We start with the well-known concept that **Dubbo is a microservice development framework**. Just as Spring serves as a foundation for developing Java applications, Dubbo is often chosen as the basic framework for microservices development. I believe Dubbo's biggest advantage is its interface-oriented programming model, allowing developers to invoke remote services as if they were local services (using Java as an example):

1. Service Definition

```java
public interface GreetingsService {
    String sayHi(String name);
}
```

2. Consumer Calls Service

```java
// Completely transparent, just like calling a local service.
@Reference
private GreetingService greetingService;

public void doSayHello(String name) {
  greetingService.sayHi("Hello world!");
}
```

The diagram below illustrates the basic working principle of Dubbo, where service providers and consumers coordinate addresses via a registry and exchange data using a predefined protocol.

![Dubbo basic work flow](/imgs/blog/2023/01/protocols/img.png)

## Problems Faced by Homogeneous/Heterogeneous Microservice Systems

The specifics of the Dubbo protocol itself and related service governance functionalities are not the focus of this article. Instead, we'll examine the challenges faced by organizations in building internal microservice architectures and discuss how Dubbo can offer solutions for architectural selection and migration.

An organization's microservices may be developed using the same service framework, such as Dubbo, which we refer to as a **homogeneous microservice system**. On the other hand, some organizations may construct their microservices using multiple different frameworks, which we call a **heterogeneous microservice system**. The co-existence of various technology stack microservice systems within large organizations is quite common, and there can be many reasons for this scenario—ranging from legacy systems to ongoing technology stack migrations, or independent selections made by different business departments to meet specific needs.

**1. Coexistence of Heterogeneous Microservice Systems**

One immediate challenge is: **Different systems usually utilize different RPC communication protocols and deploy independent registry clusters. How do we achieve transparent address discovery and transparent RPC calls in such a multi-protocol, multi-registry cluster environment?** If we do nothing, each microservice system can only recognize the service status within its own environment, resulting in isolated traffic. For a smooth migration from system A to system B, or to maintain the coexistence of multiple systems internal to the company, achieving interconnectivity and transparent traffic scheduling will be critical.

![2](/imgs/blog/2023/01/protocols/img_1.png)

**2. Within the Dubbo System**

**The issues of multi-protocol and multi-registry clusters can also exist in homogeneous microservice systems, especially when the scale of microservices within an organization grows significantly.**

* We may need to use different communication protocols between different services, as they face various business scenarios, leading to distinct data transmission characteristics. We need to adopt protocols that better fit the specific business characteristics. For example, in typical scenarios, we might use the Dubbo protocol for standard business services, HTTP protocol for services interacting with the FrontEnd, and gRPC protocol for services requiring streaming data transmission.

* Another common issue within the Dubbo system arises in large-scale distributed deployments, where microservices may be deployed across regions and registries, thereby encountering problems with address synchronization and traffic scheduling between multiple clusters.

In summary, **both homogeneous and heterogeneous systems face challenges with multi-protocol communication and multi-registry address discovery.** Dubbo currently supports multiple protocols and registries, which is essentially designed to address the scenarios analyzed within homogeneous Dubbo systems. Therefore, we will start by discussing the basic multi-protocol and multi-registry support provided by Dubbo in homogeneous systems, before further exploring how to extend this capability to support interconnectivity in heterogeneous microservice systems.

## Multi-Protocol and Multi-Registry Mechanism in the Dubbo System

We will illustrate the use and working principles of Dubbo's multi-protocol and multi-registry mechanisms through two scenarios.

### Multi-Protocol

![undefined](/imgs/blog/2023/01/protocols/img_2.png)

The above illustrates a set of microservices developed using Dubbo, with different protocols utilized for communication between services. According to our research, the adoption of multiple protocols within organizations is a common requirement, though we won’t explain specific scenarios here.

Application B serves as the provider, publishing five services, including:

* `DemoService1` and `DemoService2` published using the `dubbo` protocol
* `DemoService3` and `DemoService4` published using the `gRPC` protocol
* `DemoService0` published with both `dubbo` and `gRPC` protocols

Application A acts as a consumer, consuming `DemoService1` and `DemoService2` using the dubbo protocol, and `DemoService0` using the gRPC protocol.

Application B, as a consumer, consumes `DemoService2` and `DemoService4` using the gRPC protocol, and `DemoService0` using the dubbo protocol.

Here are the specific code configurations:

1. Provider Application B

```xml
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService1" protocol="dubbo"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService2" protocol="dubbo"/>

<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService3" protocol="grpc"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService4" protocol="grpc"/>

<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService0" protocol="dubbo, grpc"/>
```

2. Consumer Application A

```xml
<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService1"/>
<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService2"/>

<dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService0"/>
```

3. Consumer Application C

```xml
<dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService3"/>                                                                                     <dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService4"/>

<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService0"/>

```

#### Current Support Status of Dubbo Multi-Protocol

The protocols currently supported by Dubbo include Dubbo, REST, Thrift, gRPC, JsonRPC, Hessian, etc., covering most mainstream RPC communication protocols in the industry. It’s worth noting that these protocol supports are implemented through direct integration with official releases, which I believe is a good choice as it ensures protocol parsing stability while allowing the Dubbo community to focus more on improving service governance capabilities around Dubbo. Imagine the amount of energy and time the community would have to spend if they had to provide implementations for every protocol themselves.

In addition to the officially supported protocols, thanks to Dubbo's flexible extension mechanism, it is very easy for developers to extend Dubbo with additional protocol supports, including proprietary protocol extensions.

For support regarding gRPC (HTTP/2) protocol, please refer to the previous document.

![3](/imgs/blog/2023/01/protocols/img_3.png)

#### Problems Solvable by Multi-Protocol

* Seamlessly integrating the RPC framework into Dubbo's service governance system.

  By integrating RPC protocols through protocol extensions, we can reuse Dubbo's programming model and capabilities like service discovery and traffic control. For instance, gRPC's service governance system is relatively weak, and its programming API is not very user-friendly, making it difficult to use in microservice development.

* Meeting diverse calling needs in various scenarios.

  Different services may be developed to meet specific business needs, while the technology stacks of external consumer applications may vary, enabling the optimization of communication needs in different scenarios through the use of various communication protocols.

* Realizing protocol migration.

  By supporting multiple protocols, and with the coordination of the registry, we can quickly fulfill the need for protocol migration within the company. This could involve upgrading from a proprietary protocol to Dubbo, upgrading Dubbo itself, migrating from Dubbo to gRPC, or migrating from REST to Dubbo.

### Multi-Registry

When the service cluster is small, a centralized cluster deployment solution can effectively address our business problems. However, as application scale increases and user traffic grows, we must consider introducing cross-regional, multi-cluster deployment solutions for the business system. This brings forth deployment solution options for the registries closely related to the business systems:

1. Continue maintaining a globally shared registry cluster. The advantage of this architecture scheme is its simplicity; its drawback is that the registry cluster must keep complete address data, which might impose significant storage and pushing pressures. Additionally, for certain registry products (like Zookeeper), stability and performance may be challenged in cross-cluster network deployments.

2. Deploy independent registry clusters for each business cluster. The advantages of multi-registry clusters include solving cross-cluster network availability issues and alleviating storage and pushing pressures on the registry. The drawback is that the service framework (like Dubbo) must support publishing/listening to multiple registry clusters simultaneously.

Let’s look closely at the solutions Dubbo provides for multi-registry cluster scenarios.

![4](/imgs/blog/2023/01/protocols/img_4.png)

The diagram above shows two business clusters located in Beijing and Shanghai, each having its own independent registry cluster, solving the issue of transparent RPC communication between the two business clusters.

1. Service Provider, Dual Registry Publishing

```xml
<dubbo:registry id="beijingRegistry" address="zookeeper://${zookeeper.address1}" default="false"/>                                                                           <dubbo:registry id="shanghaiRegistry" address="zookeeper://${zookeeper.address2}" />

<dubbo:service interface="org.apache.dubbo.samples.multi.registry.api.HelloService" ref="helloService" registry="shanghaiRegistry,beijingRegistry"/>
<dubbo:service interface="org.apache.dubbo.samples.multi.registry.api.DemoService" ref="demoService" registry="shanghaiRegistry,beijingRegistry"/>
```

2. Service Consumer, Subscription to Single/Dual Registries Based on Needs

```xml
<dubbo:registry id="beijingRegistry" address="zookeeper://${zookeeper.address1}" default="false" preferred="true" weight="100"/>                                                                                         <dubbo:registry id="shanghaiRegistry" address="zookeeper://${zookeeper.address2}" default="true" weight="20"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.DemoService"/>

<dubbo:reference  interface="org.apache.dubbo.samples.multi.registry.api.DemoService" registry="beijingRegistry, shanghaiRegistry"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.HelloService" registry="beijingRegistry"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.HelloService" registry="shanghaiRegistry,shanghaiRegistry"/>
```

#### Dubbo's Support for Heterogeneous Registry Clusters

Although we may deploy multi-registry clusters, we typically use the same registry products, such as all Zookeeper or Nacos. In the context of migrating registries, Dubbo must provide support for a broader range of registry products or, most importantly, offer strong extensibility. Currently, the registry implementations supported officially by Dubbo are:

![5](/imgs/blog/2023/01/protocols/img_5.png)

It is particularly important to mention that Dubbo's service registration/discovery model currently operates at the interface granularity, while starting from version 2.7.5, Dubbo has introduced a service registration/discovery model at the application granularity. This not only helps optimize Dubbo's current service discovery mechanism and enhance service capacity but is also crucial for connecting microservice architectures represented by SpringCloud (this point will be elaborated in the next chapter). More information on "Application Granularity Service Discovery: Service Self-Inspection" will be provided in upcoming articles or documents, so please stay tuned.

#### Traffic Scheduling Issues Arising from Multi-Subscription

With the introduction of multi-registry clusters, Dubbo introduces an additional layer of load balancing among registry clusters when determining traffic allocation:

![6](/imgs/blog/2023/01/protocols/img_6.png)

At the Cluster Invoker level, the selection strategies we support are (for version 2.7.5+; specific usage can be found in the documentation):

* Specify Priority

  ```xml
  <!-- Addresses from the preferred="true" registry will be prioritized; fallback to other registries only if no available addresses are present in this registry -->
  <dubbo:registry address="zookeeper://${zookeeper.address1}" preferred="true" />
  ```

* Same Zone Priority

  ```xml
  <!-- During selection, it will match the zone key in the traffic; traffic will be preferentially dispatched to addresses in the same zone -->
  <dubbo:registry address="zookeeper://${zookeeper.address1}" zone="beijing" />
  ```

* Weight Polling

  ```xml
  <!-- Addresses from Beijing and Shanghai clusters will be allocated traffic in a 10:1 ratio -->
  <dubbo:registry id="beijing" address="zookeeper://${zookeeper.address1}" weight="100" />
  <dubbo:registry id="shanghai" address="zookeeper://${zookeeper.address2}" weight="10" />
  ```

* Default, stick to any available one

#### Scenarios Suitable for Multi-Registry

* Same Regional Traffic Priority Scheduling

  For disaster recovery or service scalability needs, services/applications often require deployment across multiple independent data centers/regions. In scenarios where each region has its own independent registry cluster, implementing same-region traffic priority scheduling can effectively resolve latency and availability issues.

* Registry Migration

  A company’s services may have historically been stored in a single registry, such as Zookeeper. However, at certain points, for various reasons, when we need to migrate to another registry, a multi-registry model ensures a smooth transition.

* Interconnectivity of Heterogeneous Systems

  Services developed within different microservice architectures are isolated within their own service discovery systems; however, through a unified multi-registry model, services across different systems can discover one another.

## Leveraging Dubbo to Connect Heterogeneous Microservice Systems

As mentioned earlier, there are various valid possibilities for the existence of heterogeneous microservice systems within organizations. Now, let's look specifically at real scenarios involving heterogeneous microservice systems and methods utilizing Dubbo for interconnectivity. First, let's visualize what interconnecting heterogeneous microservice systems looks like.

![7](/imgs/blog/2023/01/protocols/img_7.png)

As shown in the diagram, some microservices are built on SpringCloud, gRPC, K8S, or self-constructed architectures, and they are typically isolated and unable to communicate with each other. When we construct a set of microservices based on Dubbo, utilizing Dubbo's multi-protocol and multi-service discovery models allows for bi-directional connectivity between heterogeneous microservice systems. Further, as indicated by the orange arrows in the illustration, relying on the Dubbo system as a bridge, we can facilitate connections between two heterogeneous microservice systems.

For several example scenarios, since there is currently no unified standard for address discovery, we will assume for now that there are no obstacles at the address discovery layer, focusing on the basic migration processes and communication protocols. (We will delve deeper into address discovery in an upcoming article titled "Service Self-Inspection: Application Granularity Service Discovery".)

### Protocol Migration within the Dubbo System (Coexistence)

Most developers hold a conventional understanding that using Dubbo to develop microservice systems necessitates employing the Dubbo protocol as the optimal inter-service communication protocol. In reality, we are not limited to only the Dubbo RPC protocol. Dubbo as a microservice development framework and Dubbo as an RPC protocol are distinct concepts and can be considered separately. For instance, it is entirely acceptable for business systems developed using the Dubbo framework to utilize REST or gRPC for communication (as shown in the list of protocols supported by Dubbo); the choice of protocol should be based on business characteristics and technical planning.

![8](/imgs/blog/2023/01/protocols/img_8.png)

In the current cloud-native and mesh background, HTTP/1.2 and gRPC protocols are gaining increasing attention; one reason for this is their superior standardization, garnering support from more networking devices and infrastructure and exhibiting better universality and penetration. For many enterprises willing to migrate to cloud-native architectures, transitioning to such protocols undoubtedly aids future architectural upgrades.

The diagram below illustrates an intermediate state during the migration from the Dubbo protocol to the gRPC protocol within the Dubbo system.

![9](/imgs/blog/2023/01/protocols/img_9.png)

* The far-left represents legacy applications that have not yet migrated; these applications must still consume and provide services using the Dubbo protocol during the migration period.
* The middle section signifies applications in the process of migration, potentially acting as service providers by offering Dubbo protocol services to the legacy systems on the left while simultaneously providing gRPC services to the new systems on the right; thus, they expose services using both protocols.
* The far-right represents newly developed or fully migrated applications, where communication can entirely occur over the gRPC protocol.
* After traversing the intermediate state, we expect to achieve a situation where all applications can communicate entirely using the gRPC protocol.

### Migration from Spring Cloud System to Dubbo System (Coexistence)

As previously mentioned, due to issues with service discovery models between SpringCloud and Dubbo, enabling address intercommunication necessitates corresponding adaptations on the Dubbo side. During the release of version 2.7.5, we will address this content in the "Service Self-Inspection" section. For now, we will assume the connection has been established. 

![10](/imgs/blog/2023/01/protocols/img_10.png)

Certain applications within the Dubbo system serve as transparent key nodes for connecting the two systems; some service provider applications must publish dual protocols, and some consumer applications must select protocols for consumption. Since modifications to the legacy Spring Cloud system are not permitted, the key for interconnecting the two architectures lies in the REST protocol. For applications on the Dubbo side:

* Some applications may consume services from SpringCloud via REST protocol;
* Some applications may expose services for SpringCloud consumers using the REST protocol;
* Internally within Dubbo's own system, communication can occur through a selected protocol, providing flexibility to choose between Dubbo, REST, or gRPC. If REST is chosen, the connection to SpringCloud becomes more natural as both sides utilize the same protocol.

For applications consuming Spring Cloud services, the service configuration would be:

```xml
<dubbo:reference interface ="xxx.SpringService" protocol="rest"/>
```

For applications exposing services for consumption by Spring Cloud, it can specify the service exposure as a REST protocol or dual-protocol exposure (if that service is intended for calls by applications in the new system):

```xml
<dubbo:service interface="xxx.NewService" protocol="rest,dubbo"/>
```

As maintainers of Dubbo, while we clearly lean towards discussing migration from SpringCloud to Dubbo, it is equally valid to consider the reverse; if you are currently using or planning to use Dubbo for microservice development, migrating from Dubbo to SpringCloud will follow the same line of reasoning. Dubbo's multi-protocol and multi-registry model provides the same flexibility for bi-directional migration.

### Migration from Self-Built Systems to Dubbo Systems (Coexistence)

This scenario is somewhat similar to the previous section on migration from SpringCloud. The key difference lies in the fact that the REST protocol is officially supported by Dubbo, whereas for private communication protocols within an existing microservice system, one must first extend the Dubbo Protocol to provide protocol-level support.

## Summary and Outlook

To achieve coexistence or migration between heterogeneous microservice architectures, the key is to bridge the `protocol` and `service discovery` across heterogeneous systems. Thanks to Dubbo's support for multiple protocols and registries, we can easily make Dubbo a bridge connecting heterogeneous microservice systems. Familiarity with Dubbo's multi-protocol implementation details might prompt concerns about performance impact due to the doubling of address numbers in scenarios with numerous services, as outlined in the "Leveraging Dubbo to Connect Heterogeneous Microservice Systems" section where we didn’t detail how to achieve transparent service discovery between heterogeneous systems. We will specifically elucidate this aspect involving service discovery in future articles, detailing how the new service discovery mechanism introduced in version 2.7.5 addresses these challenges. Please stay tuned for upcoming articles and the official Dubbo documentation.

