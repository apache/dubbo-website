---
aliases:
    - /zh/overview/core-features/service-discovery/
    - /zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/
description: 服务发现
feature:
    description: |
        Dubbo 提供了高性能、可伸缩的服务发现机制，面向百万集群实例规模设计，默认提供 Nacos、Zookeeper 等注册中心适配并支持自定义扩展。
    title: 服务发现
linkTitle: 服务发现
title: 服务发现
type: docs
weight: 2
---


Dubbo 提供的是一种 Client-Based 的服务发现机制，依赖第三方注册中心组件来协调服务发现过程，支持常用的注册中心如 Nacos、Consul、Zookeeper 等。

以下是 Dubbo 服务发现机制的基本工作原理图：

![service-discovery](/imgs/v3/feature/service-discovery/arc.png)

服务发现包含提供者、消费者和注册中心三个参与角色，其中，Dubbo 提供者实例注册 URL 地址到注册中心，注册中心负责对数据进行聚合，Dubbo 消费者从注册中心读取地址列表并订阅变更，每当地址列表发生变化，注册中心将最新的列表通知到所有订阅的消费者实例。

## 面向百万实例集群的服务发现机制
区别于其他很多微服务框架的是，**Dubbo3 的服务发现机制诞生于阿里巴巴超大规模微服务电商集群实践场景，因此，其在性能、可伸缩性、易用性等方面的表现大幅领先于业界大多数主流开源产品**。是企业面向未来构建可伸缩的微服务集群的最佳选择。

![service-discovery](/imgs/v3/feature/service-discovery/arc2.png)

* 首先，Dubbo 注册中心以应用粒度聚合实例数据，消费者按消费需求精准订阅，避免了大多数开源框架如 Istio、Spring Cloud 等全量订阅带来的性能瓶颈。
* 其次，Dubbo SDK 在实现上对消费端地址列表处理过程做了大量优化，地址通知增加了异步、缓存、bitmap 等多种解析优化，避免了地址更新常出现的消费端进程资源波动。
* 最后，在功能丰富度和易用性上，服务发现除了同步 ip、port 等端点基本信息到消费者外，Dubbo 还将服务端的 RPC/HTTP 服务及其配置的元数据信息同步到消费端，这让消费者、提供者两端的更细粒度的协作成为可能，Dubbo 基于此机制提供了很多差异化的治理能力。

### 高效地址推送实现

从注册中心视角来看，它负责以应用名 (dubbo.application.name) 对整个集群的实例地址进行聚合，每个对外提供服务的实例将自身的应用名、实例ip:port 地址信息 (通常还包含少量的实例元数据，如机器所在区域、环境等) 注册到注册中心。

> Dubbo2 版本注册中心以服务粒度聚合实例地址，比应用粒度更细，也就意味着传输的数据量更大，因此在大规模集群下也遇到一些性能问题。
> 针对 Dubbo2 与 Dubbo3 跨版本数据模型不统一的问题，Dubbo3 给出了[平滑迁移方案](/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery/)，可做到模型变更对用户无感。

![service-discovery](/imgs/v3/feature/service-discovery/registry-data.png)

<br/>
每个消费服务的实例从注册中心订阅实例地址列表，相比于一些产品直接将注册中心的全量数据 (应用 + 实例地址) 加载到本地进程，Dubbo 实现了按需精准订阅地址信息。比如一个消费者应用依赖 app1、app2，则只会订阅 app1、app2 的地址列表更新，大幅减轻了冗余数据推送和解析的负担。

<p> </p>
<br/>

![service-discovery](/imgs/v3/feature/service-discovery/subscription2.png)

### 丰富元数据配置
除了与注册中心的交互，Dubbo3 的完整地址发现过程还有一条额外的元数据通路，我们称之为元数据服务 (MetadataService)，实例地址与元数据共同组成了消费者端有效的地址列表。

![service-discovery](/imgs/v3/feature/service-discovery/metadata.png)

完整工作流程如上图所示，首先，消费者从注册中心接收到地址 (ip:port) 信息，然后与提供者建立连接并通过元数据服务读取到对端的元数据配置信息，两部分信息共同组装成 Dubbo 消费端有效的面向服务的地址列表。以上两个步骤都是在实际的 RPC 服务调用发生之前。

> 关于 MetadataService 的定义及完整服务发现流程分析，请查看 [应用级服务发现详解]({{< relref "../../../blog/proposals/service-discovery/" >}})。

> 对于微服务间服务发现模型的数据同步，REST 定义了一套非常有意思的成熟度模型，感兴趣的朋友可以参考这里的链接 https://www.martinfowler.com/articles/richardsonMaturityModel.html， 按照文章中的 4 级成熟度定义，Dubbo 当前基于接口粒度的模型可以对应到最高的 L4 级别。

## 配置方式
Dubbo 服务发现扩展了多种注册中心组件支持，如 Nacos、Zookeeper、Consul、Redis、kubernetes 等，可以通过配置切换不同实现，同时还支持鉴权、命名空间隔离等配置。具体配置方式请查看 SDK 文档

* [Java](../../mannual/java-sdk/reference-manual/registry)
* [Golang](../../mannual/golang-sdk/tutorial/develop/registry)
* [Rust](../../mannual/rust-sdk/)

Dubbo 还支持一个应用内配置多注册中心的情形如双注册、双订阅等，这对于实现不同集群地址数据互通、集群迁移等场景非常有用处，我们将在未来文档中添加 `最佳实践` 对这部分内容进行示例说明。

## 自定义扩展
注册中心适配支持自定义扩展实现，具体请参见 [Dubbo 可扩展性](../extensibility)
