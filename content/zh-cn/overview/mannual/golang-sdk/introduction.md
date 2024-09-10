---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/
    - /zh-cn/docs3-v2/golang-sdk/preface/
    - /zh-cn/overview/mannual/golang-sdk/preface/
    - /zh-cn/overview/mannual/golang-sdk/preface/concept/
    - /zh-cn/overview/mannual/golang-sdk/preface/concept/protocol/
description: Dubbo-go 框架
linkTitle: 框架介绍
title: 框架介绍
type: docs
weight: 1
---

## 什么是 dubbo-go
Dubbo-go 是 Apache Dubbo 的 go 语言实现，它完全遵循 Apache Dubbo 设计原则与目标，是 go 语言领域的一款优秀微服务开发框架。dubbo-go 提供：
* **API 与 RPC 协议**：帮助解决组件之间的 RPC 通信问题，提供基于 HTTP/1/2 的通信协议、streaming流式通信模型。
* **丰富的微服务治理能力**：解决地址发现、流量管控、可观测性、全链路追踪、日志等微服务整体解决方案。

## 概念与架构
以下是 dubbo-go 的整体架构图：
![dubbo-go architecture](/imgs/golang/architecture/arc.png)

dubbo-go 总体上遵循 `框架内核+插件` 的的设计理念，左侧的 `框架内核` 定义了 dubbo-go 作为微服务框架的一些核心概念，右侧的 `插件` 部分则提供了核心概念扩展实现。

`框架内核` 可分为 4 个层次，从上到下依次为：
* API 层：dubbo-go 同时支持基于 IDL、interface/struct 的服务契约定义，兼顾跨语言与易用性诉求；支持基于纯 yaml 文件的微服务配置模式；提供了同步、异步、单次(unary)、流式(streaming) 等 RPC 通信与编码模型。

* 服务治理层：dubbo-go 内置了多维度的服务治理能力抽象，确保满足微服务开发与集群治理的核心诉求，这包括地址发现（Service Discovery）、负载均衡（Load Balancing）、可观测指标（Metrics）、流量管控（Traffic Management）、全链路追踪（Tracing）等。

* RPC 协议层：dubbo-go 实现的最核心的 RPC 协议是 - triple 协议，triple 可同时工作在 http1/2 之上 (支持 CURL 直接访问)，兼容 gRPC；从设计上，dubbo-go 还提供了多协议发布服务的支持，你可以在一个进程内同时发布 triple、dubbo2、rest、jsonRPC 等多种不同通信协议的服务。

* 传输层：支持 HTTP1/2、TCP 传输层，兼顾性能与通用性，同时支持多种序列化方式。

`插件` 体系极大的丰富了 dubbo-go 功能与生态，社区内置提供了大量的内置扩展实现，同时，开发者可以非常容易的根据需求增加扩展实现。以下是一些典型的插件定义：

* Protocol：dubbo-go 基于 protocol 插件内置提供了 triple、dubbo2、rest 等协议支持，通过扩展 protocol 可以为 dubbo-go 扩展更多协议
* Service Discovery：支持 Nacos、Zookeeper、Polaris 等主流注册中心集成
* Traffic Management：dubbo-go 支持 Dubbo 体系定义的流量规则，可以实现在运行期动态的调整服务行为如超时时间、重试次数、限流参数等，通过控制流量分布可以实现 A/B 测试、金丝雀发布、多版本按比例流量分配、条件匹配路由、黑白名单等
* Metrics：提供 RPC 调用（RT、QPS、调用量、请求成功数、请求失败数、并发请求数等）、注册中心、元数据中心、配置中心交互统计等丰富的内置采集埋点，支持多维度的指标聚合
* Logging：提供通用的日志采集接口定义，内置 Zap、Logrus 支持
* Tracing：提供分布式链路追踪能力，通过此插件扩展可接入 Zipkin、Jaeger、Skywalking 等链路追踪系统。

下图是从内核源码视角，给出的框架核心组件以及组件之间的关联关系：

![img](/imgs/docs3-v2/golang-sdk/concept/more/app_and_interface/dubbogo-concept.png)

### RPC
#### Triple
基于 Dubbo 定义的 [triple 协议](/zh-cn/overview/reference/protocols/triple/)，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。作为 Apache Dubbo 多语言 RPC体系的一环，dubbo-go 提供了 triple 协议的完整实现，支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。triple 协议让 dubbo-go 可以：
* **作为后端服务与 Dubbo 其他语言实现互通**
* **接收浏览器等标准 http 工具发起的请求**
* **与标准的 gRPC 体系互通**

![dubbo多语言实现](/imgs/golang/architecture/language.png)

请参考以下链接了解更多 dubbo-go 跨语言或跨产品的互通细节：
* [与 Dubbo 其他多语言体系互通 - 基于 triple+protobuf](../tutorial/interop-dubbo/)
* [与 Dubbo2 Java互通 - 基于 dubbo2+hessian2](../tutorial/interop-dubbo)
* [与 gRPC 体系互通](../tutorial/interop-grpc)

#### 多协议支持
除了 triple 协议之外，dubbo-go 支持更多的 RPC 协议和序列化方式：

| 协议            | 协议名 (用于配置) |         序列化方式         | 默认序列化方式 |
| --------------- | ----------------- | :------------------------: | -------------- |
| Triple 【推荐】 | tri               | pb/json/自定义 | pb             |
| Dubbo           | dubbo             |          hessian2          | hessian2       |
| jsonRPC         | jsonrpc           |            json            | json           |
| REST         | rest           |            json            | json           |

#### Filter
如下图所示，filter 是一个类似 AOP 的请求拦截机制，每一次 RPC 请求都会被 filter 拦截

![dubbo多语言实现](/imgs/golang/architecture/filter.png)

我们可以在 filter 实现中完成比如请求拦截、记录、预处理、后处理的事情。dubbo-go 的一些核心能力，比如超时时间、访问日志(ccesslog)、metrtics 等都是基于内置 filter 实现的。

#### Streaming

![dubbo多语言实现](/imgs/golang/architecture/streaming.png)

* Server streaming RPC：一次 server-streaming RPC 请求与 unary RPC 非常类似，不同之处在于，对于单次 client 请求 server 会返回一系列的流式响应。

* Client streaming RPC：一次 client-streaming RPC 请求与 unary RPC 非常类似，不同之处在于，client 会发送一系列的流式请求到 server，最终 server 针对所有收到的请求返回一条响应信息。

* Bidirectional streaming RPC：在双向流式 RPC 请求中，请求首先由 client 端发起，server 在收到请求信息（方法名、metadata等）后，可以选择立即发送 metadata 作为响应，或者一直等到 client 进一步发起流式请求数据。

### 服务治理
dubbo-go 提供了完善的服务治理能力，包括地址发现、可观测、全链路追踪、流量管控等。你可以使用 dubbo-go 开发与管理微服务集群并实现与 Apache Dubbo 其他语言体系的互通。

#### 地址发现
![img](/imgs/architecture.png)

Dubbo-go 支持的注册中心类型如下，具体配置方式请参考使用教程 [地址发现](../tutorial/service-discovery/)：

| 注册中心  | 注册中心名（用于配置） |
| --------- | ---------------------- |
| Zookeeper | zookeeper              |
| Nacos     | nacos                  |
| Etcd      | etcd                   |
| Polaris      | polaris                   |

#### 可观测
dubbo-go 的可视化指标采集遵循 Apache Dubbo 定义的 [metrics 指标规范](/zh-cn/overview/reference/Metrics/standard_metrics/)。在实现 metrics 指标采集后，接下来就是如何可视化展示的问题，当前最常用的式导出到 Prometheus 并通过 Grafana 实现数据可视化展示。

具体启用方式请参考使用手册中的 [可视化观测](../tutorial/observability/)。

#### 全链路追踪
dubbo-go 支持通过 Open Telemetry 接入 Zipkin、Jaeger、Skywalking 等全链路追踪系统。

具体启用方式请参考使用手册中的 [全链路追踪](../tutorial/tracing/)。

#### 流量管控
dubbo-go 实现的流量治理规则完全遵循 Dubbo 框架设计的流量治理能力，可以通过以下链接了解更多详情：
* [Dubbo 流量治理规则设计](/zh-cn/overview/core-features/traffic/)
* [Dubbo 流量治理示例任务](/zh-cn/overview/tasks/traffic-management/)







