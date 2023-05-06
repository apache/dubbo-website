---
description: ""
linkTitle: 限流 & 熔断
title: 限流 & 熔断
type: docs
weight: 5
---

由于微服务分布式的特点，如何构建稳定的微服务集群是一个很大的挑战，其中有两项非常关键的点值得关注
* 流量控制 (Rate Limiting)
* 熔断降级 (Circuit Breaking)

## 流量控制
**流量控制更多的是站在 Dubbo 服务提供者视角来保证服务稳定性**，通过明确的为 Dubbo 服务设置请求上限阈值，确保服务所处理的请求数始终在一个合理范围之内，从而确保系统整体的稳定性。

![provider-rate-limit](/imgs/v3/feature/circuit-breaking/provider-rate-limit.png)

根据服务的具体部署情况，服务所能处理的流量上限是一定的，当对服务的请求数量保持在合理的范围时，系统运行正常；而当请求数量严重超过服务处理能力时，如大促期间的流量洪峰等场景，就可能造成服务提供者端的资源过度消耗、负载过高，进而出现响应延迟、请求无应答、系统假死等情况。

流量控制解决的问题和工作方式比较容易理解，而其使用的难点就是如何确定服务所能处理的流量最大值？
* 一种模式是由用户预先设定一个固定的限流值，如 Dubbo 通过集成 Sentinel 等产品实现的限流能力即是这种模式
    * [Dubbo Sentinel 流量控制](../../../tasks/rate-limit/sentinel/)
* 另一种方式是 Dubbo 框架自动根据系统或集群负载情况执行限流，相比用户预先设置限流值更加灵活方便，Dubbo 目前内置了自适应限流模式，具体可参见：
    * [Java 自适应限流使用方式](../../../mannual/java-sdk/advanced-features-and-usage/performance/adaptive-concurrency-control/)
    * [Go 自适应限流使用方式](../../../reference/proposals/heuristic-flow-control/)
    * [自适应限流设计原理](../../../reference/proposals/heuristic-flow-control/)

## 熔断降级
**熔断降级则是更多的从 Dubbo 服务消费者视角来保障系统稳定性的重要手段**。一个服务往往需要调用更多的下游 Dubbo 服务来完成业务逻辑，这时下游服务的稳定性就会影响当前服务甚至整个系统的稳定性，熔断（Circuit Breaking）即是面向不稳定服务场景设计的，它能最大限度避免下游服务不稳定对上游服务带来的影响。

而相比于熔断后直接返回调用失败信息，配合服务降级能力，我们可以继续调用预先设置好的服务降级逻辑，以降级逻辑的结果作为最终调用结果，以更优雅的返回给服务调用方。

![consumer-circuit-breaking](/imgs/v3/feature/circuit-breaking/consumer-circuit-breaking.png)

如上图所示，Dubbo Consumer 依赖的下游的三个 Dubbo 服务，当 Service 3 出现不稳定的情况时（如响应时间变长、错误率增加等），从而 Consumer 调用 Service 3 的线程等资源就会产生堆积，如果此时我们不在 Consumer 侧做任何限制，则 Service 1 与 Service 2 的调用都会受到稳定性影响。通过熔断 Service 3 我们就能保证整个 Dubbo Consumer 服务的稳定性，不拖垮整个 Consumer 服务，熔断 Service 3 的方式可以有很多种实现，包括线程数、信号量、错误率等。

Dubbo 通过集成业界主流的框架实现了服务熔断降级能力

* [Sentinel](../../../tasks/rate-limit/sentinel/)
* [Hystrix](../../../tasks/rate-limit/hystrix/)
* [Resilience4J](../../../tasks/rate-limit/resilience4j/)
