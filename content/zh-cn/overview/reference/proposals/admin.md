---
aliases:
    - /zh/overview/reference/proposals/admin/
author: Jun Liu
date: 2023-02-28T00:00:00Z
description: |
    本文描述了 Dubbo Admin 作为控制面的总体架构设计与抽象。
linkTitle: Admin 架构设计
title: Dubbo Admin 控制面总体架构设计
type: docs
weight: 3
working_in_progress: true
---


## 1 Dubbo 整体架构
![DubboAdmin架构图.png](/imgs/v3/reference/admin/architecture.png)

架构上分为：**服务治理抽象控制面** 和 **Dubbo 数据面** 。

- **服务治理控制面**。控制面包含注册中心、流量管控策略、Admin 控制台、Istio、OpenSergo 等组件。
- **Dubbo 数据面**。数据面代表集群部署的所有 Dubbo 进程，进程之间通过 RPC 协议实现数据交换，并与控制面进行治理策略交互。

**进一步解释：**https://cn.dubbo.apache.org/zh-cn/overview/what/overview/

## Dubbo Admin 的整体定位与解释

**Dubbo Admin 是对微服务治理体系的统一定义与抽象，通过自定义核心组件与一系列配套工具，为不同部署架构和基础设施环境下部署的微服务集群带来统一的开发与运维差异。**

## 2 面向用户的开发步骤
### 第一步：安装 Dubbo Stack/Admin
> 核心思路是，屏蔽架构差异，通过统一入口将治理组件的安装和配置纳入成为 Dubbo 体系中的前置步骤

```shell
dubboctl install dubbo-stack
```

安装请参见: [Dubbo Admin 安装指南](../../setup/install/)

### 第二步：服务框架开发

- [Java](https://cn.dubbo.apache.org/zh-cn/overview/quickstart/java/)
- [Go](https://cn.dubbo.apache.org/zh-cn/overview/quickstart/go/)
- [Node.js](https://github.com/apache/dubbo-js)
- [Rust](https://cn.dubbo.apache.org/zh-cn/overview/quickstart/rust/)

## 3 控制面方案
![Dubbo架构草图.jpeg](/imgs/v3/reference/admin/architecture-draft.png)
### 3.1 确定 Dubbo 微服务治理体系的核心能力

- 服务发现
- 配置管理
- 流量治理规则
- 安全基础设施
- 可视化控制台

### 3.2 统一服务治理层接入方式

![address-discovery.png](/imgs/v3/reference/admin/address-discovery.png)

**对于任何微服务部署模式，Dubbo 数据面统一面向 **`**dubbo://hopst:ip**`**抽象服务治理控制面编程。**

具体工作流程：

1. 数据面通过配置先与 admin 组件进行交互，admin 返回当前部署架构下的实际注册中心、配置中心等组件地址，如图中的 `nacos://host:port`。
2. 数据面组件接收到新的组件地址后，直接与 Nacos 建立通信，此后依赖 Nacos 完成服务发现等功能。

### 3.3 在不同场景下如何兑现这些核心能力？
#### 场景一：传统微服务体系 (VM & Kubernetes)

- 控制面治理体系一键安装 (Admin & Nacos)
- 传统 Nacos 服务发现与治理模式
- 控制面可按需拉起更多的的组件，如 prometheus 等

![traditional.png](/imgs/v3/reference/admin/traditional.png)

#### 场景二：Kubernetes Service

1. **Istio 模式**

![kubernetes-service.png](/imgs/v3/reference/admin/kubernetes-service.png)

2. **其他对等模式 Nacos/OpenSergo**
#### 场景三：Migration or Multi-cluster
集群处于隔离的子网络空间

- 1
- 2


![multi-cluster-ingress.png](/imgs/v3/reference/admin/multi-cluster-ingress.png)

集群处于同一网络空间

![multi-cluster.png](/imgs/v3/reference/admin/multi-cluster.png)

### 3.4 Admin 控制面

![admin-core-components
.png](/imgs/v3/reference/admin/admin-core-components.png)

### 3.5 其他配套基础设施与工具

#### 用户控制台 Console

交互地址：[https://qedzyx.axshare.com/#id=2pqh0k&p=admin__&g=1](https://qedzyx.axshare.com/#id=2pqh0k&p=admin__&g=1)

![console-ui.png](/imgs/v3/reference/admin/console-ui.png)

#### Dubboctl & Helm
