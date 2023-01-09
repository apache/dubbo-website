---
type: docs
title: "服务网格"
linkTitle: "服务网格"
weight: 80
description: ""
feature:
  title: 服务网格(Service Mesh)
  description: >
    多种形态数据面支持，包括以 Thin SDK 模式与 Envoy 等一起部署或以 Proxyless 模式独立部署，所有模式均可以开源标准方式无缝接入 Istio、Consul 等服务治理体系。
---


* 数据面形态
* 提供平滑迁移方案
* 官方提供自定义控制面，且支持任一业界主流控制面 Istio、Linkerd 等。

## Dubbo Mesh

### Sidecar Mesh

### Proxyless Mesh

## 迁移方案


Service Mesh 强调控制面在微服务治理中的作用，在一定程度上推动了控制面通信协议、职责范围的扩展与标准化；传统 Mesh 架构下的 Sidecar 模型强调旁路代理对于流量的统一管控，以实现透明升级、多语言无感、无业务侵入等特性。

Dubbo3 提供了基于自身思考的 Dubbo Mesh 解决方案，强调了控制面对微服务集群的统一管控，而在部署架构上，同时支持 sidecar 与无 sidecar 的 proxyless 部署架构，使用 Dubbo Mesh 的用户基于自身的业务特点将有更多的部署架构选择。


Service Mesh 在业界得到了广泛的传播与认可，并被认为是下一代的微服务架构，这主要是因为它解决了很多棘手的问题，包括透明升级、多语言、依赖冲突、流量治理等。Service Mesh 的典型架构是通过部署独立的 Sidecar 组件来拦截所有的出口与入口流量，并在 Sidecar 中集成丰富的流量治理策略如负载均衡、路由等，除此之外，Service Mesh 还需要一个控制面（Control Panel）来实现对 Sidecar 流量的管控，即各种策略下发。我们在这里称这种架构为经典 Mesh。

然而任何技术架构都不是完美的，经典 Mesh 在实施层面也面临成本过高的问题

需要运维控制面（Control Panel）
需要运维 Sidecar
需要考虑如何从原有 SDK 迁移到 Sidecar
需要考虑引入 Sidecar 后整个链路的性能损耗
为了解决 Sidecar 引入的相关成本问题，Dubbo 引入并实现了全新的 Proxyless Mesh 架构，顾名思义，Proxyless Mesh 就是指没有 Sidecar 的部署，转而由 Dubbo SDK 直接与控制面交互，其架构图如下

可以设想，在不同的组织、不同的发展阶段，未来以 Dubbo 构建的微服务将会允许有三种部署架构：传统 SDK、基于 Sidecar 的 Service Mesh、脱离 Sidecar 的 Proxyless Mesh。基于 Sidecar 的 Service Mesh，即经典的 Mesh 架构，独立的 sidecar 运行时接管所有的流量，脱离 Sidecar 的 Proxyless Mesh，副 SDK 直接通过 xDS 与控制面通信。Dubbo 微服务允许部署在物理机、容器、Kubernetes 平台之上，能做到以 Admin 为控制面，以统一的流量治理规则进行治理。

Dubbo Mesh 的目标是提供适应 Dubbo 体系的完整 Mesh 解决方案，包含定制化控制面（Control Plane）、定制化数据面解决方案。Dubbo 控制面基于业界主流 Istio 扩展，支持更丰富的流量治理规则、Dubbo应用级服务发现模型等，Dubbo 数据面可以采用 Envoy Sidecar，即实现 Dubbo SDK + Envoy 的部署方案，也可以采用 Dubbo Proxyless 模式，直接实现 Dubbo 与控制面的通信。Dubbo Mesh 在快速演进中，我们将努力保持文档内容的更新。

![Proxy Mesh]()

![]()
