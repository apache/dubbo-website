---
title: "Apache Dubbo Next Generation Cloud Native Microservices Challenge Registration Open! Five Major Topics with a 500,000 RMB Prize Pool Await You"
linkTitle: "Apache Dubbo Next Generation Cloud Native Microservices Challenge Registration Open! Five Major Topics with a 500,000 RMB Prize Pool Await You"
date: 2024-01-18
tags: ["News Updates"]
description: >
    Organized by the OpenAtom Foundation, registration for the Apache Dubbo Next Generation Cloud Native Microservices Challenge is now open! Five major topics with a 500,000 RMB prize pool await your participation.
---

This article provides a detailed interpretation of the competition topics. For the official registration channel of the OpenAtom Open Source Foundation, please refer to the link and QR code at the end of the article.

## Topic Interpretation
We look forward to participating teams to continuously explore high-performance Triple (HTTP/3) protocol design, a robust Benchmark acceptance system, zero-trust solutions, and Service Mesh architecture, jointly defining the next generation cloud-native microservice system, bringing benefits in performance and security to the open-source community and enterprise users.

The competition consists of five topics:
* High-performance transmission protocol based on HTTP/3 (Java)
* Automated Dubbo framework and protocol performance Benchmark mechanism and platform (language不限)
* Design and implement a zero-trust security mechanism (including Java/Golang SDK adaptation and certificate management)
* Next generation microservice cluster monitoring mechanism for cloud-native, covering Kubernetes, Nacos, etc. (Golang)
* A cross-cluster communication solution and implementation between Kubernetes and traditional VM microservice clusters (Golang)

### 1 High-performance transmission protocol based on HTTP/3 (Java)

#### 1.1 Topic Background and Goals
The main goal of this topic is to adapt the triple protocol in Dubbo to HTTP/3 and fulfill all core capabilities in the triple protocol specification.

For related examples using the Dubbo3 triple protocol, please refer to (be sure to read the other related examples linked in the README): [https://github.com/apache/dubbo-samples/tree/master/1-basic](https://github.com/apache/dubbo-samples/tree/master/1-basic). By running the example, you can understand the current functionality of the triple protocol.

The following is the Triple protocol specification: [https://cn.dubbo.apache.org/zh-cn/overview/reference/protocols/triple-spec/](https://cn.dubbo.apache.org/zh-cn/overview/reference/protocols/triple-spec/)

#### 1.2 Topic Explanation

Please develop based on the Apache Dubbo Java implementation from the 3.3 branch, and the code repository link is as follows:
[https://github.com/apache/dubbo/tree/3.3](https://github.com/apache/dubbo/tree/3.3)

Source code for triple protocol related implementations:

- [https://github.com/apache/dubbo/tree/3.2/dubbo-rpc/dubbo-rpc-triple](https://github.com/apache/dubbo/tree/3.2/dubbo-rpc/dubbo-rpc-triple)
- [https://github.com/apache/dubbo/tree/3.3/dubbo-remoting/dubbo-remoting-http12](https://github.com/apache/dubbo/tree/3.3/dubbo-remoting/dubbo-remoting-http12)

Developers can modify the Dubbo source code implementation based on their understanding, such as adapting HTTP/3 at the remoting layer. There are no restrictions on the topic implementation and any network library or framework such as Netty can be used.

#### 1.3 Reference Links

- [https://github.com/grpc/proposal/blob/master/G2-http3-protocol.md](https://github.com/grpc/proposal/blob/master/G2-http3-protocol.md)
- [https://devblogs.microsoft.com/dotnet/http-3-support-in-dotnet-6/](https://devblogs.microsoft.com/dotnet/http-3-support-in-dotnet-6/)
- [https://github.com/netty/netty-incubator-codec-http3](https://github.com/netty/netty-incubator-codec-http3)
- [https://webtide.com/jetty-http-3-support/](https://webtide.com/jetty-http-3-support/)

### 2 Automated Dubbo framework and protocol performance Benchmark mechanism and platform (language不限)

#### 2.1 Topic Background and Goals
As an RPC framework, Apache Dubbo comes with two high-performance communication protocols:

- The triple protocol, a high-performance communication protocol based on TCP.
- The dubbo protocol, a high-performance communication protocol based on HTTP that supports Streaming communication models.

The planned benchmark platform must theoretically have the capacity to test any protocol, with the actual output focusing on the dubbo and triple protocols.

#### 2.2 Topic Explanation

- Build a mechanism and process that supports dubbo benchmark acceptance, for reference the current one supporting Java language is [https://github.com/apache/dubbo-samples](https://github.com/apache/dubbo-samples)
- Provide performance metrics for dubbo and triple protocols, and display them visually in an intuitive manner
- Identify performance bottlenecks and suggest or implement optimizations

#### 2.3 Reference Materials

- [https://github.com/benchmark-action/github-action-benchmark](https://github.com/benchmark-action/github-action-benchmark)
- [https://grpc.io/docs/guides/benchmarking/](https://grpc.io/docs/guides/benchmarking/)
- Triple Protocol Specification [https://cn.dubbo.apache.org/zh-cn/overview/reference/protocols/triple-spec/](https://cn.dubbo.apache.org/zh-cn/overview/reference/protocols/triple-spec/)
- Dubbo Protocol Specification [https://cn.dubbo.apache.org/zh-cn/overview/reference/protocols/tcp/](https://cn.dubbo.apache.org/zh-cn/overview/reference/protocols/tcp/)
- Understand the basic usage of dubbo [https://github.com/apache/dubbo-samples](https://github.com/apache/dubbo-samples)

### 3 Design and Implementation of a Zero Trust Security Mechanism (including Java/Golang SDK Adaptation and Certificate Management)
#### 3.1 Topic Background and Goals
The direct goal of this topic is to provide TLS/mTLS support for Dubbo RPC data communication. However, having merely the corresponding APIs and underlying TCP links is insufficient. To create a comprehensive microservice solution, we aim to establish a zero-trust security system as follows:

![openatom-2024](/imgs/blog/2024/01/openatom/security.png)

The topic involves data push from the control plane to the data plane (Dubbo SDK) such as certificate updates, authentication rules, authorization rules, etc. We plan to use the xDS protocol for this push link.

The main responsibilities of several core components in the architectural design are:

1. Control Plane Component
   1. Acts as CA to manage certificate issuance and rotation, handle authentication/authorization rule conversions, and provide xDS Server to push certificates and rules to the data plane
   2. Receives authentication/authorization rules with a well-defined rule set, supporting control over TLS/mTLS behavior, such as when to enable mTLS; also supports configuration matching conditions for authentication/authorization, further details can be found in the reference links below
   3. xDS Protocol, provides xDS Server responsible for pushing certificates and rules.

2. Data Plane Component (Dubbo SDK)
   1. The Dubbo framework adapts to the xDS channel, receiving certificates and rules

#### 3.2 Topic Explanation
This topic stems from the overall zero-trust solution of the Dubbo system, where the content described in the above architectural diagram represents the core objectives of the overall solution.

Participants can contribute in two sections:

1. Data Plane (Dubbo SDK), a mandatory section wherein participants provide xDS security mechanism adaptation support for the Dubbo SDK (Java/Go). If participants choose not to develop the control plane section, they may use any control plane xDS Server, such as Istio, to assist in development; processes and rules may also directly use Istio, with the goal of completing the SDK overall flow.
2. Control Plane, an optional section, involves customizing the control plane provided by the Dubbo community to realize a comprehensive zero-trust solution.

##### 3.2.1 Data Plane (Dubbo SDK) Development Guide:

- The community has provided basic code for adapting xDS in the Dubbo SDK; participants can directly focus on the security-related xDS content and adapt the received certificates, rules, etc., into the Dubbo framework.
- Participants should consider the extensibility of Dubbo's authentication and authorization capabilities. For example, provide a set of generic authentication and authorization APIs where this topic can be one of the extension implementations sourced from the xDS control plane; in the future, it can be expanded to include other certificate sources beyond xDS channels.

Relevant source code repositories:

- Dubbo Java source code: [https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-xds](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-xds)
- Dubbo Go source code: [https://github.com/apache/dubbo-go/tree/main/xds](https://github.com/apache/dubbo-go/tree/main/xds)

##### 3.2.2 Control Plane Development Guide:
The xDS Server of the control plane will be implemented by the official community, and participants should focus on the design and implementation of security-related components.

Control plane source code repository: [https://github.com/apache/dubbo-kubernetes](https://github.com/apache/dubbo-kubernetes)

#### 3.3 Reference Materials
Overall, this topic aims to construct a universal zero-trust system, offering the following industry implementations as references:

- [https://istio.io/latest/docs/concepts/security/](https://istio.io/latest/docs/concepts/security/)
- [https://github.com/grpc/proposal/blob/master/A29-xds-tls-security.md](https://github.com/grpc/proposal/blob/master/A29-xds-tls-security.md)
- [https://kuma.io/docs/2.5.x/policies/mutual-tls/](https://kuma.io/docs/2.5.x/policies/mutual-tls/)
- [https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol#xds-protocol-delta](https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol#xds-protocol-delta)

### 4 Next Generation Microservice Cluster Monitoring Mechanism for Cloud Native, Covering Kubernetes, Nacos (Golang)

#### 4.1 Topic Background and Goals
Overall visualization and control of microservices is an important issue. The broader context of this topic is the overall visualization project being advanced by the Apache Dubbo community. We plan to implement a unified visualization console that can be compatible with traditional registries like Zookeeper/Nacos, Kubernetes Services, and Service Mesh architectures:

- Microservice cluster data visualization, including basic information displays of applications, services, instances, etc., within the cluster.
- Monitoring-related. Using Metrics data reported to Prometheus via the Dubbo SDK, the console displays relevant monitoring metrics by querying Prometheus and drawing call chain diagrams and dependency diagrams, etc.
- Traffic control. Supports traffic control rules with visual editing, previewing, and issuing.

##### 4.1.1 Overall Goal
Compared to the earlier version of Dubbo Admin, we expect a comprehensive upgrade in deployment architecture and feature richness for the new version of the console.

Participants should focus on the following directions:

- Provide a generic microservice adaptation layer abstraction (including ideas like Application, Service, Instance, etc.), as a unified data source for the new version of the console, shielding differences in underlying Nacos, Kubernetes, and Service Mesh architectures. The official repository currently provides a basic reference design and implementation.
- Design console functions and provide complete implementation. The official reference interactive effect diagrams are provided.

From a user GUI perspective, the menu design can be as follows:

- Home Dashboard
- Resource Details
   - Application
   - Service
   - Instance
- Traffic Control

#### 4.2 Topic Explanation
The official has provided reference implementations for the back-end adaptation layer and part of the front-end interaction design drafts. Participants can base their development design on these. Specific scoring standards can be referred to in the official registration channel.

1. Back-end: [https://github.com/apache/dubbo-kubernetes/tree/master/pkg/admin](https://github.com/apache/dubbo-kubernetes/tree/master/pkg/admin)

2. Front-end code framework: https://github.com/apache/dubbo-kubernetes/tree/master/ui-vue3

#### 4.3 Reference Materials

- [https://github.com/kiali/kiali](https://github.com/kiali/kiali)
- [https://github.com/codecentric/spring-boot-admin](https://github.com/codecentric/spring-boot-admin)
- [https://github.com/apache/dubbo-admin](https://github.com/apache/dubbo-admin)
- [https://github.com/istio/istio](https://github.com/istio/istio)

### 5 A Cross-Cluster Communication Solution and Implementation Between Kubernetes and Traditional VM Microservice Clusters (Golang)

#### 5.1 Topic Background and Goals

In Apache Dubbo's latest plan, we aim to fully support the following deployment architectures:

##### 5.1.1 Traditional Registry Center Mode

![5-1-vm](/imgs/blog/2024/01/openatom/5-1-vm.png)

##### 5.1.2 Registry Center Mode Based on Kubernetes Scheduling

![5-2-kubernetes](/imgs/blog/2024/01/openatom/5-2-kubernetes.png)

##### 5.1.3 Proxyless Service Mesh Mode Based on Kubernetes Service

![5-3-kubernetes-service](/imgs/blog/2024/01/openatom/5-3-kubernetes-service.png)

The control plane is built by the Dubbo community, and the repository is located at: [https://github.com/apache/dubbo-kubernetes](https://github.com/apache/dubbo-kubernetes)

#### 5.2 Topic Interpretation
Due to various reasons such as network models, registries, etc., the above three deployment architectures are often isolated from each other, making communication between these architectures very difficult.

To achieve communication among multiple cluster addresses, routing rules, etc., we provide a cross-cluster deployment example architecture diagram as follows

![5-4-kubernetes-service](/imgs/blog/2024/01/openatom/5-4-multiple-cluster.png)

The red parts indicate the data flow across clusters, where the solid red part represents control plane data flow, and the dashed red part represents data plane data flow.

##### 5.2.1 Why Cross-Cluster Communication?

The following scenarios may utilize this:

1. Kubernetes migration, wishing to migrate from traditional Zookeeper registry center architecture to a Kubernetes cluster deployment or expecting to use the Kubernetes Service service model
2. Multi-cluster deployment on Kubernetes, Dubbo microservices communication across multiple Kubernetes clusters
3. Hybrid deployment, mixed deployment of traditional registry clusters, Kubernetes clusters, and Kubernetes Service (Service Mesh) architectures

##### 5.2.2 Expected User Experience Delivery

1. Kubernetes Service: `dubboctl install --mode=kubernetes --ingress-enabled`
2. Kubernetes: `dubboctl install --mode=universal --ingress-enabled`
3. Traditional VM:
	* `dubbo-cp run --registry-address=nacos://xxx``
	* `dubbo-dp run --control-plane=xxx`
4. For cross-cluster, an additional global cluster needs to be deployed, with usage similar to the above.

##### 5.2.1 Main Deliverables
Using the above diagram as an example, participants should primarily focus on:

1. Development and construction of the control plane and Ingress (no need to focus on Dubbo SDK side, including xDS communication between the SDK and control plane; this can be assumed to be ready), including providing support for necessary components for cross-cluster communication in the new solution.
2. Building cross-cluster global control capabilities.

Dubbo currently offers a basic implementation of the control plane including service discovery based on the xDS server, which can continue to be expanded to implement cross-cluster solutions. Project source code: [https://github.com/apache/dubbo-kubernetes](https://github.com/apache/dubbo-kubernetes)

#### 5.3 Reference Materials

1. [https://istio.io/](https://istio.io/)
2. [https://kuma.io/docs/2.5.x/production/deployment/multi-zone/](https://kuma.io/docs/2.5.x/production/deployment/multi-zone/)

## Registration Method

### Registration Link

[OpenAtom Foundation Official Registration Channel](https://competition.atomgit.com/competitionInfo?id=be48a38bb1daf499bd5c98ac8a3108fd)

### Q&A Group

For any questions about the competition topics, please scan to join the following DingTalk group:

![5-4-kubernetes-service](/imgs/blog/2024/01/openatom/dingding-group.png)

### Competition Details Poster

![openatom-2024](/imgs/blog/2024/01/openatom/openatom-2024.png)

