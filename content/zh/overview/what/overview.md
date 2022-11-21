---
type: docs
title: "了解 Dubbo 的核心概念和架构"
linkTitle: "概念与架构"
weight: 10
description: ""
---

## 基本架构
![arch-service-discovery](/imgs/architecture.png)

以上是 Dubbo 的工作原理架构图，有三个核心的抽象角色：服务消费者 (Client/Consumer)、服务提供者 (Server/Provider)、服务治理中心。
* **代表业务服务的消费者和提供者统称为 Dubbo 数据面**，组成数据面的业务服务之间依赖 Dubbo 实现数据传输，即某个服务 (消费者) 以 RPC 或 HTTP 形式发起调用，目标服务 (提供者) 收到并回复对方的请求，Dubbo 定义了微服务开发与调用规范并完成数据传输的编解码工作。
* **服务治理中心控制 Dubbo 数据面的行为**，比如作为注册中心协调服务组件间的地址自动发现、作为规则管控中心下发流量治理策略等。治理中心不是指如注册中心类的单个具体组件，而是 对 Dubbo 治理体系的抽象表达。

## Dubbo 数据面
从数据面的视角，Dubbo 帮我们完成如下事项：
* Dubbo 作为**服务开发框架**定义了微服务定义、开发与调用的规范
* Dubbo 作为 **RPC 协议实现**解决服务间通信的编解码工作

![架构图](#)

### 服务开发框架
* 服务定义：IDL、Java、Golang 等
* 调用方式：同步、异步、Reactive
* 服务行为：超时、延迟注册、预热、治理中心等
* 配置：xml yaml properties
* 多语言：Java Spring、Golang xx

### 通信协议
* 不绑定通信协议
* 流式通信模型
* 不绑定序列化协议
* 多协议暴露、同时支持单端口上的协议自动识别
* 高性能实现：benchmark 图

![dubbo-rpc](/imgs/v3/concepts/rpc.png)

## Dubbo 服务治理

服务发现
负载均衡
动态配置
流量路由
链路追踪
服务网格



