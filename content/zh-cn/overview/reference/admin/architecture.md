---
description: ""
linkTitle: 整体架构
no_list: true
title: Admin 整体架构
type: docs
weight: 1
---

在理解 Dubbo Admin 的架构之前，我们要先从以下的 Dubbo 的总体架构说起。

![DubboAdmin架构图.png](/imgs/v3/reference/admin/architecture.png)

Dubbo 架构上分为：**服务治理抽象控制面** 和 **Dubbo 数据面** 。

- **服务治理控制面**。控制面包含注册中心、流量管控策略、Admin 控制台、Istio、OpenSergo 等组件。
- **Dubbo 数据面**。数据面代表集群部署的所有 Dubbo 进程，进程之间通过 RPC 协议实现数据交换，并与控制面进行治理策略交互。

可以看到，Admin 是服务治理控制面中的一个重要组件，负责微服务集群的服务治理、可视化展示等。

## Admin 部署架构

![admin-core-components.png](/imgs/v3/reference/admin/admin-core-components.png)

总体上来说，Admin 部署架构分为以下几个部分：
* Admin 主进程，包括服务发现元数据管理、可视化控制台、安全认证策略管控、其他定制化服务治理能力等组件。
* 强依赖组件，包括 Mysql 数据库、注册/配置/元数据中心（可以是 Kubernetes、Nacos、Zookeeper 等）
* 可选依赖依赖，包括 Prometheus、Grafana、Zipkin 等
