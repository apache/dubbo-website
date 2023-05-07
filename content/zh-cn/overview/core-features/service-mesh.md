---
aliases:
    - /zh/overview/core-features/service-mesh/
    - /zh-cn/overview/mannual/java-sdk/concepts-and-architecture/mesh/
description: 服务网格
feature:
    description: |
        灵活的数据面 (Proxy & Proxyless) 部署形态支持，无缝接入 Istio 控制面治理体系。
    title: 服务网格(Service Mesh)
linkTitle: 服务网格
title: 服务网格
type: docs
weight: 9
working-in-progress: true
---



Dubbo Mesh 是 Dubbo 在云原生背景的微服务整体解决方案，它帮助开发者实现 Dubbo 服务与标准的 Kubernetes Native Service 体系的打通，让 Dubbo 应用能够无缝接入 Istio 等业界主流服务网格产品。

以下是 Dubbo Mesh 的部署架构图

![Dubbo-Mesh](/imgs/v3/mesh/mix-mesh.png)

* 控制面。Istio 作为统一控制面，为集群提供 Kubernetes 适配、服务发现、证书管理、可观测性、流量治理等能力。
* 数据面。Dubbo 应用实例作为数据面组件，支持两种部署模式
    * Proxy 模式。Dubbo 进程与 Envoy 部署在同一 pod，进出 Dubbo 的流量都经 Envoy 代理拦截，由 Envoy 执行流量管控。
    * Proxyless 模式。Dubbo 进程独立部署，进程间直接通信，通过 xDS 协议与控制面直接交互。

关于服务网格架构以及为何要接入 Istio 控制面，请参考 [Istio 官网](https://istio.io/)，本文不包含这部分通用内容的讲解，而是会侧重在 Dubbo Mesh 解决方案本身。

## Dubbo Mesh

### Proxy Mesh
在 proxy 模式下，Dubbo 与 Envoy 等边车 (Proxy or Sidecar) 部署在一起

![dubbo-sidecar](/imgs/v3/mesh/dubbo-proxy.png)

以上是 Dubbo Proxy Mesh 部署架构图
* Dubbo 与 Envoy 部署在同一个 Pod 中，Istio 实现对流量和治理的统一管控。
* Dubbo 只提供面向业务应用的编程 API、RPC 通信能力，其余流量管控能力如地址发现、负载均衡、路由寻址等都下沉到 Envoy，Envoy 拦截所有进出流量并完成路由寻址等服务治理工作。
* 控制面与 Envoy 之间通过图中虚线所示的 xDS 协议进行配置分发。

在 Proxy 模式下，Dubbo3 通信层选用 Triple、gRPC、REST 等基于 HTTP 的通信协议可以获得更好的网关穿透性与性能体验。

### Proxyless Mesh
在 Proxyless 模式下，没有 Envoy 等代理组件，Dubbo 进程保持独立部署并直接通信，Istio 控制面通过 xDS 与 Dubbo 进程进行治理能力交互。

![dubbo-proxyless](/imgs/v3/mesh/dubbo-proxyless.png)

Proxyless 模式下 Dubbo 部署与服务网格之前基本一致，通过不同语言版本的 Dubbo3 SDK 直接实现 xDS 协议解析

#### 为什么需要 Proxyless Mesh

Proxy 模式很好的实现了治理能力与有很多优势，如平滑升级、多语言、业务侵入小等，但也带来了一些额外的问题，比如：
* Sidecar 通信带来了额外的性能损耗，这在复杂拓扑的网络调用中将变得尤其明显。
* Sidecar 的存在让应用的声明周期管理变得更加复杂。
* 部署环境受限，并不是所有的环境都能满足 Sidecar 部署与请求拦截要求。

在 Proxyless 模式下，Dubbo 进程之间继续保持直连通信模式：
* 没有额外的 Proxy 中转损耗，因此更适用于性能敏感应用
* 更有利于遗留系统的平滑迁移
* 架构简单，容易运维部署
* 适用于几乎所有的部署环境

## 示例任务
了解了足够多的原理知识，我们推荐你访问如下 [示例](../../tasks/mesh) 进行动手实践。

## 可视化
推荐使用 [Dubbo Admin](../../tasks/deploy) 作为您 Dubbo 集群的可视化控制台，它兼容所有 Kubernetes、Mesh 和非 Mesh 架构的部署。

除此之外，你也可以使用 [Istio 官方推荐的可视化工具](https://istio.io/latest/docs/tasks/observability/kiali/) 来管理您的 Dubbo Mesh 集群。

## 接入非 Istio 控制面
Dubbo Mesh 本身并不绑定任何控制面产品实现，你可以使用 Istio、Linkerd、Kuma 或者任一支持 xDS 协议的控制面产品，对于 Sidecar 亦是如此。

如果你已经完整的体验了 [基于 Istio 的 Dubbo Mesh](/) 示例任务，并且发现 Istio 很好的满足了你的 Dubbo Mesh 治理诉求，那么采用 Istio 作为你的控制面是首选的解决方案。

如果你发现 Istio 模式下 Dubbo 部分能力受限，而这部分能力正好是你需要的，那么你需要考虑接入 Dubbo 控制面，用 Dubbo 控制面来替代 Istio，以获得更多 Dubbo 体系原生能力支持、更好的性能体验。具体请参见 [基于 Dubbo 定制控制面的 Dubbo Mesh 示例任务](/)。

> 简单来讲，这是 Dubbo 社区发布的一款基于 Istio 的定制版本控制面，Dubbo 控制面安装与能力差异请参见上面的示例任务链接。

## 老系统迁移方案
### 如何解决注册中心数据同步的问题？
Address Synchronization

### 如何解决 Dubbo2 协议通信的问题？

Aeraki Mesh
