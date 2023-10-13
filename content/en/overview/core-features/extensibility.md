---
description: Extensibility Adaptation
feature:
    description: |
        Everything is extendable. Customize behaviors of invocation and management (like Filters, Routers, Service Discovery, Configuration, etc.) to adapt to the open-source microservices ecosystem.
    title: Extensibility
linkTitle: Extensibility Adaptation
title: Extensibility Adaptation
type: docs
weight: 50
---

From its design, Dubbo is highly extendable. Through these extension points, you can:
* Intercept traffic and control its behavior.
* Fine-tune some of Dubbo's default strategies and implementations.
* Adapt Dubbo services to internal microservices clusters or other mainstream open-source components.

## Everything is Extendable

Dubbo's extensibility allows the project to be conveniently divided into various sub-modules, enabling hot plugging. Users can replace Dubbo's native implementation based on their needs to meet specific business requirements.

![Admin Screenshot](/imgs/v3/advantages/extensibility.png)

* **Protocol and Coding Extension**: Communication protocols, serialization protocols, etc.
* **Traffic Control Extension**: Cluster fault tolerance strategies, routing rules, load balancing, rate limiting, fallback, circuit breaking, etc.
* **Service Governance Extension**: Service registry, configuration center, metadata center, distributed transactions, full-link tracing, monitoring systems, etc.
* **Diagnostic and Tuning Extension**: Traffic statistics, thread pool strategies, logging, QoS maintenance commands, health checks, configuration loading, etc.

## Microservices Ecosystem Based on Extension Points
Numerous extension points and abstractions form the foundation for Dubbo's integration with various microservices ecosystem components and the realization of microservices governance capabilities.

* [Full-link Tracing](/zh-cn/overview/tasks/observability/tracing/)
* [Data Consistency](/zh-cn/overview/tasks/ecosystem/transaction/)
* [Rate Limiting & Fallback](/zh-cn/overview/core-features/traffic/circuit-breaking/)

Dubbo's SDKs for various languages adopt the "microkernel + plugin" design pattern. Almost all core nodes in every process are defined as extension points. Officially released components are also released in the form of extension point implementations, so Dubbo can treat all official and third-party component extensions equally.
* Extensibility adaptation is key to realizing Dubbo's microservices ecosystem. Ecosystem components, such as full-link tracing and service registry implementations, are adapted based on extension points like Filter, Registry, and DynamicConfiguration.
* Extensibility adaptation offers users the highest flexibility, allowing developers to integrate with internal components and customize core capabilities as needed.

![extensibility-echosystem.png](/imgs/v3/feature/extensibility/arc.png)

The above are some core extension points within Dubbo, categorized by architectural levels:
* Protocol Communication Layer
* Traffic Control Layer
* Service Governance Layer

## Protocol Communication Layer
As emphasized in the communication protocol section, Dubbo is not bound to any specific protocol. Users can select any combination of RPC and serialization protocols, such as Triple, gRPC, Dubbo2, REST, custom protocols, etc.

![Protocol and Coding Principles](/imgs/v3/feature/extensibility/protocol.png)

### Protocol
The Protocol extension point defines the corresponding RPC protocol. By utilizing this extension point, Dubbo can act as a unified microservices development and governance framework, allowing for flexibility in the underlying communication protocol. Officially supported are the most popular RPC communication protocols, and if you wish to use a company-specific RPC communication protocol, provide a custom extension implementation via Protocol.

### Serialization
The Serialization extension point defines serialization protocol extensions. Officially, Dubbo offers serialization protocols like Fastjson, Protobuf, Hessian2, Kryo, and FST.

## Traffic Control Layer
Dubbo pre-embeds a significant number of extension points in the service call link, allowing users to control the flow of runtime traffic and change the behavior of runtime calls.

![Protocol and Coding Principles](/imgs/v3/feature/extensibility/traffic.png)

### Filter
Filters, traffic interceptors in Dubbo, are based on the AOP design pattern. They preprocess and postprocess each service call, handling tasks like access logs, encryption/decryption, traffic statistics, parameter verification, etc.

### Router
The Router is a key component for traffic control in Dubbo. It directs traffic that meets certain conditions to a specific group of address subsets, enabling various traffic control modes.

### Load Balance
In Dubbo, Load Balance works after the router. It ensures that calls are evenly distributed across all machines in the address subset over a period of time.

## Service Governance Layer
The classic Dubbo deployment architecture consists of a registry (service discovery), configuration center, and metadata center.

![Service Governance Architecture](/imgs/v3/concepts/threecenters.png)

This section primarily discusses Dubbo's service governance from an architectural and implementation perspective.

### Registry
The registry is the foundation for Dubbo's service discovery capability, with official support for registries like Zookeeper, Nacos, Etcd, Consul, and Eureka.

### Config Center
The configuration center is a key component for dynamically controlling Dubbo's behavior. All rules dispatched in [Traffic Management](../../../../zh-cn/overview/tasks/traffic-management) are first saved in the configuration center.

### Metadata Center
In contrast to the configuration center, from a user's perspective, the metadata center is read-only.

## Custom Extension Examples
The following examples demonstrate how to extend Dubbo to address practical problems.

* [Custom RPC Protocol](/zh-cn/overview/tasks/extensibility/protocol/)
* [Custom Traffic Routing Rule](/zh-cn/overview/tasks/extensibility/router/)
* [Custom Registry](/zh-cn/overview/tasks/extensibility/registry/)
* [Custom Interceptor](/zh-cn/overview/tasks/extensibility/filter/)

## More Extension Points
This article lists some of the commonly used extension points in Dubbo. However, there are many more extension points available for flexible customization. Each SDK for different languages may have variations in extension definitions and configuration methods.

* [Java Extension Manual](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/)
* [Go Extension Manual](/zh-cn/overview/mannual/golang-sdk/preface/design/aop_and_extension/)
* [Java Extension Manual](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/)
* [Go Extension Manual](/zh-cn/overview/mannual/golang-sdk/preface/design/aop_and_extension/)
