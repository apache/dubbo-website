---
type: docs
title: "Triple 协议"
linkTitle: "Triple 协议"
weight: 2
---

Triple 是 Dubbo3 提出的基于 HTTP2 的开放协议，旨在解决 Dubbo2 私有协议带来的互通性问题。相比于原有 Dubbo2 协议，Triple 有以下优势:

1. 原生和 gRPC 协议互通。打通 gRPC 生态，降低从 gRPC 至 Dubbo 的迁移成本。
2. 增强多语言生态。避免因 CPP/C#/RUST 等语言的 Dubbo SDK 能力不足导致业务难以选型适配的问题。
3. 网关友好。网关无需参与序列化，方便用户从传统的 HTTP 转泛化 Dubbo 调用网关升级至开源或云厂商的 Ingress 方案。
4. 完善的异步和流式支持。带来从底层协议到上层业务的性能提升，易于构建全链路异步以及严格保证消息顺序的流式服务。

目前 Java 和 Go 的 Dubbo SDK 已全面支持 Triple 协议。在阿里巴巴，Triple 协议广泛用于跨环境、跨语言、跨生态互通，已有数十万容器生产级使用。

Java SDK 支持 [IDL 生成 Stub](../../../java-sdk/reference-manual/protocol/triple/idl)
和 [Java Interface](../../../java-sdk/reference-manual/protocol/triple/idl) 两种方式，多语言、生态互通、流式需求推荐使用 IDL 方式，现有服务平滑升级推荐使用
Interface 方式。

- Dubbo2 老用户如何[从现有协议升级至 Triple](TBD)
- 新用户或业务参考[Dubbo3 Triple Quick Start](../../../docs3-v2/java-sdk/quick-start)
- 深入了解 Triple 协议:[Dubbo3 Triple 协议设计与原理](https://github.com/apache/dubbo-awesome/blob/master/proposals/D0-triple.md)
