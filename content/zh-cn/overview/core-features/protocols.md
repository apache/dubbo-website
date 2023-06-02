---
aliases:
    - /zh/overview/core-features/protocols/
description: 通信协议
feature:
    description: |
        支持 HTTP/2、gRPC、TCP、REST 等任意通信协议，切换协议只需要修改一行配置，支持单个端口上的多协议发布。
    title: 通信协议
linkTitle: 通信协议
title: 通信协议
type: docs
weight: 5
---

Dubbo 框架提供了自定义的高性能 RPC 通信协议：基于 HTTP/2 的 Triple 协议 和 基于 TCP 的 Dubbo2 协议。除此之外，Dubbo 框架支持任意第三方通信协议，如官方支持的 gRPC、Thrift、REST、JsonRPC、Hessian2 等，更多协议可以通过自定义扩展实现。这对于微服务实践中经常要处理的多协议通信场景非常有用。

**Dubbo 框架不绑定任何通信协议，在实现上 Dubbo 对多协议的支持也非常灵活，它可以让你在一个应用内发布多个使用不同协议的服务，并且支持用同一个 port 端口对外发布所有协议。**

![protocols](/imgs/v3/feature/protocols/protocol1.png)

通过 Dubbo 框架的多协议支持，你可以做到：
* 将任意通信协议无缝地接入 Dubbo 服务治理体系。Dubbo 体系下的所有通信协议，都可以享受到 Dubbo 的编程模型、服务发现、流量管控等优势。比如 gRPC over Dubbo 的模式，服务治理、编程 API 都能够零成本接入 Dubbo 体系。
* 兼容不同技术栈，业务系统混合使用不同的服务框架、RPC 框架。比如有些服务使用 gRPC 或者 Spring Cloud 开发，有些服务使用 Dubbo 框架开发，通过 Dubbo 的多协议支持可以很好的实现互通。
* 让协议迁移变的更简单。通过多协议、注册中心的协调，可以快速满足公司内协议迁移的需求。比如如从自研协议升级到 Dubbo 协议，Dubbo 协议自身升级，从 Dubbo 协议迁移到 gRPC，从 HTTP 迁移到 Dubbo 协议等。

## HTTP/2 (Triple)
Triple 协议是 Dubbo3 发布的面向云原生时代的通信协议，它基于 HTTP/2 并且完全兼容 gRPC 协议，原生支持 Streaming 通信语义，Triple 可同时运行在 HTTP/1 和 HTTP/2 传输协议之上，让你可以直接使用 curl、浏览器访问后端 Dubbo 服务。

自 Triple 协议开始，Dubbo 还支持基于 Protocol Buffers 的服务定义与数据传输，但 Triple 实现并不绑定 IDL，比如你可以直接使用 Java Interface 定义和发布 Triple 服务。Triple 具备更好的网关、代理穿透性，因此非常适合于跨网关、代理通信的部署架构，如服务网格等。

Triple 协议的核心特性如下：
* 支持 TLS 加密、Plaintext 明文数据传输
* 支持反压与限流
* 支持 Streaming 流式通信
* 同时支持 HTTP/1 和 HTTP/2 传输协议

在编程与通信模型上，Triple 协议支持如下模式：
* 消费端异步请求(Client Side Asynchronous Request-Response)
* 提供端异步执行（Server Side Asynchronous Request-Response）
* 消费端请求流（Request Streaming）
* 提供端响应流（Response Streaming）
* 双向流式通信（Bidirectional Streaming）

开发实践
* Triple 协议使用请参见 [Triple 协议开发任务](../../tasks/protocols/triple/) 或 [java sdk 示例文档](../../mannual/java-sdk/reference-manual/protocol/triple/)
* [Triple 设计思路与协议规范](../../reference/protocols/triple/)

## Dubbo2
Dubbo2 协议是基于 TCP 传输层协议之上构建的一套 RPC 通信协议，由于其紧凑、灵活、高性能的特点，在 Dubbo2 时代取得了非常广泛的应用，是企业构建高性能、大规模微服务集群的关键通信方案。在云原生时代，我们更推荐使用通用性、穿透性更好的 Triple 协议。

Dubbo2 协议也内置 HTTP 支持，因此你可以使用 curl 在开发阶段快速验证或调试服务。

* [Dubbo2 协议开发任务](../../tasks/protocols/dubbo/)
* [Dubbo2 设计思路与协议规范](../../reference/protocols/tcp/)

## gRPC
你可以用 Dubbo 开发和治理微服务，然后设置使用 gRPC 协议进行底层通信。但为什么要这么做那，与直接使用 gRPC 框架对比有什么优势？简单的答案是，这是使用 gRPC 进行微服务开发的常用模式，具体请往下看。

gRPC 是谷歌开源的基于 HTTP/2 的通信协议，如同我们在 [产品对比](../../what/xyz-difference) 文档中提到的，gRPC 的定位是通信协议与实现，是一款纯粹的 RPC 框架，而 Dubbo 定位是一款微服务框架，为微服务实践提供解决方案。因此，相比于 Dubbo，gRPC 相对欠缺了微服务编程模型、服务治理等能力的抽象。

在 Dubbo 体系下使用 gRPC 协议 (gRPC over Dubbo Framework) 是一个非常高效和轻量的选择，它让你既能使用原生的 gRPC 协议通信，又避免了基于 gRPC 进行二次定制与开发的复杂度 (二次开发与定制 gRPC，是很多企业规模化实践后证实不可避免的环节，Dubbo 框架替开发者完成了这一步，让开发者可以直接以最简单的方式使用 gRPC)。

[gRPC over Dubbo 示例](../../tasks/protocols/grpc/)

## REST
微服务领域常用的一种通信模式是 HTTP + JSON，包括 Spring Cloud、Microprofile 等一些主流的微服务框架都默认使用的这种通信模式，Dubbo 同样提供了对基于 HTTP 的编程、通信模式的支持。

* [HTTP over Dubbo 示例](../../tasks/protocols/web/)
* [Dubbo 与 Spring Cloud 体系互通](../../tasks/protocols/springcloud/)

## 其他通信协议
除了以上介绍的几种协议之外，你还可以将以下协议运行在 Dubbo 之上。对 Dubbo 而言，只需要修改一行简单的配置，就可以切换底层服务的通信协议，其他外围 API 和治理能力不受影响。
* Hessian2
* Thrift
* JsonRPC

## 异构微服务体系互通
关于协议迁移、多协议技术栈共存的实践方案，请参考本篇[博客文章](/zh-cn/blog/2023/01/05/dubbo-连接异构微服务体系-多协议多注册中心/)。

## 配置方式
以上协议的配置和使用方式，包括如何配置 `单端口多协议` 支持等，请参照以下 sdk 示例文档：

* [Java](../../mannual/java-sdk/reference-manual/protocol/)
* [Golang](../../mannual/golang-sdk/tutorial/develop/protocol/)
* [Rust](../../mannual/rust-sdk/)

## 自定义扩展
除了以上官方版本支持的通信协议，Dubbo 支持扩展新协议支持，具体请参见 [【任务】-【可扩展性】-【protocol】](../../tasks/extensibility/protocol/)
