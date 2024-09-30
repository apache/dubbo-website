---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/overview/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/overview/
description: Protocol Overview
linkTitle: Protocol Overview
title: Protocol Overview
type: docs
weight: 1
---

As an RPC framework, Dubbo has an efficient built-in RPC communication protocol that helps solve coding and communication issues between services. The currently supported protocols include:
 * triple, a high-performance communication protocol based on HTTP/1 and HTTP/2, 100% compatible with gRPC, supporting Unary, Streaming, and other communication modes; allows publishing REST-style HTTP services.
 * dubbo, a high-performance private communication protocol based on TCP, with the drawback of lower general applicability, more suitable for use between Dubbo SDKs;
 * Any protocol extension, by extending protocol, any RPC protocol can be supported, with official ecosystem libraries providing support for JsonRPC, thrift, etc.

## Protocol Selection

**How should developers decide which protocol to use?** The following is our comparative analysis of multiple mainstream protocols from aspects like use cases, performance, ease of programming, and multilingual interoperability:

| <span style="display:inline-block;width:50px">Protocol</span> | Performance | Gateway Friendly | Streaming | Multilingual Support | Programming API | Description |
| --- | --- | --- | --- | --- | --- | --- |
| triple | High | High | Supports client stream, server stream, bidirectional stream | Supports (Java, Go, Node.js, JavaScript, Rust) | Java Interface, Protobuf(IDL) | The most balanced protocol implementation in terms of multilingual compatibility, performance, gateway, Streaming, gRPC, etc., recommended by the official team. <br/> Supports `application/json` formatted payload for direct HTTP access. |
| dubbo | High | Low | Not supported | Supports (Java, Go) | Java Interface | The highest performance private protocol, but has higher costs for frontend traffic access and multilingual support |

Here is the specific development, configuration, and runtime information for the two main protocols, triple and dubbo:
 | Protocol Name | <span style="display:inline-block;width:50px">Configuration Value</span> | <span style="display:inline-block;width:250px">Service Definition Methods</span> | Default Port | Transport Layer Protocol | Serialization Protocol | Default |
 | --- | --- | --- | --- | --- | --- | --- |
 | **triple** | tri | - Java Interface <br/> - Java Interface+SpringWeb Annotation <br/> - Java Interface+JaxRS Annotation <br/> - Protobuf(IDL) | 50051 | HTTP/1, HTTP/2 | Protobuf Binary, Protobuf-json | No |
 | **dubbo** | dubbo | - Java Interface | 20880 | TCP | Hessian, Fastjson2, JSON, JDK, Avro, Kryo, etc. | **Yes** |

 {{% alert title="Note" color="warning" %}}
 * Since version 3.3, the triple protocol supports publishing standard HTTP services in a REST style, so there is no longer an independent REST protocol extension implementation in the framework.
 * Considering compatibility with past versions, all current Dubbo release versions default to using the `dubbo` communication protocol. **For new users, we strongly recommend clearly configuring the use of the `triple` protocol from the beginning**, and existing users should refer to the documentation [for a smooth migration of protocols](/en/overview/mannual/java-sdk/reference-manual/protocol/triple/migration) as soon as possible.
 {{% /alert %}}

## Multi-Protocol Extensions
Below are the extension protocol implementations currently provided by the Dubbo official ecosystem. For information on extending more custom protocols, please refer to [SPI extension manual](/en/overview/mannual/java-sdk/reference-manual/spi/) or [usage tutorial - protocol extension](/en/overview/mannual/java-sdk/tasks/extensibility/protocol/) .

| Protocol | Configuration Value | Description |
| --- | --- | --- |
| Hessian | hessian | RPC communication protocol defined by Hessian, see [Hessian Protocol](../others/hessian/) for details |
| Spring HTTP | http | Private protocol based on HTTP defined by Spring, see [Hessian Protocol](../others/hessian/) for details |
| Apache Thrift | thrift | Thrift protocol known for its high performance and multilingual support, see [Thrift Protocol](../others/thrift/) for details |
| JsonRPC | jsonrpc | See [JsonRPC](../others/jsonrpc/) for details |
| RMI | rmi | See [RMI Protocol](../others/rmi/) for details |
| WebService | webservice | See [WebService Protocol](../others/webservice/) for details |

