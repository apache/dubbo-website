---
aliases:
    - /en/docs3-v2/golang-sdk/preface/
    - /en/docs3-v2/golang-sdk/preface/
    - /en/overview/mannual/golang-sdk/preface/
    - /en/overview/mannau/golang-sdk/preface/concept/
    - /en/overview/mannau/golang-sdk/preface/concept/protocol/
description: Dubbo-go Framework
linkTitle: Framework Introduction
title: Framework Introduction
type: docs
weight: 1
---

## What is dubbo-go
Dubbo-go is the Go language implementation of Apache Dubbo, fully adhering to Apache Dubbo's design principles and goals, and serves as an excellent microservices development framework in the Go language domain. Dubbo-go offers:
* **API and RPC Protocols**: Solves RPC communication problems between components, providing HTTP/1/2 based communication protocols and streaming communication models.
* **Rich Microservice Governance Capability**: Addresses service discovery, traffic control, observability, full-link tracing, logging, and other overall solutions for microservices.

## Concepts and Architecture
Below is the overall architecture diagram of dubbo-go:
![dubbo-go architecture](/imgs/golang/architecture/arc.png)

Dubbo-go generally follows a `framework core + plugin` design concept. The left side, `framework core`, defines some core concepts of dubbo-go as a microservice framework, while the right side, `plugin`, provides extension implementations of core concepts.

The `framework core` can be divided into four levels, from top to bottom:
* API Layer: Supports service contract definitions based on IDL and interface/struct, balancing cross-language and usability needs; supports microservice configuration based on pure YAML files; provides synchronous, asynchronous, unary, and streaming RPC communication and encoding models.

* Service Governance Layer: Built-in multidimensional service governance capabilities ensure meeting core requirements for microservice development and cluster governance. This includes service discovery, load balancing, observability metrics, traffic management, and tracing.

* RPC Protocol Layer: The core RPC protocol implemented by dubbo-go is the triple protocol, which works over HTTP/1/2 (supports direct access via CURL) and is compatible with gRPC. Dubbo-go also supports multi-protocol service publishing.

* Transport Layer: Supports HTTP/1/2 and TCP transport layers, balancing performance and generality, while supporting various serialization methods.

The `plugin` system greatly enriches dubbo-go's functionality and ecosystem, with numerous built-in extension implementations provided by the community. Developers can easily add extension implementations as needed. Here are some typical plugin definitions:

* Protocol: Built-in support for triple, dubbo2, REST protocols through the protocol plugin, allowing for extension to more protocols.
* Service Discovery: Supports mainstream registry integration like Nacos, Zookeeper, Polaris.
* Traffic Management: Supports traffic rules defined in the Dubbo ecosystem.
* Metrics: Offers rich built-in metrics for RPC calls.
* Logging: Provides a general logging collection interface definition.
* Tracing: Offers distributed tracing capabilities, integrating with tracing systems like Zipkin, Jaeger, Skywalking.

Below is the core components and their relationships from the perspective of the kernel source:
![img](/imgs/docs3-v2/golang-sdk/concept/more/app_and_interface/dubbogo-concept.png)

### RPC
#### Triple
Based on the Dubbo-defined [triple protocol](/en/overview/reference/protocols/triple/), you can easily write browser and gRPC compatible RPC services that run simultaneously on HTTP/1 and HTTP/2. As part of the multi-language RPC system of Apache Dubbo, dubbo-go offers a complete implementation of the triple protocol.

![dubbo multi-language implementation](/imgs/golang/architecture/language.png)

For more details on cross-language or cross-product interoperability of dubbo-go, please refer to the following links:
* [Interoperability with other Dubbo multi-language systems - based on triple+protobuf](../tutorial/interop-dubbo/)
* [Interoperability with Dubbo2 Java - based on dubbo2+hessian2](../tutorial/interop-dubbo)
* [Interoperability with gRPC systems](../tutorial/interop-grpc)

#### Multi-Protocol Support
In addition to the triple protocol, dubbo-go supports more RPC protocols and serialization methods:

| Protocol        | Protocol Name (for configuration) | Serialization Method           | Default Serialization Method |
| --------------- | ------------------------------- | ------------------------------- | ---------------------------- |
| Triple (Recommended) | tri                          | pb/json/custom                | pb                           |
| Dubbo           | dubbo                           | hessian2                       | hessian2                     |
| jsonRPC         | jsonrpc                        | json                           | json                         |
| REST            | rest                           | json                           | json                         |

#### Filter
As shown below, a filter is an AOP-like request interception mechanism. Every RPC request will be intercepted by the filter.

![dubbo multi-language implementation](/imgs/golang/architecture/filter.png)

Core capabilities of dubbo-go, such as timeout settings, access logs, and metrics, are all implemented through built-in filters.

#### Streaming
![dubbo multi-language implementation](/imgs/golang/architecture/streaming.png)

* Server streaming RPC: Similar to a unary RPC but returns a series of streaming responses to a single client request.
* Client streaming RPC: Similar to unary RPC where the client sends a series of streaming requests, and the server returns one response for all received requests.
* Bidirectional streaming RPC: In this type of request, the client initiates the request and the server can respond immediately or wait for further streaming data from the client.

### Service Governance
Dubbo-go provides comprehensive service governance capabilities, including service discovery, observability, full-link tracing, and traffic control. You can use dubbo-go to develop and manage microservice clusters and achieve interoperability with other language systems in Apache Dubbo.

#### Service Discovery
![img](/imgs/architecture.png)

The types of registries supported by dubbo-go are as follows. Please refer to the usage tutorial [Service Discovery](../tutorial/service-discovery/) for specific configuration methods:

| Registry      | Registry Name (for configuration) |
| ------------- | ---------------------------------- |
| Zookeeper     | zookeeper                          |
| Nacos         | nacos                              |
| Etcd          | etcd                               |
| Polaris       | polaris                            |

#### Observability
Dubbo-go's observable metric collection follows the [metrics specification](https://dubbo.apache.org/en/docs/overview/reference/Metrics/standard_metrics/) defined by Apache Dubbo. The most common method is to export to Prometheus and visualize via Grafana.

For specific enabling methods, please refer to the usage manual [Observability](../tutorial/observability/).

#### Full-Link Tracing
Dubbo-go supports full-link tracing systems like Zipkin, Jaeger, and Skywalking via OpenTelemetry.

For specific enabling methods, please refer to the usage manual [Tracing](../tutorial/tracing/).

#### Traffic Control
The traffic governance rules implemented by dubbo-go fully comply with Dubbo framework-designed traffic governance capabilities. More details can be found through the following links:
* [Dubbo Traffic Governance Rule Design](/en/overview/core-features/traffic/)
* [Dubbo Traffic Governance Example Task](/en/overview/tasks/traffic-management/)

