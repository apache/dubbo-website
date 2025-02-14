---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/overview/
description: 协议概述
linkTitle: 协议概述
title: 协议概述
type: docs
weight: 1
---

Dubbo 作为一款 RPC 框架内置了高效的 RPC 通信协议，帮助解决服务间的编码与通信问题，目前支持的协议包括：
 * triple，基于 HTTP/1、HTTP/2 的高性能通信协议，100% 兼容 gRPC，支持 Unary、Streming 等通信模式；支持发布 REST 风格的 HTTP 服务。
 * dubbo，基于 TCP 的高性能私有通信协议，缺点是通用性较差，更适合在 Dubbo SDK 间使用；
 * 任意协议扩展，通过扩展 protocol 可以支持任意 RPC 协议，官方生态库提供 JsonRPC、thrift 等支持。

## 协议选型

**开发者该如何确定使用哪一种协议那？** 以下是我们从使用场景、性能、编程易用性、多语言互通等方面对多个主流协议的对比分析：

| <span style="display:inline-block;width:50px">协议</span> | 性能 | 网关友好 | 流式通信 | 多语言支持 | 编程API | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| triple | 高 | 高 | 支持，客户端流、服务端流、双向流 | 支持（Java、Go、Node.js、JavaScript、Rust） | Java Interface、Protobuf(IDL) | 在多语言兼容、性能、网关、Streaming、gRPC 等方面最均衡的协议实现，官方推荐。<br/> 支持 `application/json` 格式 payload http 直接访问。 |
| dubbo | 高 | 低 | 不支持 | 支持（Java、Go） | Java Interface | 性能最高的私有协议，但前端流量接入、多语言支持等成本较高 |

以下是 triple、dubbo 两个主要协议的具体开发、配置、运行态信息：
 | 协议名称 | <span style="display:inline-block;width:50px">配置值</span> | <span style="display:inline-block;width:250px">服务定义方式</span> | 默认端口 | 传输层协议 | 序列化协议 | 是否默认 |
 | --- | --- | --- | --- | --- | --- | --- |
 | **triple** | tri | - Java Interface <br/> - Java Interface+SpringWeb注解 <br/> - Java Interface+JaxRS注解 <br/> - Protobuf(IDL) | 50051 | HTTP/1、HTTP/2 | Protobuf Binary、Protobuf-json | 否 |
 | **dubbo** | dubbo | - Java Interface | 20880 | TCP | Hessian、Fastjson2、JSON、JDK、Avro、Kryo 等 | **是** |

 {{% alert title="注意" color="warning" %}}
 * 自 3.3 版本开始，triple 协议支持以 rest 风格发布标准的 http 服务，因此框架中实际已不存在独立的 rest protocol 扩展实现，
 * 考虑到对过往版本的兼容性，当前 Dubbo 各个发行版本均默认使用 `dubbo` 通信协议。**对于新用户而言，我们强烈建议在一开始就明确配置使用 `triple` 协议**，老用户也尽快参考文档 [实现协议的平滑迁移](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/migration)。
 {{% /alert %}}

## 多协议扩展
以下是当前 Dubbo 官方生态库提供的拓展协议实现。如果要扩展更多自定义协议，请参考 [SPI 扩展手册](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/) 或 [使用教程 - 协议扩展](/zh-cn/overview/mannual/java-sdk/tasks/extensibility/protocol/)。

| 协议 | 配置值 | 说明 |
| --- | --- | --- |
| Hessian | hessian | Hessian 定义的 RPC 通信协议，具体查看 [hessian协议](../others/hessian/) |
| Spring HTTP | http | Spring 定义的基于 HTTP 的私有协议，具体查看 [hessian协议](../others/hessian/)  |
| Apache Thrift | thrift | Thrift 协议，具备高性能、支持多语言的特点，具体查看 [Thrift协议](../others/thrift/)  |
| JsonRPC | jsonrpc | 具体查看 [JsonRPC](../others/jsonrpc/)  |
| RMI | rmi | 具体查看 [RMI协议](../others/rmi/)  |
| WebService | webservice | 具体查看 [WebService协议](../others/webservice/)  |

