---
aliases:
    - /zh/overview/what/advantages/performance/
description: 超高性能
linkTitle: 超高性能
title: 超高性能
type: docs
weight: 2
---


Dubbo 被设计用于解决阿里巴巴超大规模的电商微服务集群实践，并在各个行业头部企业经过多年的十万、百万规模的微服务实践检验，因此，Dubbo 在通信性能、稳定性方面具有无可比拟的优势，非常适合构建近乎无限水平伸缩的微服务集群，这也是 Dubbo 从实践层面优于业界很多同类的产品的巨大优势。

## 高性能数据传输
Dubbo 内置支持 Dubbo2、Triple 两款高性能通信协议。其中
* Dubbo2 是基于 TCP 传输协议之上构建的二进制私有 RPC 通信协议，是一款非常简单、紧凑、高效的通信协议。
* Triple 是基于 HTTP/2 的新一代 RPC 通信协议，在网关穿透性、通用性以及 Streaming 通信上具备优势，Triple 完全兼容 gRPC 协议。

以下是基于 Dubbo 3.2 版本得出的压测指标数据，您也可以通过 [dubbo-benchmark](https://github.com/apache/dubbo-benchmark) 项目自行压测。

### TCP protocol benchmark

对比 Dubbo 2.x 及早期 3.x 版本
* 较小报文场景 createUser、getUser 下，提升率约 180%。
* 极小报文 existUser(仅一个boolean值)下提升率约 24%
* 较大报文 listUser 提升率最高，达到了 1000%！

![dubbo-rpc-protocol-benchmark](/imgs/v3/performance/rpc-dubbo.png)

### Triple protocol benchmark

* 较小报文场景 createUser、existUser、getUser 下，较 3.1 版本性能提升约 40-45%，提升后的性能与 gRPC 同场景的性能基本持平。
* 较大报文场景 listUser 下较 3.1 版本提升了约 17%，相较于同场景下的 gRPC 低 11%。

![dubbo-http2-protobuf-benchmark](/imgs/v3/performance/rpc-triple.png)

了解更多
* [通信协议](../../../core-features/protocols)
* [Benchmark 指标 (不定期更新)](https://github.com/apache/dubbo/issues/10558#issuecomment-1473015636)

## 构建可伸缩的微服务集群
业务增长带来了集群规模的快速增长，而集群规模的增长会对服务治理架构带来挑战：
* 注册中心的存储容量瓶颈
* 节点动态变化带来的地址推送与解析效率下降
* 消费端存储大量网络地址的资源开销
* 复杂的网络链接管理
* 高峰期的流量无损上下线
* 异常节点的自动节点管理

以上内容直接关系到微服务集群的稳定性，因此很容易成为影响集群和业务增长的瓶颈，集群规模越大，问题带来的影响面也就被进一步放大。很多开发者可能会想只有几个应用而已，当前不需要并不关心集群规模，但作为技术架构选型的关键因素之一，我们还是要充分考虑微服务集群未来的可伸缩性。并且基于对业界大量微服务架构和框架实现的调研，一些产品的性能瓶颈点可能很快就会到来（部分产品所能高效支持的瓶颈节点规模阈值都是比较低的，比如几十个应用、数百个节点）。

Dubbo 的优势在于近乎无限水平扩容的集群规模，在阿里巴巴双十一场景万亿次调用的实践检验，通过以下内容了解 Dubbo 构建生产可用的、可伸缩的大规模微服务集群背后的原理：
* [Dubbo3 服务发现](../../../core-features/service-discovery/)
* [流量管控](../../../core-features/traffic/)

## 智能化流量调度
Dubbo3 内置了具备自适应感知集群负载状态、智能调节流量分布的限流与调度算法实现，从消费者、提供者两个不同视角智能调整流量分布，最大限度确保将流量调度到具有最佳处理能力的实例上，从而提升整个集群的吞吐量与稳定性。

### 自适应负载均衡
自适应负载均衡是从消费者视角考虑如何将请求分配到当前具有最优处理能力的机器实例。Dubbo3 新引入了两种负载均衡算法
* 一种是基于公平性考虑的单纯 `P2C` 算法
* 另一种是基于自适应的方法 `adaptive`，其试图自适应的衡量 provider 端机器的吞吐能力，然后将流量尽可能分配到吞吐能力高的机器上，以提高系统整体的性能。

### 自适应限流
与负载均衡运行在消费者端不同的是，限流功能运行在提供者端。其作用是限制提供端实例处理并发任务时的最大数量。从理论上讲，服务端机器的处理能力是存在上限的，因此当并发请求量达到或接近上限时，拒绝掉一部分请求反而是更好的选择。相比于人为提前设置静态最大并发值，自适应限流算法可以动态调整服务端机器的最大并发值，使其可以在保证机器不过载的前提下，尽可能多的处理接收到的请求。

关于这部分请参考 [Dubbo3 服务柔性设计文档](../../../reference/proposals/heuristic-flow-control)