---
aliases:
    - /zh/overview/what/overview/
    - /zh/docs3-v2/java-sdk/concepts-and-architecture/overall-architecture/
    - /zh-cn/docs3-v2/java-sdk/concepts-and-architecture/overall-architecture/
    - /zh-cn/overview/mannual/java-sdk/concepts-and-architecture/overall-architecture/
description: ""
linkTitle: 概念与架构
title: 了解 Dubbo 核心概念和架构
type: docs
weight: 1
---



![architecture](/imgs/v3/concepts/architecture-2.png)

以上是 Dubbo 的工作原理图，从抽象架构上分为两层：**服务治理抽象控制面** 和 **Dubbo 数据面** 。
* **服务治理控制面**。服务治理控制面不是特指如注册中心类的单个具体组件，而是对 Dubbo 治理体系的抽象表达。控制面包含协调服务发现的注册中心、流量管控策略、Dubbo Admin 控制台等，如果采用了 Service Mesh 架构则还包含 Istio 等服务网格控制面。
* **Dubbo 数据面**。数据面代表集群部署的所有 Dubbo 进程，进程之间通过 RPC 协议实现数据交换，Dubbo 定义了微服务应用开发与调用规范并负责完成数据传输的编解码工作。
    * 服务消费者 (Dubbo Consumer)，发起业务调用或 RPC 通信的 Dubbo 进程
    * 服务提供者 (Dubbo Provider)，接收业务调用或 RPC 通信的 Dubbo 进程

## Dubbo 数据面
从数据面视角，Dubbo 帮助解决了微服务实践中的以下问题：
* Dubbo 作为 **服务开发框架** 约束了微服务定义、开发与调用的规范，定义了服务治理流程及适配模式
* Dubbo 作为 **RPC 通信协议实现** 解决服务间数据传输的编解码问题

![framework](/imgs/v3/what/framework1.png)

### 服务开发框架
微服务的目标是构建足够小的、自包含的、独立演进的、可以随时部署运行的分布式应用程序，几乎每个语言都有类似的应用开发框架来帮助开发者快速构建此类微服务应用，比如 Java 微服务体系的 Spring Boot，它帮 Java 微服务开发者以最少的配置、最轻量的方式快速开发、打包、部署与运行应用。

微服务的分布式特性，使得应用间的依赖、网络交互、数据传输变得更频繁，因此不同的**应用需要定义、暴露或调用 RPC 服务，那么这些 RPC 服务如何定义、如何与应用开发框架结合、服务调用行为如何控制？这就是 Dubbo 服务开发框架的含义，Dubbo 在微服务应用开发框架之上抽象了一套 RPC 服务定义、暴露、调用与治理的编程范式**，比如 Dubbo Java 作为服务开发框架，当运行在 Spring 体系时就是构建在 Spring Boot 应用开发框架之上的微服务开发框架，并在此之上抽象了一套 RPC 服务定义、暴露、调用与治理的编程范式。

![framework](/imgs/v3/what/framework2.png)

Dubbo 作为服务开发框架包含的具体内容如下：
* **RPC 服务定义、开发范式**。比如 Dubbo 支持通过 IDL 定义服务，也支持编程语言特有的服务开发定义方式，如通过 Java Interface 定义服务。
* **RPC 服务发布与调用 API**。Dubbo 支持同步、异步、Reactive Streaming 等服务调用编程模式，还支持请求上下文 API、设置超时时间等。
* **服务治理策略、流程与适配方式等**。作为服务框架数据面，Dubbo 定义了服务地址发现、负载均衡策略、基于规则的流量路由、Metrics 指标采集等服务治理抽象，并适配到特定的产品实现。

想了解如何使用 Dubbo 微服务框架进行业务编码？从以下 SDK 开始微服务项目开发之旅吧：
* [Java](/zh-cn/overview/quickstart/java/)
* [Golang](/zh-cn/overview/quickstart/go/)
* [Rust](/zh-cn/overview/quickstart/rust/)
* [Node](https://github.com/apache/dubbo-js)

### 通信协议
**Dubbo 从设计上不绑定任何一款特定通信协议，HTTP/2、REST、gRPC、JsonRPC、Thrift、Hessian2 等几乎所有主流的通信协议，Dubbo 框架都可以提供支持。** 这样的 Protocol 设计模式给构建微服务带来了最大的灵活性，开发者可以根据需要如性能、通用型等选择不同的通信协议，不再需要任何的代理来实现协议转换，甚至你还可以通过 Dubbo 实现不同协议间的迁移。

![protocols](/imgs/v3/what/protocol.png)

Dubbo Protocol 被设计支持扩展，您可以将内部私有协议适配到 Dubbo 框架上，进而将私有协议接入 Dubbo 体系，以享用 Dubbo 的开发体验与服务治理能力。比如 Dubbo3 的典型用户阿里巴巴，就是通过扩展支持 HSF 协议实现了内部 HSF 框架到 Dubbo3 框架的整体迁移。

Dubbo 还支持多协议暴露，您可以在单个端口上暴露多个协议，Dubbo Server 能够自动识别并确保请求被正确处理，也可以将同一个 RPC 服务发布在不同的端口（协议），为不同技术栈的调用方服务。

Dubbo 提供了两款内置高性能 Dubbo2、Triple (兼容 gRPC) 协议实现，以满足部分微服务用户对高性能通信的诉求，两者最开始都设计和诞生于阿里巴巴内部的高性能通信业务场景。
* Dubbo2 协议是在 TCP 传输层协议之上设计的二进制通信协议
* Triple 则是基于 HTTP/2 之上构建的支持流式模式的通信协议，并且 Triple 完全兼容 gRPC 但实现上做了更多的符合 Dubbo 框架特点的优化。

总的来说，Dubbo 对通信协议的支持具有以下特点：
* 不绑定通信协议
* 提供高性能通信协议实现
* 支持流式通信模型
* 不绑定序列化协议
* 支持单个服务的多协议暴露
* 支持单端口多协议发布
* 支持一个应用内多个服务使用不同通信协议

## Dubbo 服务治理
服务开发框架解决了开发与通信的问题，但在微服务集群环境下，我们仍需要解决无状态服务节点动态变化、外部化配置、日志跟踪、可观测性、流量管理、高可用性、数据一致性等一系列问题，我们将这些问题统称为服务治理。

Dubbo 抽象了一套微服务治理模式并发布了对应的官方实现，服务治理可帮助简化微服务开发与运维，让开发者更专注在微服务业务本身。

### 服务治理抽象

以下展示了 Dubbo 核心的服务治理功能定义

![governance](/imgs/v3/what/governance.png)

* **地址发现**

Dubbo 服务发现具备高性能、支持大规模集群、服务级元数据配置等优势，默认提供 Nacos、Zookeeper、Consul 等多种注册中心适配，与 Spring Cloud、Kubernetes Service 模型打通，支持自定义扩展。

* **负载均衡**

Dubbo 默认提供加权随机、加权轮询、最少活跃请求数优先、最短响应时间优先、一致性哈希和自适应负载等策略

* **流量路由**

Dubbo 支持通过一系列流量规则控制服务调用的流量分布与行为，基于这些规则可以实现基于权重的比例流量分发、灰度验证、金丝雀发布、按请求参数的路由、同区域优先、超时配置、重试、限流降级等能力。

* **链路追踪**

Dubbo 官方通过适配 OpenTelemetry 提供了对 Tracing 全链路追踪支持，用户可以接入支持 OpenTelemetry 标准的产品如 Skywalking、Zipkin 等。另外，很多社区如 Skywalking、Zipkin 等在官方也提供了对 Dubbo 的适配。

* **可观测性**

Dubbo 实例通过 Prometheus 等上报 QPS、RT、请求次数、成功率、异常次数等多维度的可观测指标帮助了解服务运行状态，通过接入 Grafana、Admin 控制台帮助实现数据指标可视化展示。

Dubbo 服务治理生态还提供了对 **API 网关**、**限流降级**、**数据一致性**、**认证鉴权**等场景的适配支持。

### Dubbo Admin
Admin 控制台提供了 Dubbo 集群的可视化视图，通过 Admin 你可以完成集群的几乎所有管控工作。
* 查询服务、应用或机器状态
* 创建项目、服务测试、文档管理等
* 查看集群实时流量、定位异常问题等
* 流量比例分发、参数路由等流量管控规则下发

![Admin](/imgs/v3/what/admin.png)

### 服务网格
将 Dubbo 接入 Istio 等服务网格治理体系。

![Dubbo-Mesh](/imgs/v3/mesh/mix-mesh.png)
