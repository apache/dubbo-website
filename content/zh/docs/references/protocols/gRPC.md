---
type: docs
title: "gRPC 协议"
linkTitle: "grpc://"
weight: 5
description: "grpc:// 协议参考手册"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/protocol/grpc/)。
{{% /pageinfo %}}

Dubbo 自 2.7.5 版本开始支持 gRPC 协议，对于计划使用 HTTP/2 通信，或者想利用 gRPC 带来的 Stream、反压、Reactive 编程等能力的开发者来说，
都可以考虑启用 gRPC 协议。

## 支持 gRPC 的好处
* 为期望使用 gRPC 协议的用户带来服务治理能力，方便接入 Dubbo 体系
* 用户可以使用 Dubbo 风格的，基于接口的编程风格来定义和使用远程服务

## 如何在 Dubbo 中使用 gRPC
大概需要以下步骤：  
1. 使用 IDL 定义服务
2. 配置 compiler 插件，本地预编译
3. 配置暴露/引用 Dubbo 服务

具体可参见以下[示例](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-grpc)

除了原生 StreamObserver 接口类型之外，Dubbo 还支持 [RxJava](https://github.com/apache/dubbo-samples/tree/master/java/dubbo-samples-grpc/dubbo-samples-rxjava)、[Reactor](https://github.com/apache/dubbo-samples/tree/master/java/dubbo-samples-grpc/dubbo-samples-reactor) 编程风格的 API

