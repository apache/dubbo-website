---
type: docs
title: "配置中心"
linkTitle: "配置中心"
weight: 7
description: ""
---

配置中心 (config-center) 在 Dubbo 中可承担 3 个职责：

1. [外部化配置](../config/principle/#33-外部化配置)：启动配置的集中式存储 （简单理解为 dubbo.properties 的外部化存储）。
2. 流量治理规则存储

请参考具体扩展实现了解如何启用配置中心。

值得注意的是 Dubbo 动态配置中心定义了两个不同层次的隔离选项，分别是 namespce 和 group。
* namespace - 配置命名空间，默认值 `dubbo`。命名空间通常用于多租户隔离，即对不同用户、不同环境或完全不关联的一系列配置进行逻辑隔离，区别于物理隔离的点是不同的命名空间使用的还是同一物理集群。
* group - 配置分组，默认值 `dubbo`。`group` 通常用于归类一组相同类型/目的的配置项，是对 `namespace` 下的进一步隔离。

参考 [配置中心配置项手册](../config/properties/#config-center) 了解 namespce 和 group 之外 config-center 开放的更多配置项。

> 为了兼容 2.6.x 版本配置，在使用 Zookeeper 作为注册中心，且没有显示配置配置中心的情况下，Dubbo 框架会默认将此 Zookeeper 用作配置中心，但将只作服务治理用途。

