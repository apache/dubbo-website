---
type: docs
title: "可扩展性"
linkTitle: "可扩展性"
weight: 60
---

Dubbo 在设计上是高度可扩展的，通过这些扩展点你可以做到：
* 拦截流量并控制流量行为
* 按需调优 Dubbo 的一些默认策略与实现
* 将 Dubbo 服务适配到自己内部微服务集群或其他主流的开源组件

## 扩展点定义

Dubbo 扩展能力使得 Dubbo 项目很方便的切分成一个一个的子模块，实现热插拔特性。用户完全可以基于自身需求，替换 Dubbo 原生实现，来满足自身业务需求。

![/imgs/v3/concepts/extension-use.png](/imgs/v3/concepts/extension-use.png)

基于以上扩展点定义，可以实现如下功能的灵活拓展：通信协议、序列化编码协议、流量统计、集群容错策略、路由规则、负载均衡、注册中心、线程池策略、配置中心、分布式事务实现、全链路追踪、监控系统、熔断策略、限流降级等。

## 部分官方扩展实现

以下是官方或官方生态项目提供的一些默认实现，更多实现可以在 [apache/dubbo-spi-extensions]() 中了解。

![extensibility-echosystem.png](/imgs/v3/concepts/extensibility-echosystem.png)

## 扩展示例

以下演示了如何扩展 Dubbo 来解决实际问题，可以跟随示例学习。

* [自定义负载均衡策略]()
* [自定义的注册中心]()
* [拦截流量]()

还有如下一些高级扩展示例：

* [全链路追踪]()
* [数据一致性]()
* [限流降级]()