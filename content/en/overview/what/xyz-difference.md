---
aliases:
    - /en/overview/what/xyz-difference/
description: ""
linkTitle: Relationship with gRPC, Spring Cloud, Istio
title: Relationship with gRPC, Spring Cloud, Istio
type: docs
weight: 2
---



Many developers often ask about the relationship between Apache Dubbo and Spring Cloud, gRPC, and some Service Mesh projects like Istio. Explaining their relationships is not difficult; you just need to follow this article and delve deeper into the Dubbo documentation. In general, some of their capabilities overlap, but in some scenarios, you can use them together.

Although this document is written by Dubbo maintainers, we will still strive to objectively and transparently present the connections and differences between Dubbo and other components. However, considering that everyone's familiarity with different products varies, some expressions here may not be entirely accurate. We hope this can help developers.

## Dubbo and Spring Cloud

![dubbo-springcloud](/imgs/v3/difference/dubbo-springcloud.png)

From the above diagram, we can see that Dubbo and Spring Cloud have many similarities. They are both positioned at the same level in the overall architecture and provide some similar functionalities.

* **Both Dubbo and Spring Cloud focus on abstracting common problem patterns in distributed systems (such as service discovery, load balancing, dynamic configuration, etc.)**. They provide supporting component implementations for each problem, forming a comprehensive microservice solution that allows users of Dubbo and Spring Cloud to focus on business logic development when developing microservice applications.
* **Both Dubbo and Spring Cloud are fully compatible with the Spring application development model**. Dubbo has well adapted to the Spring application development framework and the Spring Boot microservice framework. Since Spring Cloud originates from the Spring ecosystem, this point is naturally more evident.

Although they have many similarities, due to their significant differences in background and architectural design, **they differ greatly in performance, applicable microservice cluster scale, production stability assurance, and service governance**.

Spring Cloud's advantages include:
* While both support the Spring development ecosystem, Spring Cloud receives more native support.
* It abstracts some common microservice patterns such as service discovery, dynamic configuration, asynchronous messaging, etc., and also touches on areas like batch processing tasks, scheduled tasks, and persistent data access.
* Based on HTTP communication mode, along with relatively comprehensive introductory documentation, demo, and starters, it gives developers an easier initial experience.

Spring Cloud's issues include:
* It only provides abstract pattern definitions without official stable implementations. Developers have to seek implementation suites from different vendors like Netflix, Alibaba, Azure, etc., each varying in completeness, stability, and activity.
* It offers a microservice full-stack solution but is not ready-to-use. While demos are easy to start with, the cost of implementation and long-term use is very high.
* Lacks service governance capabilities, especially in traffic control aspects like load balancing and traffic routing.
* The programming model and communication protocol are bound to HTTP, posing obstacles in performance and interoperability with other RPC systems.
* The overall architecture and implementation are only suitable for small-scale microservice cluster practices. As the cluster scale grows, issues like address push efficiency and memory usage bottlenecks arise, making migration to other systems difficult.
* Many microservice practice scenarios require users to solve problems independently, such as graceful shutdown, startup warm-up, service testing, dual registration, dual subscription, delayed registration, service isolation by group, cluster fault tolerance, etc.

All these points are **Dubbo's advantages**:
* Fully supports Spring & Spring Boot development models, while providing equivalent capabilities to Spring Cloud in basic patterns like service discovery and dynamic configuration.
* It is an overall output of enterprise-level microservice practice solutions. Dubbo considers various issues encountered in enterprise microservice practices, such as graceful online and offline, multiple registration centers, traffic management, etc., thus having lower long-term maintenance costs in production environments.
* Offers more flexible choices in communication protocols and encoding, including RPC communication layer protocols like HTTP, HTTP/2 (Triple, gRPC), TCP binary protocols, REST, etc., and serialization encoding protocols like Protobuf, JSON, Hessian2, supporting single-port multi-protocol.
* Dubbo emphasizes service governance capabilities in its design, such as dynamic weight adjustment, tag routing, conditional routing, etc., supporting multiple modes like Proxyless to integrate into the Service Mesh ecosystem.
* High-performance RPC protocol encoding and implementation.
* Dubbo is a framework developed for ultra-large-scale microservice cluster practice scenarios, capable of scaling to a million-instance cluster level, addressing various issues brought by cluster growth.
* Dubbo provides multi-language implementations beyond Java, making it possible to build a multi-language heterogeneous microservice system.

If your goal is to build enterprise-level applications and you expect more ease and stability in future maintenance, we recommend that you gain a deeper understanding of Dubbo's usage and its capabilities.
> The lack of introductory materials for Dubbo is a disadvantage compared to Spring Cloud. This is reflected in the completeness of dependency configuration management, documentation, and demo examples. The entire community is currently focusing on building this part, hoping to lower the threshold for users to experience and learn Dubbo on the first day, so that developers do not miss out on such an excellent product due to a lack of documentation.

## Dubbo and gRPC
The biggest difference between Dubbo and gRPC lies in their positioning:
* **gRPC is positioned as an RPC framework**. Google's core goal in launching it is to define the rpc communication specification and standard implementation in the cloud-native era;
* **Dubbo is positioned as a microservice development framework**. It focuses on solving the problems of microservice practice from service definition, development, communication to governance. Therefore, Dubbo provides capabilities such as RPC communication, adaptation with application development frameworks, and service governance.

Dubbo does not bind to a specific communication protocol, meaning that Dubbo services can communicate through multiple RPC protocols and support flexible switching. Therefore, you can choose gRPC communication in microservices developed with Dubbo. **Dubbo is fully compatible with gRPC and has designed gRPC as one of the built-in native supported protocols**.

![dubbo-grpc](/imgs/v3/difference/dubbo-grpc.png)

If you value the communication protocol based on HTTP/2 and the service definition based on Protobuf, and based on this, decide to choose gRPC as the microservice development framework, you are likely to encounter obstacles in future microservice business development. This is mainly because gRPC does not provide the following capabilities for developers:
* Lack of a development model integrated with business application frameworks. Users need to define, publish, or call microservices based on the underlying RPC API of gRPC, and there may be issues with integration with business application development frameworks in between.
* Lack of microservice peripheral ecosystem extensions and adaptations, such as service discovery, rate limiting, degradation, and link tracing, with few official implementations to choose from, and very difficult to extend.
* Lack of service governance capabilities. As an RPC framework, it lacks abstraction for service governance capabilities.

Therefore, gRPC is more suitable as an underlying communication protocol specification or codec package, while Dubbo can be used as an overall microservice solution. **For the gRPC protocol, we recommend the combination of Dubbo + gRPC**. At this time, gRPC is just a communication protocol hidden at the bottom, not perceived by microservice developers. Developers develop services based on the API and configuration provided by Dubbo and govern services based on Dubbo's service governance capabilities. In the future, developers can also use Dubbo's ecosystem and open-source IDL supporting tools to manage service definitions and publishing.

If we ignore the gap of gRPC on the application development framework side and only consider how to bring service governance capabilities to gRPC, another mode that can be adopted is to use gRPC under the Service Mesh architecture. This leads to the content we will discuss in the next section: the relationship between Dubbo and the Service Mesh architecture.

## Dubbo and Istio
Service Mesh is a microservice architecture born in the context of cloud-native in recent years. Under the Kubernetes system, it allows more capabilities in microservice development, such as traffic interception and service governance, to sink and become infrastructure, making microservice development and upgrades lighter. Istio is an open-source representative implementation of Service Mesh. It is divided into data plane and control plane from the deployment architecture, which is basically consistent with the [Dubbo overall architecture](../overview). The main changes brought by Istio are:
* Data plane: Istio achieves transparent interception of service traffic by introducing Sidecar. Sidecar is usually deployed together with traditional microservice components developed by Dubbo, etc.
* Control plane: The previously abstract service governance center is aggregated into a specific component with a unified implementation and seamlessly adapted to underlying infrastructures such as Kubernetes.

**Dubbo has fully integrated with the Istio system. You can use the Istio control plane to govern Dubbo services. In terms of data plane deployment architecture, Dubbo also supports a proxyless mode to address the complexity and performance issues introduced by Sidecar.** In addition, the Dubbo Mesh system also solves many problems in the implementation process of the Istio architecture, including providing a more flexible data plane deployment architecture and lower migration costs.

![Dubbo-Mesh](/imgs/v3/mesh/mix-mesh.png)

From the perspective of the **data plane**, Dubbo supports the following two development and deployment modes, which can achieve governance of data plane services through control plane components such as Istio, Consul, and Linkerd.
* Proxy mode: Dubbo is deployed together with Envoy. Dubbo exists as a programming framework & protocol communication component, and traffic control is achieved through interaction between Envoy and the Istio control plane.
* Proxyless mode: The Dubbo process remains independently deployed, and Dubbo directly connects to control plane components such as Istio through the standard xDS protocol.

From the perspective of the **control plane**, Dubbo can connect to the native Istio standard control plane and rule system. For some old version Dubbo users, Dubbo Mesh provides a smooth migration solution. For details, please refer to [Dubbo Mesh Service Mesh](../../tasks/mesh/).

It seems like you haven't pasted the Markdown content yet. Please provide the content you need translated, and I'll handle the translation for you.
