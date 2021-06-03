---
type: docs
title: "Dubbo 部署架构（注册中心 配置中心 元数据中心）"
linkTitle: "部署架构"
weight: 5
description: "了解 Dubbo 的三大中心化组件，它们各自的职责、工作方式。"
---

作为一个微服务框架，Dubbo sdk 跟随着微服务组件被部署在分布式集群各个位置，为了在分布式环境下实现各个微服务组件间的协作，
Dubbo 定义了一些中心化组件，这包括：
* 注册中心。协调 Consumer 与 Provider 之间的地址注册与发现
* 配置中心。
    * 存储 Dubbo 启动阶段的全局配置，保证配置的跨环境共享与全局一致性
    * 负责服务治理规则（路由规则、动态配置等）的存储与推送。
* 元数据中心。
    * 接收 Provider 上报的服务接口元数据，为 Admin 等控制台提供运维能力（如服务测试、接口文档等）
    * 作为服务发现机制的补充，提供额外的接口/方法级别配置信息的同步能力，相当于注册中心的额外扩展
 
 ![//imgs/v3/concepts/threecenters.png](/imgs/v3/concepts/threecenters.png)

上图完整的描述了 Dubbo 微服务组件与各个中心的交互过程。

以上三个中心并不是运行 Dubbo 的必要条件，用户完全可以根据自身业务情况决定只启用其中一个或多个，以达到简化部署的目的。通常情况下，所有用户都会以独立的注册中心
开始 Dubbo 服务开发，而配置中心、元数据中心则会在微服务演进的过程中逐步的按需被引入进来。

> 当然在 Dubbo + Mesh 的场景下，随着 Dubbo 服务注册能力的弱化，注册中心也不再是必选项，其职责开始被控制面取代。
> 请参见 Dubbo Mesh 方案的描述，ThinSDK 与 Proxyless Mesh。

## 注册中心
![//imgs/v3/concepts/centers-registry.png](/imgs/v3/concepts/centers-registry.png)

## 配置中心
类比 Spring Cloud Config同
![//imgs/v3/concepts/centers-config.png](/imgs/v3/concepts/centers-config.png)

## 元数据中心
![//imgs/v3/concepts/centers-metadata.png](/imgs/v3/concepts/centers-metadata.png)


