---
type: docs
title: "Dubbo3 简介"
linkTitle: "简介"
weight: 1
description: "这篇文档是关于 Dubbo 的简单介绍，涵盖 Dubbo 的核心概念、基本使用方式以及 Dubbo3 核心功能，无论你是 Dubbo 的老用户还是新用户，都可以通过这篇
文档快速了解 Dubbo 及新版本带来的变化。"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/overview/what/overview/)。
{{% /pageinfo %}}

Apache Dubbo 是一款微服务开发框架，它提供了 RPC通信 与 微服务治理 两大关键能力。这意味着，使用 Dubbo 开发的微服务，将具备相互之间的远程发现与通信能力，
同时利用 Dubbo 提供的丰富服务治理能力，可以实现诸如服务发现、负载均衡、流量调度等服务治理诉求。同时 Dubbo 是高度可扩展的，用户几乎可以在任意功能点去定制自己的实现，以改变框架的默认行为来满足自己的业务需求。

Dubbo3 基于 Dubbo2 演进而来，在保持原有核心功能特性的同时， Dubbo3 在易用性、超大规模微服务实践、云原生基础设施适配、安全设计等几大方向上进行了全面升级。
以下文档都将基于 Dubbo3 展开。

## What Dubbo3 is
如开篇所述，Dubbo 提供了构建云原生微服务业务的一站式解决方案，可以使用 Dubbo 快速定义并发布微服务组件，同时基于 Dubbo 开箱即用的丰富特性及超强的扩展能力，构建运维整个微服务体系所需的各项服务治理能力，如 Tracing、Transaction 等，Dubbo 提供的基础能力包括：
* 服务发现
* 流式通信
* 负载均衡
* 流量治理
* .....

Dubbo 计划提供丰富的多语言客户端实现，其中 Java、Golang 版本是当前稳定性、活跃度最好的版本，其他多语言客户端正在持续建设中。

自开源以来，Dubbo 就被一众大规模互联网、IT公司选型，经过多年企业实践积累了大量经验。Dubbo3 是站在巨人肩膀上的下一代产品，它汲取了上一代的优点并针对已知问题做了大量优化，因此，Dubbo 在解决业务落地与规模化实践方面有着无可比拟的优势：
* 开箱即用
    * 易用性高，如 Java 版本的面向接口代理特性能实现本地透明调用
    * 功能丰富，基于原生库或轻量扩展即可实现绝大多数的微服务治理能力
* 超大规模微服务集群实践
    * 高性能的跨进程通信协议
    * 地址发现、流量治理层面，轻松支持百万规模集群实例
* 企业级微服务治理能力
    * 服务测试
    * 服务Mock


Dubbo3 是在云原生背景下诞生的，使用 Dubbo 构建的微服务遵循云原生思想，能更好的复用底层云原生基础设施、贴合云原生微服务架构。这体现在：
* 服务支持部署在容器、Kubernetes平台，服务生命周期可实现与平台调度周期对齐；
* 支持经典 Service Mesh 微服务架构，引入了 Proxyless Mesh 架构，进一步简化 Mesh 的落地与迁移成本，提供更灵活的选择；
* 作为桥接层，支持与 SpringCloud、gRPC 等异构微服务体系的互调互通

## 一站式微服务解决方案
Dubbo 提供了从服务定义、服务发现、服务通信到流量管控等几乎所有的服务治理能力，并且尝试从使用上对用户屏蔽底层细节，以提供更好的易用性。

定义服务在 Dubbo 中非常简单与直观，可以选择使用与某种语言绑定的方式（如 Java 中可直接定义 Interface），也可以使用 Protobuf IDL 语言中立的方式。无论选择哪种方式，站在服务消费方的视角，都可以通过 Dubbo 提供的透明代理直接编码。
>需要注意的是，在 Dubbo 中，我们提到服务时，通常是指 RPC 粒度的、提供某个具体业务增删改功能的接口或方法，与一些微服务概念书籍中泛指的服务并不是一个概念。

点对点的服务通信是 Dubbo 提供的另一项基本能力，Dubbo 以 RPC 的方式将请求数据（Request）发送给后端服务，并接收服务端返回的计算结果（Response）。RPC 通信对用户来说是完全透明的，使用者无需关心请求是如何发出去的、发到了哪里，每次调用只需要拿到正确的调用结果就行。同步的 Request-Response 是默认的通信模型，它最简单但却不能覆盖所有的场景，因此，Dubbo 提供更丰富的通信模型：
* 消费端异步请求(Client Side Asynchronous Request-Response)
* 提供端异步执行（Server Side Asynchronous Request-Response）
* 消费端请求流（Request Streaming）
* 提供端响应流（Response Streaming）
* 双向流式通信（Bidirectional Streaming）

Dubbo 的服务发现机制，让微服务组件之间可以独立演进并任意部署，消费端可以在无需感知对端部署位置与 IP 地址的情况下完成通信。Dubbo 提供的是 Client-Based 的服务发现机制，使用者可以有多种方式启用服务发现：
* 使用独立的注册中心组件，如 [Nacos](https://nacos.io/zh-cn/)、Zookeeper、Consul、Etcd 等。
* 将服务的组织与注册交给底层容器平台，如 Kubernetes，这被理解是一种更云原生的方式

透明地址发现让 Dubbo 请求可以被发送到任意 IP 实例上，这个过程中流量被随机分配。当需要对流量进行更丰富、更细粒度的管控时，就可以用到 Dubbo 的流量管控策略，Dubbo 提供了包括负载均衡、流量路由、请求超时、流量降级、重试等策略，基于这些基础能力可以轻松的实现更多场景化的路由方案，包括金丝雀发布、A/B测试、权重路由、同区域优先等，更酷的是，Dubbo 支持流控策略在运行态动态生效，无需重新部署。

Dubbo 强大的服务治理能力不仅体现在核心框架上，还包括其优秀的扩展能力以及周边配套设施的支持。通过 Filter、Router、Protocol 等几乎存在于每一个关键流程上的扩展点定义，我们可以丰富 Dubbo 的功能或实现与其他微服务配套系统的对接，包括 Transaction、Tracing 目前都有通过 SPI 扩展的实现方案，具体可以参见 Dubbo 扩展性的详情，也可以在 [apache/dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions) 项目中发现与更多的扩展实现。

## 大规模企业微服务实践沉淀
Dubbo 最早诞生于阿里巴巴，随后加入 Apache 软件基金会，项目从设计之初就是为了解决企业的服务化问题，因此充分考虑了大规模集群场景下的服务开发与治理问题，如易用性、性能、流量管理、集群可伸缩性等。在 Dubbo 开源的将近 10 年时间内，Dubbo 几乎成为了国内微服务框架选型的首选框架，尤其受到大规模互联网、IT企业的认可，可以说作为开源服务框架，Dubbo 在支持微服务集群方面有着非常大的规模与非常久的实践经验积累，是最具有企业规模化微服务实践话语权的框架之一。采用 Dubbo 的企业涵盖互联网、传统IT、金融、生产制造业多个领域，一些典型用户包括阿里巴巴、携程、工商银行、中国人寿、海尔、金蝶等。

在企业大规模实践的过程中，Dubbo 的稳定性得到了验证，服务治理的易用性与丰富度也在不断提升，而也就是在这样的背景下催生了下一代的产品 - Dubbo3。Dubbo3 的整个设计与开发过程，始终有来自社区团队与众多企业用户的共同参与，因此 Dubbo3 的许多核心架构与功能都充分考虑了大规模微服务实践诉求。阿里巴巴是参与在 Dubbo3 中的核心力量之一，作为企业用户其主导了该版本许多核心功能的设计与开发，阿里巴巴把 Dubbo3 社区版本确定为其未来内部主推的服务框架，并选择将内部 HSF 通过 Dubbo3 的形式贡献到开源社区，在阿里巴巴内部，众多业务线包括电商系统的考拉、交易平台，以及饿了么、钉钉等都已经成功迁移到 Dubbo3 版本。同样全程参与在 Dubbo3 开发与验证试点过程中的企业用户包括工商银行、携程、斗鱼、小米等。
 
 Dubbo 的大规模实践经验主要体现在：
 * 高性能通信
 * 高可扩展性
 * 超大规模集群实例水平扩展
 * 丰富的服务治理能力
 
 关于 Dubbo 调用性能、支持超大规模集群地址方面的评测数据，将在随后发布，敬请期待。

## 云原生友好

Dubbo 从设计上是完全遵循云原生微服务开发理念的，这体现在多个方面，首先是对云原生基础设施与部署架构的支持，包括 Kubernetes、Service Mesh 等，另一方面，Dubbo 众多核心组件都已面向云原生升级，包括 Triple 协议、统一路由规则、对多语言支持。值得一提的是，如何使用 Dubbo 支持弹性伸缩的服务如 Serverless 也在未来计划之中，这包括利用 Native Image 提高 Dubbo 的启动速度与资源消耗等。

结合当前版本，本节主要从以下两点展开 Dubbo 的云原生特性
* 容器调度平台（Kubernetes）
* Service Mesh

### Kubernetes
Dubbo 微服务要支持 Kubernetes 平台调度，最基础的就是实现 dubbo 服务生命周期与容器生命周期的对齐，这包括 Dubbo 的启动、销毁、服务注册等生命周期事件。相比于以往 Dubbo 自行定义生命周期事件，并要求开发人员在运维实践过程中遵守约定，Kubernetes 底层基础设施定义了严格的组件生命周期事件(probe)，转而要求 Dubbo 去按约定适配。

Kubernetes Service 是另一个层面的适配，这体现了服务定义与注册向云原生底层基础设施下沉的趋势。在这种模式下，用户不再需要搭建额外的注册中心组件，Dubbo 消费端节点能自动对接到 Kubernetes（API-Server 或 DNS），根据服务名（Kubernetes Service Name） 查询到实例列表（Kubernetes endpoints）。 此时服务是通过标准的 Kubernetes Service API 定义，并被调度到各个节点。

### Service Mesh

Service Mesh 在业界得到了广泛的传播与认可，并被认为是下一代的微服务架构，这主要是因为它解决了很多棘手的问题，包括透明升级、多语言、依赖冲突、流量治理等。Service Mesh 的典型架构是通过部署独立的 Sidecar 组件来拦截所有的出口与入口流量，并在 Sidecar 中集成丰富的流量治理策略如负载均衡、路由等，除此之外，Service Mesh 还需要一个控制面（Control Panel）来实现对 Sidecar 流量的管控，即各种策略下发。我们在这里称这种架构为经典 Mesh。

然而任何技术架构都不是完美的，经典 Mesh 在实施层面也面临成本过高的问题
1. 需要运维控制面（Control Panel）
2. 需要运维 Sidecar
3. 需要考虑如何从原有 SDK 迁移到 Sidecar
4. 需要考虑引入 Sidecar 后整个链路的性能损耗

为了解决 Sidecar 引入的相关成本问题，Dubbo 引入了另一种变相的 Mesh 架构 - Proxyless Mesh，顾名思义，Proxyless Mesh 就是指没有 Sidecar 的部署，转而由 Dubbo SDK 直接与控制面交互，其架构图如下

![//imgs/v3/concepts/proxyless-mesh.png](/imgs/v3/concepts/proxyless-mesh.png)

> 在 Istio Proxyless Mesh 架构中，agent 是必须的，agent 主要来负责初始化和与控制面的通信。但是在 Dubbo Proxyless Mesh 架构中不是必须的，Dubbo SDK 可以直接与控制面进行交互。

可以设想，在不同的组织、不同的发展阶段，未来以 Dubbo 构建的微服务将会允许有三种部署架构：传统 SDK、基于 Sidecar 的 Service Mesh、脱离 Sidecar 的 Proxyless Mesh。基于 Sidecar 的 Service Mesh，即经典的 Mesh 架构，独立的 sidecar 运行时接管所有的流量，脱离 Sidecar 的 Proxyless Mesh，富 SDK 直接通过 xDS 与控制面通信。Dubbo 微服务允许部署在物理机、容器、Kubernetes 平台之上，能做到以 Admin 为控制面，以统一的流量治理规则进行治理。


## 了解更多

[What's New in Dubbo3](../new-in-dubbo3)

[体验 Dubbo3](../quick-start)

[迁移到 Dubbo3](../migration)


