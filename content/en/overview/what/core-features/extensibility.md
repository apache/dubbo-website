---
aliases:
    - /en/overview/core-features/extensibility/
    - /en/overview/core-features/extensibility/
description: Extension Adaptation
feature:
    description: |
        Everything is extensible. Customize invocation and control behaviors through extensions (Filter, Router, Service Discovery, Configuration, etc.) to adapt to the open-source microservice ecosystem.
    title: Extensibility
linkTitle: Extension Adaptation
title: Extension Adaptation
type: docs
weight: 6
---



Dubbo is designed to be highly extensible. Through these extension points, you can:
* Intercept traffic and control traffic behavior
* Optimize some of Dubbo's default strategies and implementations as needed
* Adapt Dubbo services to internal microservice clusters or other mainstream open-source components

## Everything is Extensible

Dubbo's extensibility allows the Dubbo project to be conveniently divided into sub-modules, achieving hot-plug features. Users can completely replace Dubbo's native implementations based on their own needs to meet their business requirements.

![Admin Effect Diagram](/imgs/v3/advantages/extensibility.png)

* **Protocol and Encoding Extensions**. Communication protocols, serialization encoding protocols, etc.
* **Traffic Control Extensions**. Cluster fault tolerance strategies, routing rules, load balancing, rate limiting, degradation, circuit breaker strategies, etc.
* **Service Governance Extensions**. Registry, configuration center, metadata center, distributed transactions, full-link tracing, monitoring systems, etc.
* **Diagnostics and Tuning Extensions**. Traffic statistics, thread pool strategies, logging, QoS operation commands, health checks, configuration loading, etc.


## Microservice Ecosystem Based on Extension Points
Numerous extension points and abstractions are the foundation for Dubbo to interface with many microservice ecosystem components and achieve microservice governance capabilities.

* [Full-Link Tracing](../../tasks/observability/tracing/)
* [Data Consistency](../../tasks/ecosystem/transaction/)
* [Rate Limiting and Degradation](../../core-features/traffic/circuit-breaking/)

Dubbo's SDK implementations in various languages adopt the "microkernel + plugin" design pattern. Almost all core nodes in the process are defined as extension points. The components released by the official team are also released in the form of extension point implementations. Therefore, Dubbo can treat all official and third-party component extensions equally.
* Extension adaptation capability is key to realizing Dubbo's microservice ecosystem. Adaptations of Dubbo ecosystem components such as full-link tracing and registry implementations are based on extension points like Filter, Registry, DynamicConfiguration, etc.
* Extension adaptation brings maximum flexibility to users. Developers can integrate internal company components at any time and customize core capabilities as needed.

![extensibility-echosystem.png](/imgs/v3/feature/extensibility/arc.png)

The above are some core extension point definitions and implementations within Dubbo, divided by architectural layers into three levels:
* Protocol Communication Layer
* Traffic Control Layer
* Service Governance Layer

## Protocol Communication Layer
In the communication protocol section, we emphasized that Dubbo does not bind to any protocol. Users can choose any RPC remote communication protocol such as Triple, gRPC, Dubbo2, REST, or custom protocols. In addition, the data encoding format (i.e., serialization protocol) above the RPC protocol is also defined through extension points. Users can flexibly choose the combination of RPC and serialization communication protocols.

![Protocol and Encoding Diagram](/imgs/v3/feature/extensibility/protocol.png)

### Protocol
The Protocol extension point defines the RPC protocol. Using this extension point allows Dubbo to serve as a unified microservice development and governance framework while achieving flexible switching on the underlying communication protocol. The official team has released adaptations for most mainstream RPC communication protocols, which you can use directly with a few simple configurations. If you want to use a custom RPC communication protocol for your company, please implement a custom extension through the Protocol.

### Serialization
The Serialization extension point defines the serialization protocol extension. Dubbo officially provides adaptations for serialization protocols such as Fastjson, Protobuf, Hessian2, Kryo, FST, etc.

## Traffic Control Layer
Dubbo has preset many extension points in the service invocation chain. Through these extension points, users can control the runtime traffic direction and change runtime invocation behaviors. Many traffic control capabilities built into Dubbo, such as load balancing strategies, traffic routing strategies, timeouts, etc., are implemented through these extension points.

![Protocol and Encoding Diagram](/imgs/v3/feature/extensibility/traffic.png)

### Filter
The Filter traffic interceptor is an AOP design pattern above Dubbo service invocation. Filters are used to perform some preprocessing and post-processing actions for each service invocation. Using Filters, you can complete tasks such as access logging, encryption and decryption, traffic statistics, parameter validation, etc. Many ecosystem adaptations in Dubbo, such as rate limiting and degradation with Sentinel, full-link tracing with Tracing, etc., are implemented through the Filter extension. Multiple Filters can be embedded in a single request process, and Filters are independent of each other without dependencies.
* From the consumer's perspective, it performs some preprocessing work based on request parameters before initiating the request and some post-processing on the response result after receiving the response.
* From the provider's perspective, it performs some preprocessing after receiving the access request and before returning the response result.

### Router
The Router is a key component in Dubbo's traffic control, forwarding traffic that meets certain conditions to a subset of addresses in a specific group. It is the foundation for some of Dubbo's key traffic control capabilities, such as proportional traffic forwarding and traffic isolation. Each service call request flows through a set of routers (router chain), with each router calculating a subset of addresses based on predefined rules, the full address list, and the current request context, then passing it to the next router. This process repeats until a valid subset of addresses is obtained.

The official Dubbo release comes with a rich set of traffic control rules and router implementations, as described in the [Traffic Control](../traffic/) document. Users can achieve various modes of traffic control by issuing rules. If there are other traffic control requirements, custom router extensions can be provided.

### Load Balance
In Dubbo, Load Balance works after the router. For each service call, load balancing is responsible for selecting a machine instance from the subset of addresses output by the router chain, ensuring that calls are evenly distributed across all machines in the subset over time.

Dubbo provides several load balancing strategies, including weighted random, weighted round-robin, consistent hashing, least active priority, and shortest response time priority. It also offers load balancing algorithms that adapt based on cluster load.

## Service Governance Layer
Below is a classic architecture diagram of Dubbo deployment, where the registry (service discovery), configuration center, and metadata center form the core of the entire service governance.

![Service Governance Architecture Diagram](/imgs/v3/concepts/threecenters.png)

Here, we mainly analyze Dubbo service governance from the perspectives of architecture and implementation. Many of Dubbo's core service governance capabilities are implemented through the key components described in the diagram. Users interact directly with the registry, configuration center, and metadata center through various rules and configurations issued by the control plane or Admin, as well as the display of various microservice cluster states.

In terms of specific implementation or deployment, the registry, configuration center, and metadata center can be the same component. For example, Zookeeper can serve as the registry, configuration center, and metadata center simultaneously, and the same goes for Nacos. Therefore, the three centers are only divided based on architectural responsibilities. You can even use the same Zookeeper cluster to handle all three responsibilities by setting them to the same cluster address in the application.

> In cloud-native deployment architectures, with the popularity of Kubernetes and Service Mesh architectures, microservice infrastructure is trending towards decentralization. The responsibilities of the registry, configuration center, and metadata center are being replaced by components like Kubernetes and Istio. For more details, refer to the [Service Mesh](../service-mesh/) section.

### Registry
The registry is the foundation for Dubbo's service discovery capabilities. Dubbo officially supports registries like Zookeeper, Nacos, Etcd, Consul, and Eureka.

By supporting Consul and Eureka, Dubbo also achieves address and communication layer interoperability with the Spring Cloud ecosystem, making it easier for users to deploy Dubbo and Spring Cloud simultaneously or migrate from Spring Cloud to Dubbo.

### Config Center
The configuration center is a key component for users to dynamically control Dubbo's behavior. All rules issued in the [Traffic Management](../../tasks/traffic-management) tasks are first sent to the configuration center for storage. Dubbo instances then listen for changes in the configuration center, receive routing rules, and achieve traffic control behavior.

Dubbo officially supports configuration centers like Zookeeper, Nacos, Etcd, Redis, and Apollo.

### Metadata Center
In contrast to the configuration center, the metadata center is read-only from the user's perspective. The only writer to the metadata center is the Dubbo process instance. After startup, Dubbo instances report some internal states (such as service lists, service configurations, service definition formats, etc.) to the metadata center, which serves as a data source for governance capabilities like service testing, documentation management, and service status display.

Dubbo officially supports metadata centers like Zookeeper, Nacos, Etcd, and Redis.

## Custom Extension Examples

The following examples demonstrate how to extend Dubbo to solve practical problems. You can follow the examples to learn.

* [Custom RPC Protocol](../../tasks/extensibility/protocol/)
* [Custom Traffic Routing Rules](../../tasks/extensibility/router/)
* [Custom Registry](../../tasks/extensibility/registry/)
* [Custom Interceptor](../../tasks/extensibility/filter/)

## More Extension Points
This document lists some commonly used extension points in Dubbo, but there are many more extension points available for flexible customization. The extension definitions and configuration methods also vary across different language SDKs. Below are the extension point manuals for Dubbo SDKs.

* [Java Extension Point Manual](../../mannual/java-sdk/reference-manual/spi/description/)
* [Go Extension Point Manual](../../mannual/golang-sdk/preface/design/aop_and_extension/)

It seems like you haven't pasted the Markdown content yet. Please provide the content you need translated, and I'll handle the translation while adhering to the specified rules.
