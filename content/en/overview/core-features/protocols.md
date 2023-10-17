---
type: docs
title: "Protocols"
linkTitle: "Protocols"
weight: 40
description: "Protocols"
feature:
  title: Multiple Protocols
  description: >
     Dubbo supports almost all the protocols from HTTP/2, gRPC, TCP, REST to Thrift, choose any RPC protocols you need with only one line of configuration. It also allow you to publish different protocols on a single port.
---

The Dubbo framework offers custom, high-performance RPC communication protocols: the HTTP/2-based Triple protocol and the TCP-based Dubbo2 protocol. Additionally, Dubbo supports any third-party communication protocols, such as officially supported ones like gRPC, Thrift, REST, JsonRPC, Hessian2, and more. Further protocols can be implemented through custom extensions. This is particularly useful for handling multi-protocol communication scenarios, which are common in microservices practices.

**The Dubbo framework is not tied to any specific communication protocol. In its implementation, Dubbo's support for multiple protocols is highly flexible. It allows you to publish services that use different protocols within a single application. Furthermore, it supports exposing all protocols externally through the same port.**

![protocols](/imgs/v3/feature/protocols/protocol1.png)

Through Dubbo framework's support for multiple protocols, you can achieve:
* Seamlessly integrate any communication protocol into the Dubbo service governance system. All communication protocols under the Dubbo ecosystem can leverage Dubbo's programming model, service discovery, and traffic control advantages. For instance, in the case of gRPC over Dubbo, both service governance and programming APIs can be seamlessly integrated into the Dubbo ecosystem at zero cost.
* Compatibility with different technology stacks, allowing for a mix of different service frameworks and RPC frameworks in a business system. For example, some services may be developed using gRPC or Spring Cloud, while others use the Dubbo framework. Through Dubbo's support for multiple protocols, interoperability can be achieved seamlessly.
* Simplifying protocol migration. By coordinating multiple protocols with the registry center, you can quickly meet the company's needs for protocol migration. For example, migrating from a proprietary protocol to the Dubbo protocol, upgrading the Dubbo protocol itself, migrating from the Dubbo protocol to gRPC, or transitioning from HTTP to the Dubbo protocol, and so on.

## HTTP/2 (Triple)
Triple protocol, introduced in Dubbo 3, is a communication protocol designed for the cloud-native era. It is based on HTTP/2 and fully compatible with the gRPC protocol. Triple natively supports streaming communication semantics. It can run on both HTTP/1 and HTTP/2 transport protocols, allowing you to directly access backend Dubbo services using tools like curl or a web browser.

Since the introduction of the Triple protocol, Dubbo also supports service definition and data transmission based on Protocol Buffers. However, Triple's implementation is not bound to Interface Definition Language (IDL). For example, you can directly use Java Interface to define and publish Triple services. Triple possesses better gateway and proxy penetration capabilities, making it well-suited for deployment architectures involving cross-gateway and proxy communication, such as service meshes.

Key features of the Triple protocol include:

* Support for TLS encryption and plaintext data transmission
* Support for backpressure and flow control
* Support for streaming communication
* Simultaneous support for HTTP/1 and HTTP/2 transport protocols

In terms of programming and communication models, the Triple protocol supports the following modes:

* Client-side asynchronous request-response
* Server-side asynchronous request-response
* Client-side request streaming
* Server-side response streaming
* Bidirectional streaming communication

Development Practice

* For the usage of the Triple protocol, please refer to the [Triple Protocol Development Tasks](../../tasks/triple/) or the [Java SDK Example Documentation](../../../docs3-v2/java-sdk/reference-manual/protocol/triple/).
* [Triple Design Ideas and Protocol Specifications](/zh-cn/overview/reference/protocols/triple/)

## Dubbo2

The Dubbo2 protocol is an RPC communication protocol built on top of the TCP transport layer protocol. Due to its compact, flexible, and high-performance characteristics, it gained widespread use during the Dubbo2 era. It served as a key communication solution for enterprises to build high-performance, large-scale microservice clusters. In the cloud-native era, we recommend using the Triple protocol for its greater generality and better penetration.

The Dubbo2 protocol also has built-in support for HTTP, so you can use curl for quick service validation or debugging during development.

* [Dubbo2 Protocol Development Tasks](../../../docs/v2.7/dev/impls/protocol/)
* [Dubbo2 Design Ideas and Protocol Specifications](/zh-cn/overview/reference/protocols/tcp/)

## gRPC

You can develop and manage microservices using Dubbo and then set up underlying communication using the gRPC protocol. But why do this instead of directly using the gRPC framework, and what advantages does it offer in comparison? The simple answer is that this is a common pattern for developing microservices using gRPC. Please read on for more details.

gRPC is Google's open-source communication protocol based on HTTP/2. As we mentioned in our [Product Comparison](/zh-cn/overview/what/xyz-difference/) document, gRPC is positioned as a communication protocol and its implementation, making it a pure RPC framework. On the other hand, Dubbo is positioned as a microservices framework, providing solutions for microservices practices. Therefore, compared to Dubbo, gRPC lacks abstractions for microservices programming models, service governance, and other capabilities.

Using the gRPC protocol (gRPC over Dubbo Framework) within the Dubbo ecosystem is a highly efficient and lightweight choice. It allows you to use the native gRPC protocol for communication while avoiding the complexity of customizing and developing based on gRPC (customizing and developing with gRPC is an inevitable step in many enterprise-scale practices, and the Dubbo framework handles this for developers, enabling them to use gRPC in the simplest way possible).

[gRPC over Dubbo Example](/zh-cn/overview/tasks/protocols/grpc/)

## REST

A common communication pattern in the microservices domain is HTTP + JSON. This includes mainstream microservices frameworks like Spring Cloud and Microprofile, which default to using this communication pattern. Dubbo also provides support for programming and communication patterns based on HTTP.

* [HTTP over Dubbo Example](/zh-cn/overview/tasks/protocols/web/)
* [Interoperability between Dubbo and Spring Cloud Ecosystems](/zh-cn/overview/tasks/protocols/springcloud/)

## Other Communication Protocols

In addition to the protocols mentioned above, you can also run the following protocols on top of Dubbo. For Dubbo, it only takes a simple configuration change to switch the underlying service communication protocol, without affecting other peripheral APIs and governance capabilities.

* Hessian2
* Thrift
* JsonRPC

## Interoperability in Heterogeneous Microservice Ecosystems

For practices related to protocol migration and coexistence of multi-protocol technology stacks, please refer to this [blog post](/zh-cn/blog/2023/01/05/dubbo-连接异构微服务体系-多协议多注册中心/).

## Configuration Method

For the configuration and usage methods of the protocols mentioned above, including how to configure `single-port multi-protocol` support, please refer to the following SDK documentation:

* [Java](../../../docs3-v2/java-sdk/reference-manual/protocol/)
* [Golang](../../../docs3-v2/golang-sdk/preface/concept/protocol/)
* [Rust](../../../docs3-v2/rust-sdk/protocol/)

## Custom Extensions

In addition to the communication protocols officially supported, Dubbo supports extending support for new protocols. For specific details, please refer to [【Task】-【Extensibility】-【Protocol】](/zh-cn/overview/tasks/extensibility/protocol/).
Dubbo framework offers custom high-performance RPC communication protocols: Triple protocol based on HTTP/2 and Dubbo2 protocol based on TCP. Additionally, Dubbo supports any third-party communication protocols like gRPC, Thrift, REST, JsonRPC, Hessian2, etc. More protocols can be implemented through custom extensions. This is particularly useful for multi-protocol communication scenarios common in microservices.

**Dubbo doesn't bind to any specific communication protocol. Its implementation is very flexible in supporting multiple protocols. You can publish multiple services using different protocols within a single application and even publish all protocols on a single port.**

![protocols](/imgs/v3/feature/protocols/protocol1.png)

With Dubbo's multi-protocol support, you can:
* Seamlessly integrate any communication protocol into the Dubbo service governance system. All communication protocols under the Dubbo system can enjoy the advantages of Dubbo's programming model, service discovery, and traffic control, such as "gRPC over Dubbo."
* Accommodate different technology stacks, with business systems using different service frameworks and RPC frameworks. For example, some services may use gRPC or Spring Cloud, while others use the Dubbo framework. Dubbo's multi-protocol support facilitates interoperability.
* Simplify protocol migration. Through multi-protocol support and registry coordination, you can quickly meet internal protocol migration requirements, such as upgrading from a custom protocol to Dubbo protocol or migrating from HTTP to Dubbo protocol.

## HTTP/2 (Triple)
Triple protocol is a communication protocol introduced in Dubbo3 for the cloud-native era. It is based on HTTP/2 and fully compatible with the gRPC protocol, with native support for Streaming communication semantics. Triple can run on both HTTP/1 and HTTP/2, allowing you to directly access backend Dubbo services using curl or a browser.

Key features of the Triple protocol include:
* TLS encryption and Plaintext data transmission
* Backpressure and rate-limiting support
* Streaming communication
* Support for both HTTP/1 and HTTP/2

Programming and communication models supported by the Triple protocol include:
* Client-Side Asynchronous Request-Response
* Server-Side Asynchronous Request-Response
* Request Streaming
* Response Streaming
* Bidirectional Streaming

For practical development with Triple, please refer to [Triple Protocol Development Tasks](/en/overview/tasks/protocols/triple/) or [Java SDK Documentation](/en/docs3-v2/java-sdk/reference-manual/protocol/triple/).

## Dubbo2
Dubbo2 is an RPC communication protocol built on top of the TCP transport layer. It has been widely used due to its compactness, flexibility, and high performance. Although it also has built-in HTTP support for quick validation or debugging using curl, we recommend using the more versatile and penetrative Triple protocol in the cloud-native era.

For more on Dubbo2, please refer to [Dubbo2 Protocol Development Tasks](/zh-cn/overview/tasks/protocols/dubbo/).

## gRPC
You can use Dubbo for developing and governing microservices and then set it up to use gRPC for underlying communication. The advantage is that it allows you to use native gRPC protocol communication while avoiding the complexity of secondary customization and development based on gRPC.

For example, please refer to [gRPC over Dubbo](/zh-cn/overview/tasks/protocols/grpc/).

## REST
Dubbo also supports HTTP-based programming and communication models commonly used in the microservice domain.

For example, please refer to [HTTP over Dubbo](/zh-cn/overview/tasks/protocols/web/).

## Other Communication Protocols
In addition to the protocols mentioned above, you can also run the following protocols on top of Dubbo. Switching the underlying service communication protocol only requires a simple configuration change, and other peripheral APIs and governance capabilities remain unaffected.
* Hessian2
* Thrift
* JsonRPC

## Interoperability in Heterogeneous Microservices Systems
For practices on protocol migration and coexistence of multiprotocol tech stacks, please refer to this [blog article](/zh-cn/blog/2023/01/05/dubbo-connecting-heterogeneous-microservices-systems-multi-protocol-multi-registry/).

## Configuration
For configuration and usage of the above protocols, including how to configure 'single-port multiprotocol' support, please refer to the following SDK example documents:
* [Java](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/)
* [Golang](/zh-cn/overview/mannual/golang-sdk/tutorial/develop/protocol/)
* [Rust](/zh-cn/overview/mannual/rust-sdk/)

## Custom Extensions
In addition to the officially supported communication protocols, Dubbo allows for the extension of new protocol support. For details, please refer to [Tasks - Extensibility - Protocol](/zh-cn/overview/tasks/extensibility/protocol/).
