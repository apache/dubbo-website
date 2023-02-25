
---
type: docs
title: "Dubbo 3 Quick Facts"
linkTitle: "Dubbo 3 Quick Facts"
weight: 2
---

This article will take you to quickly understand the design background, overall architecture and core features of Dubbo3, and its relationship with typical users such as Alibaba HSF2, etc. You can also learn more in the following sections:
* **New users, take a quick look at the core features of Dubbo3:**
  * [Next Generation Communication Protocol - Triple](/en/docs3-v2/java-sdk/concepts-and-architecture/triple/)
  * [Secrets of a million-instance cluster - application-level service discovery](/en/docs3-v2/java-sdk/concepts-and-architecture/service-discovery/)
  * [Dubbo Mesh](/en/docs3-v2/java-sdk/concepts-and-architecture/mesh/)
* **Dubbo3 compatibility and migration cost?**
  * [Java - Migration Guide](/en/docs3-v2/java-sdk/upgrades-and-compatibility)
  * [Golang - Migration Guide](/en/docs3-v2/golang-sdk/)
* **Dubbo3 related resources:**
  * For more information, such as performance indicators, advanced feature descriptions, etc., please refer to [Multilingual SDK Implementation](/en/overview/mannual/)
  * Speeches and offline activities

### background

The design and development of Dubbo3 has two major backgrounds.

**First, how to better meet the demands of corporate practice. ** Since Dubbo was donated by Alibaba in 2011, it has been the preferred open source service framework for many large-scale enterprise microservice practices. During this period, the enterprise architecture has undergone changes from the SOA architecture to the microservice architecture, and the Dubbo community itself is constantly updating and iterating to better meet the demands of the enterprise. However, the limitations of Dubbo2 architecture are gradually highlighted in practice:
- **Protocol**, the Dubbo2 protocol is famous for its performance and simplicity, but it encounters more and more problems of versatility and penetration in the cloud-native era;
- **Scalability**, Dubbo2 is still far superior to many other frameworks in terms of scalability, but as microservices bring more applications and instances, we have to think about how to deal with the actual combat of larger-scale clusters;
- **Service Governance Ease of Use**, such as richer traffic governance, observability, intelligent load balancing, etc.

**Secondly, adapt to the development of cloud native technology stack. ** While microservices make the evolution of business development more flexible and fast, it also brings some unique features and requirements: such as the number of components after microservices is increasing, how to solve the stability of each component, how to quickly Horizontal expansion, etc., cloud-native infrastructure represented by Docker, Kubernetes, and Service Mesh has brought some new options to solve these problems. As more microservice components and capabilities are sinking to the infrastructure layer represented by Kubernetes, the traditional microservice development framework should eliminate some redundant mechanisms and actively adapt to the infrastructure layer to achieve capability reuse. Capabilities such as the life cycle and service governance of the microservice framework should be better integrated with the Kubernetes service orchestration mechanism; the microservice architecture represented by Service Mesh brings new options to microservice development, and Sidecar brings multilingual, transparent upgrades, and traffic control However, it also brings disadvantages such as operation and maintenance complexity and performance loss. Therefore, the traditional microservice system based on the service framework will still be the mainstream, and will still occupy half of the country in the long run, and will maintain mixed deployment for a long time state.

### Overall objective

Dubbo3 still maintains the classic architecture of 2.x. Its main responsibility is to solve the communication between microservice processes, and to better manage and control microservice clusters through rich service governance (such as address discovery, traffic management, etc.); The upgrade of the framework is comprehensive, reflected in almost every aspect of the core Dubbo features, through the upgrade to achieve a comprehensive improvement in stability, performance, scalability, and ease of use.

![architecture-1](/imgs/v3/concepts/architecture-1.png)

- **Common communication protocol.** The new RPC protocol should abandon the private protocol stack, use the more general HTTP/2 protocol as the transport layer carrier, and use the standardized features of the HTTP protocol to solve the problems of traffic versatility and penetration, so that the protocol can better respond Scenarios such as front-end and back-end docking, gateway proxy, etc.; supports the Stream communication mode, which meets the demands of different business communication models and brings greater throughput to the cluster.
- **For millions of cluster instances, the cluster is highly scalable.** With the promotion of micro-service practices, the scale of micro-service cluster instances is also constantly expanding, which benefits from the characteristics of light-weight micro-services and easy horizontal expansion, but also brings a burden to the entire cluster capacity, especially It is some centralized service governance components; Dubbo3 needs to solve various resource bottlenecks caused by the expansion of instance scale, and realize truly unlimited horizontal expansion.
- **Richer programming model, less business intrusion.** In the development state, the business application is programmed for Dubbo SDK. In the running state, the SDK and the business application run in the same process. The ease of use, stability and resource consumption of the SDK will greatly affect the business application; therefore, 3.0 should have More abstract API, more friendly configuration mode, less encroachment on business application resources, and higher availability.
- **Easier to use and richer service governance capabilities.** The dynamic nature of microservices has brought high complexity to the governance work, and Dubbo has been doing a good job in this regard. It is the earliest batch of governance capability definers and practitioners; 3.0 needs to be oriented to richer scenarios. Provides capabilities such as observability, security, grayscale release, error injection, external configuration, and unified governance rules.
- **Fully embrace cloud native.**

### Facing the pain points of enterprise production practice

Dubbo2 is still the preferred open source service framework in China. It is widely used in almost all digital transformation enterprises such as the Internet, financial insurance, software companies, and traditional enterprises, and has been tested in a large-scale production environment. Take Alibaba, a contributor and typical user of Dubbo2, as an example. The HSF2 framework maintained internally by Alibaba based on Dubbo2 has experienced previous double-eleven peak tests. Billions of RPC calls are made every day, and more than ten million service instances are managed. In the long-term optimization and practical accumulation, Alibaba has a vision and plan for the next-generation service framework, and began to evolve rapidly internally, and was quickly contributed to the Apache community. Just like Alibaba, the practical demands of other users are related to Pain points are also rapidly accumulating in the open source community, forming a consistent direction and technical solutions. It can be said that the birth of Dubbo3 comes from the accumulation of a large base of enterprise users, in order to better meet their practical demands.

![dubbo3-hsf](/imgs/v3/concepts/dubbo-hsf.png)

Dubbo3 integrates a large amount of service management experience of Alibaba HSF2 and other community enterprises. Currently, Dubbo3 has been fully applied to the production practice environment. Banks, Fenghuodi, Ping An Health, etc. The virtuous circle formed by the cooperation between the community and users has greatly promoted the development of Dubbo3. Alibaba has completely replaced the internally maintained HSF2 framework with the community version of Dubbo3. Their practical experience has promoted the stability of Dubbo3 on the one hand, and is positively It is enough to continuously export the practical experience of service governance to the open source community.

### For millions of cluster instances, horizontal scalability

With the accumulation of practical experience in microservices, microservices are split into finer grains and deployed to more and more machine instances to support the growing business scale. Among many Dubbo2 enterprise users, especially large-scale enterprises represented by finance, insurance and the Internet, they began to encounter cluster capacity bottlenecks (for typical cases, please refer to Industrial and Commercial Bank of China Practice Cases:
* **Service discovery process**
  * The data storage scale of the registration center reaches the capacity bottleneck
  * Data registration & push efficiency is seriously reduced
* **Dubbo Process**
  * Occupy more machine resources, resulting in lower utilization of business resources
  * Frequent GC affects business stability

Dubbo3 solves these problems very well in design. The service governance (service discovery) model implemented through the new design can realize the data transmission and data storage on the service discovery link to reduce by about 90% on average; at the same time, Dubbo3 itself is in the business In the process, it becomes lighter and more stable, achieving a 50% increase in resource utilization.

A greater advantage of Dubbo3 lies in its improvement of the stability of the overall architecture. The new service discovery architecture makes it easier and more accurate to evaluate the capacity and scalability of the entire cluster.

![capacity](/imgs/v3/concepts/capacity.png)

If application development is roughly divided into two levels: business development and operation and maintenance deployment, factors that change frequently include services (interfaces), applications, and machine instances. In the 2.x era, the growth of all these three factors will affect the overall capacity of the microservice cluster, especially the fluctuation caused by the increase or decrease of interfaces, which is very opaque to the overall capacity assessment. In 3.0, the change of cluster capacity is only related to the two factors of application name and machine instance, and the objects of capacity evaluation are often applications and instances, so the entire cluster becomes more stable and transparent.

### Cloud Native

In the cloud-native era, changes in the underlying infrastructure are profoundly affecting application deployment, operation and maintenance, and even the development process. It also affects the selection and deployment mode of Dubbo3 microservice technology solutions.

#### Next Generation RPC Protocol

The new-generation Triple protocol is based on HTTP/2 as the transport layer, has better gateway and proxy penetration, natively supports Stream communication semantics, and is compatible with the gRPC protocol.

#### Multilingual Friendly

Dubbo3 has taken multilingual friendliness as a key consideration in terms of service definition, RPC protocol, serialization, and service governance. Currently, it provides stable multilingual versions of Java and Golang, and 3.0 implementations of more language versions such as Rust , Javascript, C/C++, C#, etc. are under development and construction.

#### Kubernetes

Applications developed by Dubbo3 can be natively deployed on the Kubernetes platform. Dubbo3 has been designed to be aligned with container scheduling platforms such as Kubernetes in terms of address and life cycle; for users who want to further reuse the underlying infrastructure capabilities of Kubernetes, Dubbo3 has also been connected to the native The Kubernetes Service system.

#### Service Mesh

Service Mesh emphasizes the role of the control plane in microservice governance, which to a certain extent promotes the expansion and standardization of the control plane communication protocol and scope of responsibility; the Sidecar model under the traditional Mesh architecture emphasizes the unified control of traffic by bypass agents to achieve Features such as transparent upgrade, multilingual non-sense, and no business intrusion.

Dubbo3 provides a Dubbo Mesh solution based on its own thinking, emphasizing the unified management and control of microservice clusters. In terms of deployment architecture, it supports both sicecar and proxyless deployment architecture without sidecar. Users who use Dubbo Mesh are based on their own business Features will have more options for deployment architectures.

#### Heterogeneous System Interoperability

We are seeing more and more requests for interoperability of heterogeneous microservice systems, such as Dubbo, Spring Cloud, gRPC, etc. Some are due to the migration of the technology stack, and some are due to the need to achieve business intermodulation after the merger of the organization. With the help of the new service discovery model and the flexible and scalable RPC protocol, Dubbo3 can become the future development goal of Dubbo3.
