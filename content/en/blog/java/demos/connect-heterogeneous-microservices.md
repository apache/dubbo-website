---
title: "Using Dubbo to Connect Heterogeneous Microservice Systems"
linkTitle: "Using Dubbo to Connect Heterogeneous Microservice Systems"
tags: ["Java"]
date: 2019-06-22
description: >
  In this article, we will explore how to leverage Dubbo's support for multiple protocols and service discovery models to achieve interconnection between heterogeneous microservice systems.
---

From the perspective of programming development, Dubbo is primarily an RPC service framework, with its greatest advantage being its interface-oriented proxy service programming model, which shields developers from the underlying remote communication details. At the same time, Dubbo is also a service governance framework, providing service discovery, traffic scheduling, and other governance solutions for distributed microservices.

In this article, we will try to break through the Dubbo system itself against this foundational capability and explore how to utilize Dubbo’s support for multiple protocols and service discovery models to achieve interconnection between heterogeneous microservice systems. In actual business scenarios, this can be used to solve communication issues in coexisting heterogeneous technology systems, helping companies achieve smooth migration between these systems and addressing address discovery and traffic scheduling issues in large-scale, cross-regional, multi-cluster deployments.

## Interface-Oriented Proxy Transparent Service Development Framework

Let's start from the well-known concept that **Dubbo is a microservice development framework**. Just as Spring is a fundamental framework for developing Java applications, we often choose Dubbo as the foundational framework for microservice development. I believe the biggest advantage of the Dubbo framework lies in its interface-oriented programming model, which makes developing remote service calls as natural as developing local services (using Java as an example):

1. Service Definition

```java
public interface GreetingsService {
    String sayHi(String name);
}
```

2. Consumer-side Service Call

```java
// Completely transparent, just like calling a local service.
@Reference
private GreetingService greetingService;

public void doSayHello(String name) {
  greetingService.sayHi("Hello world!");
}
```

The following diagram illustrates the basic operating principle of Dubbo, where service providers and consumers coordinate addresses through a registry, using an agreed protocol for data exchange.

![Dubbo basic work flow](/imgs/architecture.png) 


## Challenges Faced by Homogeneous/Heterogeneous Microservice Systems

Details about Dubbo protocols and related service governance functionalities are not the focus of this article. Today, we will look at the challenges faced by companies in building microservice systems internally from a higher level, and explore what solutions Dubbo can provide for architectural selection and migration.

Microservices within a company may all be developed based on the same service framework, such as Dubbo, which we refer to as a **homogeneous microservice system**. On the other hand, some companies may have microservices developed using multiple different service frameworks, referred to as **heterogeneous microservice systems**. The coexistence of multiple microservice systems using different technology stacks within large organizations is still quite common, and there can be many reasons for this situation. For instance, it could stem from legacy systems, ongoing technology stack migrations, or independent selections made by various business departments to meet their specific needs (which also indicates the long-term coexistence of heterogeneous microservice systems).

**1. Coexistence of Heterogeneous Microservice Systems**

One challenge that comes to mind is: **Different systems usually employ different RPC communication protocols and maintain independent registry clusters. How can we achieve transparent address discovery and transparent RPC calls among these multiple protocols and registries?** If we do nothing, each microservice system will only be aware of the service status within its own system, and traffic will be closed off to its own system. Achieving smooth migration from system A to system B or maintaining long-term coexistence among multiple systems within the company will be crucial to solve the interconnectedness of different systems and realize transparent traffic scheduling.

![2](/imgs/blog/microservices.png) 


**2. Inside the Dubbo System**

**The issues of multiple protocols and multiple registries can exist within homogeneous microservice systems, especially when the scale of microservices within an organization grows to a certain size.**

* We may need to adopt different communication protocols between different services since they face different business scenarios, leading to different data transmission characteristics. For instance, in typical scenarios: we might use Dubbo protocol for ordinary business services, HTTP protocol for services interacting with the FrontEnd, and gRPC protocol for business needing streaming data transmission.

* Another common issue within the Dubbo system is that, in large-scale distributed deployments, microservice systems may deploy across regions and registries. This brings up the need for address synchronization and traffic scheduling among multiple clusters.

In summary, **both homogeneous and heterogeneous systems face issues related to multi-protocol communication and address discovery among multiple registry clusters.** Dubbo currently supports multiple protocols and registries, designed specifically to address the scenarios analyzed above within homogeneous systems. Therefore, we will start discussing the basic support for multi-protocols and multi-registries in homogeneous systems before exploring how to extend this capability to facilitate interconnection between heterogeneous microservice systems.

## Multi-Protocol and Multi-Registry Mechanism within the Dubbo System

We will present two scenario examples to illustrate the usage and working principles of Dubbo's multi-protocol and multi-registry mechanisms.

### Multi-Protocol

![multiregistries.png](/imgs/blog/multiregistries.png) 

The above is a set of microservices developed using Dubbo, which uses different protocols for communication. Based on our research, it is a very common requirement within companies to utilize multiple protocols, and we will not elaborate further on specific scenarios here.

Application B, acting as a service provider, publishes 5 services, among which:

* `DemoService1` and `DemoService2` are published using the `dubbo` protocol.
* `DemoService3` and `DemoService4` are published using the `gRPC` protocol.
* `DemoService0` is published using both `dubbo` and `gRPC` protocols.

Application A, acting as a consumer, consumes `DemoService1` and `DemoService2` using the dubbo protocol and consumes `DemoService0` using the gRPC protocol.

Application B, acting as a consumer, consumes `DemoService2` and `DemoService4` using the gRPC protocol and consumes `DemoService0` using the dubbo protocol.

Here are the specific code configurations:

1. Provider-side Application B

```xml
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService1" protocol="dubbo"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService2" protocol="dubbo"/>

<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService3" protocol="grpc"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService4" protocol="grpc"/>

<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService0" protocol="dubbo, grpc"/>
```

2. Consumer-side Application A

```xml
<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService1"/>
<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService2"/>

<dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService0"/>
```

3. Consumer-side Application C

```xml
<dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService3"/>
<dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService4"/>

<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService0"/>

```

#### Current State of Dubbo Multi-Protocol Support

Dubbo currently supports protocols including Dubbo, REST, Thrift, gRPC, JsonRPC, Hessian, etc., covering most mainstream RPC communication protocols in the industry. It is crucial to note that the support for these protocols is achieved through direct integration with the official releases, which I believe is an excellent choice, ensuring the stability of protocol parsing while allowing the Dubbo community to focus more on improving the governance capabilities surrounding Dubbo. Just think about how much effort and time the Dubbo community would need to provide implementations for each protocol to achieve stable, production-ready statuses.

In addition to the officially supported protocols, thanks to Dubbo's flexible extension mechanism, it is very easy to extend protocols for Dubbo, and developers can add more protocol support at any time, including custom protocol extensions.

For support related to gRPC (HTTP/2) protocols, please refer to the previous document.

![dubbo-screen.png](/imgs/blog/dubbo-screen.png) 

#### Problems Solvable by Multi-Protocol

* Seamlessly integrate RPC frameworks into Dubbo's service governance system.

  By incorporating RPC protocols into Dubbo's service development ecosystem through protocol extension, we can reuse Dubbo's programming model and capabilities such as service discovery and traffic management. For example, gRPC, with a relatively weak governance system and less user-friendly programming API, is difficult to implement directly for microservice development.

* Meet different scenario calling needs.

  Various services may be developed to meet different business requirements and the technology stacks of external consumer applications may vary, so enabling different communication protocols can optimize communication needs for various scenarios.

* Achieve protocol migration.

  By supporting multiple protocols, and leveraging the coordination of the registry, we can quickly meet the needs of protocol migration within the company, such as upgrading from a custom protocol to the Dubbo protocol or migrating from the REST protocol to the Dubbo protocol.

### Multi-Registry

When the service cluster scale is small, a centralized cluster deployment solution can effectively resolve our business issues. However, as application scale grows and user traffic increases, we must consider introducing cross-regional, multi-cluster deployment solutions for business systems. This is where the registries closely related to the business systems also face selection challenges in their deployment schemes:

1. Continue to maintain a globally shared registry cluster. The advantage of this architecture is simplicity; the downside is that the registry cluster, due to needing to store complete address data, will experience increased storage and push pressures. Additionally, for certain registry products (like Zookeeper), stability and performance may face challenges when deployed across clusters.

2. Deploy independent registry clusters for each business cluster. The advantage of a multi-registry cluster approach is that it can resolve cross-cluster network availability issues and also reduce storage and push pressures on the registry. The downside is that it requires the service framework (like Dubbo) to have the capability to publish/listen to multiple registry clusters simultaneously.

Next, we will specifically look at the solutions that Dubbo provides for multi-registry cluster scenarios.

![multisubscribe.png](/imgs/blog/multisubscribe.png) 

The above diagram shows two business clusters deployed in Beijing and Shanghai, respectively, with each business cluster having its independent registry cluster. We need to solve the problem of transparent RPC communication between the two business clusters.

1. Provider-side, dual-registry publishing

```xml
<dubbo:registry id="beijingRegistry" address="zookeeper://${zookeeper.address1}" default="false"/>
<dubbo:registry id="shanghaiRegistry" address="zookeeper://${zookeeper.address2}" />
                                                                                          
<dubbo:service interface="org.apache.dubbo.samples.multi.registry.api.HelloService" ref="helloService" registry="shanghaiRegistry,beijingRegistry"/>
<dubbo:service interface="org.apache.dubbo.samples.multi.registry.api.DemoService" ref="demoService" registry="shanghaiRegistry,beijingRegistry"/>

```

2. Consumer-side, subscribing based on consumption needs with single/dual registries

```xml
<dubbo:registry id="beijingRegistry" address="zookeeper://${zookeeper.address1}" default="false" preferred="true" weight="100"/>
<dubbo:registry id="shanghaiRegistry" address="zookeeper://${zookeeper.address2}" default="true" weight="20"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.DemoService"/>

<dubbo:reference  interface="org.apache.dubbo.samples.multi.registry.api.DemoService" registry="beijingRegistry, shanghaiRegistry"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.HelloService" registry="beijingRegistry"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.HelloService" registry="shanghaiRegistry,shanghaiRegistry"/>

```

#### Dubbo's Support for Heterogeneous Registry Clusters

While we will perform multi-registry cluster deployments, usually, we deploy similar registry products, such as Zookeeper or Nacos. For registry migration scenarios, it's necessary for Dubbo to provide support for more registry products or, most importantly, to have good extensibility. The registry implementations currently supported by the official Dubbo include:

![dubbo-screen2.png](/imgs/blog/dubbo-screen2.png) 

One point that needs special mention is that the current service registration/discovery model in Dubbo is interface-based. From version 2.7.5, Dubbo introduced an application-level service registration/discovery model. This not only helps to optimize Dubbo’s current service discovery mechanism and enhance service capacity but is also crucial for connecting with microservice systems represented by SpringCloud (this will be further mentioned in the next chapter). More information on "Application-level Service Discovery: Service Self-Discovery" will be provided in upcoming articles or documents, so please stay tuned.

#### Traffic Scheduling Issues Brought by Multi-Subscription

With the introduction of multi-registry clusters, Dubbo adds a layer of load balancing between multi-registry clusters during traffic selection:

![cluster-lb.png](/imgs/blog/cluster-lb.png) 

At the Cluster Invoker level, the supported selection strategies include (in version 2.7.5+, see documentation for specific usage):

* Specify Priority

  ```xml
  <!-- Addresses from the preferred="true" registry will be selected first, only falling back to other registries if the preferred center has no available addresses. -->
  <dubbo:registry address="zookeeper://${zookeeper.address1}" preferred="true" />
  ```

* Same Zone Priority

  ```xml
  <!-- The selection process matches the zone key in the flow, prioritizing traffic dispatch to addresses in the same zone. -->
  <dubbo:registry address="zookeeper://${zookeeper.address1}" zone="beijing" />
  ```

* Weighted Round Robin

  ```xml
  <!-- Addresses from Beijing and Shanghai clusters will be allocated traffic in a 10:1 ratio. -->
  <dubbo:registry id="beijing" address="zookeeper://${zookeeper.address1}" weight=”100“ />
  <dubbo:registry id="shanghai" address="zookeeper://${zookeeper.address2}" weight=”10“ />
  ```

* Default, stick to any available

#### Scenarios for Multi-Registry to Be Applicable

* Same Zone Traffic Priority Scheduling

  Due to disaster recovery or service scalability needs, services/applications often need to be deployed in multiple independent data centers/zones. Achieving same-zone traffic priority scheduling in scenarios where each zone has an independent registry cluster can effectively resolve latency and availability issues.

* Registry Migration

  Services within a company might have always been stored in a certain registry, such as Zookeeper, but at some point, for various reasons, when migration to another registry is necessary, the multi-registry model can ensure a smooth transition.

* Interconnection of Heterogeneous Systems

  Services developed within different microservice systems are confined to their own service discovery systems, whereas through a unified multi-registry model, services from different systems can mutually discover one another.

## Connecting Heterogeneous Microservice Systems Using Dubbo

As mentioned above, there are various reasonable possibilities for the existence of heterogeneous microservice systems within an organization. Now, let’s look specifically at the actual scenarios of heterogeneous microservice systems and the solutions for achieving interconnection using Dubbo. First, let's examine what a scenario of interconnecting heterogeneous microservice systems looks like through a diagram.

![heterogeneous.png](/imgs/blog/heterogeneous.png) 

As shown in the diagram, some microservices can be constructed based on SpringCloud, gRPC, K8S, or custom systems, and they are, by default, isolated from one another. When we build a microservice system based on Dubbo, leveraging Dubbo's multi-protocol and multi-service discovery model, we can achieve mutual interconnection between various microservice systems. Furthermore, as indicated by the orange arrows in the diagram, using the Dubbo system as a bridging layer, we can also connect two heterogeneous microservice systems.

For the following scenarios, since there is currently no unified standard for address discovery, let’s assume that there are no barriers at the address discovery level between different systems. We will focus on the basic migration process and the communication protocol aspects (the address discovery part will be further explored in the upcoming article "Service Self-Discovery: Based on Application-Level Service Discovery").

### Protocol Migration within the Dubbo System (Coexistence)

Most developers have an inherent understanding of Dubbo: if using Dubbo to develop microservice systems, employing Dubbo protocol as the communication protocol between services is the optimal solution. In fact, we do not need to be confined to the Dubbo RPC protocol. Dubbo as a microservice development framework and Dubbo as an RPC protocol are two separate concepts and can be viewed independently. For instance, it is entirely acceptable to use REST or gRPC communications in business systems developed using the Dubbo framework (refer to the list of protocols supported by Dubbo). The choice of protocol should be based on business characteristics and technology planning for optimal fit.

![grpcrest.png](/imgs/blog/grpcrest.png) 

Currently, in the context of cloud-native and Mesh, HTTP1/2 and gRPC protocols are receiving increasing attention. One reason is that they perform better in standardization, receive broader support from network devices and infrastructure, and possess better universality and penetration. For many enterprises willing to migrate to cloud-native solutions, migrating to such protocols will undoubtedly be more beneficial for future architectural upgrades.

The following diagram illustrates an intermediate state of migrating from Dubbo protocol to gRPC protocol within the Dubbo framework.

![migrate.png](/imgs/blog/migrate.png) 

* The leftmost side represents an old application that has not yet migrated. This type of application still needs to consume and provide services using Dubbo protocol during the migration process.
* The middle represents applications in the migration process; some may be service providers providing Dubbo protocol services to left-side legacy systems while also providing gRPC services to right-side new systems. Thus, they are exposing services with dual protocols.
* The rightmost side represents new applications that have been developed or migrated completely; they can now communicate entirely using gRPC protocol.
* Ultimately, after passing through this intermediate state, we hope that all applications will reach the leftmost application state, achieving complete communication using gRPC protocol.

### Migration from Spring Cloud System to Dubbo System (Coexistence)

As previously mentioned, due to service discovery model issues between SpringCloud and Dubbo, achieving address interconnection between the two systems requires relevant adaptations on the Dubbo side. This part will be published in the upcoming 2.7.5 version under "Service Self-Discovery", and for now, we will assume that this has been addressed.

![migrate-final.png](/imgs/blog/migrate-final.png) 

Within the Dubbo system, certain applications act as key nodes for transparently connecting the two systems where some service provider applications need to publish dual protocols while some consumer applications need to consume using selected protocols. As the legacy Spring Cloud system does not allow any modifications, the critical connection between the two systems is the REST protocol. For applications on the Dubbo side:

* Some applications may need to consume SpringCloud services using REST protocol;
* Some applications may need to expose REST protocol for SpringCloud consumption;
* Within Dubbo itself, communication can occur through a selected protocol, offering flexibility such as using Dubbo, REST, gRPC, etc. If opting for REST protocol, interconnection with SpringCloud system becomes more natural since both ends utilize the same protocol.

To consume Spring Cloud services, applications need to configure the service as follows:

```xml
<dubbo:reference interface ="xxx.SpringService" protocol="rest"/>
```

For services provided to be consumed by Spring Cloud, either exposing the service as a REST protocol or dual-protocol exposure is necessary (to ensure this service can still be called by new system applications):

```xml
<dubbo:service interface="xxx.NewService" protocol="rest,dubbo"/>
```

As maintainers of Dubbo, while there is a clear inclination here, emphasizing how to migrate from SpringCloud to Dubbo, the reverse scenario should also be considered. If you have already chosen or are about to select Dubbo for developing microservices, the same approach applies when migrating from Dubbo to SpringCloud in the future. Dubbo's multi-protocol and multi-registry model provides the same flexibility for bidirectional migration.

### Migration from Custom Systems to Dubbo System (Coexistence)

This scenario is somewhat similar to the previous section on the migration from SpringCloud, with the main difference being that REST protocol is officially supported by Dubbo, whereas private communication protocols within the existing microservice system will require you to extend Dubbo Protocol to provide support at the protocol level.

## Summary and Outlook

To achieve coexistence or migration between heterogeneous microservice systems, the key points are to establish connections between the `protocol` and `service discovery` of the heterogeneous systems. Thanks to Dubbo's support for multi-protocol and multi-registry models, we can easily make Dubbo a bridging layer for heterogeneous microservice systems. Colleagues familiar with the details of Dubbo's multi-protocol implementations may worry that in scenarios with numerous services, multi-protocol registration could cause the address count to double, thus affecting the address push performance. Additionally, in the section of the article titled "Connecting Heterogeneous Microservice Systems Using Dubbo", we did not provide a detailed explanation on how to realize transparent service discovery between heterogeneous systems. We will elaborate on this aspect related to service discovery in upcoming articles, exploring how the new service discovery mechanism introduced in Dubbo 2.7.5 addresses this issue. Please stay tuned for future articles and the official Dubbo documentation.

