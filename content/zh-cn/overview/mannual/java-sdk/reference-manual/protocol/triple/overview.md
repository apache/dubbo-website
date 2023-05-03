---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/overview/
description: 协议概述
linkTitle: 协议概述
title: 协议概述
type: docs
weight: 1
---






## 概述说明

`Triple` 协议的格式和原理请参阅 [RPC 通信协议](/zh-cn/docs/concepts/rpc-protocol/)

根据 Triple 设计的目标，`Triple` 协议有以下优势

- 具备跨语言交互的能力，传统的多语言多 SDK 模式和 Mesh 化跨语言模式都需要一种更通用易扩展的数据传输协议。
- 提供更完善的请求模型，除了支持传统的 Request/Response 模型（Unary 单向通信），还支持 Stream（流式通信） 和 Bidirectional（双向通信）。
- 易扩展、穿透性高，包括但不限于 Tracing / Monitoring 等支持，也应该能被各层设备识别，网关设施等可以识别数据报文，对 Service Mesh 部署友好，降低用户理解难度。
- 完全兼容 grpc，客户端/服务端可以与原生grpc客户端打通。
- 可以复用现有 grpc 生态下的组件, 满足云原生场景下的跨语言、跨环境、跨平台的互通需求。

当前使用其他协议的 Dubbo 用户，框架提供了兼容现有序列化方式的迁移能力，在不影响线上已有业务的前提下，迁移协议的成本几乎为零。

### GRPC 
需要新增对接 grpc 服务的 Dubbo 用户，可以直接使用 Triple 协议来实现打通，不需要单独引入 grpc client 来完成，不仅能保留已有的 Dubbo 易用性，也能降低程序的复杂度和开发运维成本，不需要额外进行适配和开发即可接入现有生态。

### 网关接入
对于需要网关接入的 Dubbo 用户，Triple 协议提供了更加原生的方式，让网关开发或者使用开源的 grpc 网关组件更加简单。网关可以选择不解析 payload ，在性能上也有很大提高。在使用 Dubbo 协议时，语言相关的序列化方式是网关的一个很大痛点，而传统的 HTTP 转 Dubbo 的方式对于跨语言序列化几乎是无能为力的。同时，由于 Triple 的协议元数据都存储在请求头中，网关可以轻松的实现定制需求，如路由和限流等功能。


## 常见问题

### Q1
protobuf 类找不到

由于 Triple 协议底层需要依赖 protobuf 协议进行传输，即使定义的服务接口不使用 protobuf 也需要在环境中引入 protobuf 的依赖。

```xml
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.19.4</version>
        </dependency>
```