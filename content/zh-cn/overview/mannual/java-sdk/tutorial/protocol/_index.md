---
description: "Dubbo 是一款轻量的 RPC 框架，提供 Java、Go、Node.js、Javascript 等语言支持，帮助开发者构建浏览器、gRPC 兼容的 HTTP API。"
linkTitle: RPC 通信协议
title: Dubbo 作为轻量 RPC 框架解决组件通信问题
type: docs
weight: 2
---

自 3.3.0 版本开始，Dubbo 框架的默认通信协议就是 Triple

## Triple 协议
* 设置
* 服务定义方式
* 序列化协议
* 前端接入方式
  * 发布 REST 风格
* 性能
* 测试

## Dubbo 协议
* 设置
* 服务定义方式
* 序列化协议
* 前端接入方式
  * 发布 REST 风格
* 性能
* 测试

## REST 协议


## 更多协议


## 更多 Triple 特性
* Dubbo Java 之前 (3.3.0) 的各个发行版本均默认使用 `dubbo` 通信协议（基于 TCP 的高性能私有协议），考虑到对过往版本的兼容性，老用户请参考文档了解[如何实现协议的平滑迁移](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/migration)。对于没有历史包袱的新用户，建议在一开始就通过配置开启 `triple` 协议。
* 更多 Triple 协议使用请参见
  * [流式通信 Streaming RPCs](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/streaming)
  * [实现与标准 gRPC 协议互调](../grpc)
  * [基于 Java Interface 的开发模式(无 IDL 模式)](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/pojo)
  * [如何在其他语言和浏览器上使用 Triple 协议](/zh-cn/overview/tasks/rpc/develop/web/)