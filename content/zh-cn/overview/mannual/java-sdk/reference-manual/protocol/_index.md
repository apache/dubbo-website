---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/
    - /zh/overview/what/ecosystem/protocol/
description: Dubbo RPC 协议指南
linkTitle: RPC 协议
title: RPC 协议
type: docs
weight: 4
---

Dubbo3 定义了 Triple、Dubbo2 协议，这是 Dubbo 框架的内置原生协议。其中 Triple 协议能跑在 HTTP 之上，具有更高的灵活性和通用性，可帮助开发者轻松的联通浏览器、移动设备与后端服务，使用 Dubbo 协议开发者可以解决普通组件 RPC 通信、微服务间数据传输等问题，具体可参见快速开始中的 RPC、微服务等不同开发示例。

除此之外，Dubbo3 也对众多第三方协议进行了集成，并将它们纳入 Dubbo 的编程与服务理体系，包括 gRPC、Thrift、JsonRPC、Hessian2、REST 等。其中 REST 使用标准 HTTP+JSON 的传输格式，其在 Java 实现中也是一种编程模式，可以让用户开发后端 Web 服务，支持 Spring Web、JAX-RS 等常用注解使用方式。