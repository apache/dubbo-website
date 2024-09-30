---
aliases:
    - /en/overview/core-features/protocols/
    - /en/overview/core-features/protocols/
description: Communication Protocols
feature:
    description: |
        Supports any communication protocol such as HTTP/2, gRPC, TCP, REST, etc. Switching protocols only requires modifying one line of configuration, and supports multi-protocol publishing on a single port.
    title: Communication Protocols
linkTitle: Communication Protocols
title: Communication Protocols
type: docs
weight: 5
---

The Dubbo framework provides a custom high-performance RPC communication protocol: the Triple protocol based on HTTP/2 and the Dubbo2 protocol based on TCP. In addition, the Dubbo framework supports any third-party communication protocol, such as the officially supported gRPC, Thrift, REST, JsonRPC, Hessian2, etc. More protocols can be implemented through custom extensions. This is very useful for multi-protocol communication scenarios often encountered in microservice practices.

**The Dubbo framework does not bind to any communication protocol. In implementation, Dubbo's support for multiple protocols is very flexible. It allows you to publish multiple services using different protocols within one application and supports publishing all protocols externally using the same port.**

![protocols](/imgs/v3/feature/protocols/protocol1.png)

With Dubbo framework's multi-protocol support, you can:
* Seamlessly integrate any communication protocol into the Dubbo service governance system. All communication protocols under the Dubbo system can enjoy the advantages of Dubbo's programming model, service discovery, traffic control, etc. For example, in the gRPC over Dubbo mode, service governance and programming APIs can be integrated into the Dubbo system at zero cost.
* Be compatible with different technology stacks, mixing different service frameworks and RPC frameworks in business systems. For example, some services are developed using gRPC or Spring Cloud, while others are developed using the Dubbo framework. Dubbo's multi-protocol support can achieve good interoperability.
* Make protocol migration simpler. Through the coordination of multiple protocols and the registry, the company's protocol migration needs can be quickly met. For example, upgrading from a self-developed protocol to the Dubbo protocol, upgrading the Dubbo protocol itself, migrating from the Dubbo protocol to gRPC, or migrating from HTTP to the Dubbo protocol.

## HTTP/2 (Triple)
The Triple protocol is a communication protocol released by Dubbo3 for the cloud-native era. It is based on HTTP/2 and fully compatible with the gRPC protocol, natively supporting Streaming communication semantics. Triple can run on both HTTP/1 and HTTP/2 transport protocols, allowing you to directly use curl and browsers to access backend Dubbo services.

Starting from the Triple protocol, Dubbo also supports service definition and data transmission based on Protocol Buffers, but the Triple implementation is not bound to IDL. For example, you can directly use Java Interface to define and publish Triple services. Triple has better gateway and proxy penetration, making it very suitable for deployment architectures involving cross-gateway and proxy communication, such as service meshes.

The core features of the Triple protocol are as follows:
* Supports TLS encryption and Plaintext data transmission
* Supports backpressure and rate limiting
* Supports Streaming communication
* Supports both HTTP/1 and HTTP/2 transport protocols

In terms of programming and communication models, the Triple protocol supports the following modes:
* Client Side Asynchronous Request-Response
* Server Side Asynchronous Request-Response
* Request Streaming
* Response Streaming
* Bidirectional Streaming

Development Practices
* For using the Triple protocol, refer to [Triple Protocol Development Tasks](../../tasks/protocols/triple/) or [Java SDK Example Documentation](../../mannual/java-sdk/reference-manual/protocol/triple/)
* [Triple Design Ideas and Protocol Specifications](../../reference/protocols/triple/)

## Dubbo2
The Dubbo2 protocol is an RPC communication protocol built on top of the TCP transport layer protocol. Due to its compact, flexible, and high-performance characteristics, it has been widely used in the Dubbo2 era and is a key communication solution for building high-performance, large-scale microservice clusters in enterprises. In the cloud-native era, we recommend using the more general and penetrative Triple protocol.

The Dubbo2 protocol also has built-in HTTP support, so you can use curl to quickly verify or debug services during the development phase.

* [Dubbo2 Protocol Development Tasks](../../tasks/protocols/dubbo/)
* [Dubbo2 Design Concepts and Protocol Specifications](../../reference/protocols/tcp/)

## gRPC
You can develop and manage microservices with Dubbo, then set up gRPC protocol for underlying communication. But why do this? What are the advantages compared to using the gRPC framework directly? The simple answer is that this is a common pattern for microservice development using gRPC. Read on for more details.

gRPC is an open-source communication protocol based on HTTP/2 by Google. As mentioned in our [Product Comparison](../../what/xyz-difference) document, gRPC is positioned as a communication protocol and implementation, a purely RPC framework, while Dubbo is positioned as a microservice framework providing solutions for microservice practices. Therefore, compared to Dubbo, gRPC relatively lacks abstractions for microservice programming models and service governance.

Using the gRPC protocol within the Dubbo framework (gRPC over Dubbo Framework) is a highly efficient and lightweight choice. It allows you to use the native gRPC protocol for communication while avoiding the complexity of secondary customization and development based on gRPC (secondary development and customization of gRPC is an unavoidable step confirmed by many enterprises after large-scale practice. The Dubbo framework completes this step for developers, allowing them to use gRPC in the simplest way).

[gRPC over Dubbo Example](../../tasks/protocols/grpc/)

## REST
A common communication pattern in the microservice field is HTTP + JSON. Some mainstream microservice frameworks like Spring Cloud and Microprofile default to this communication pattern. Dubbo also provides support for HTTP-based programming and communication patterns.

* [HTTP over Dubbo Example](../../tasks/protocols/web/)
* [Dubbo and Spring Cloud Interoperability](../../tasks/protocols/springcloud/)

## Other Communication Protocols
In addition to the protocols introduced above, you can also run the following protocols on top of Dubbo. For Dubbo, you only need to change a simple configuration line to switch the underlying service communication protocol, without affecting other peripheral APIs and governance capabilities.
* Hessian2
* Thrift
* JsonRPC

## Configuration Methods
For the configuration and usage methods of the above protocols, including how to configure `single-port multi-protocol` support, please refer to the following SDK example documents:

* [Java](../../mannual/java-sdk/reference-manual/protocol/)
* [Golang](../../mannual/golang-sdk/tutorial/develop/protocol/)
* [Rust](../../mannual/rust-sdk/)

## Custom Extensions
In addition to the communication protocols supported by the official version above, Dubbo supports extending new protocol support. For details, please refer to [Tasks - Extensibility - Protocol](../../tasks/extensibility/protocol/)
