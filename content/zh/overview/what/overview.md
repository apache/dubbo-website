---
type: docs
title: "Dubbo 简介"
linkTitle: "了解 Dubbo"
weight: 1
description: ""
---

Apache Dubbo 是一款 RPC 服务开发框架，用于解决微服务架构下的服务治理与通信问题，官方提供了 Java、Golang 等多语言 SDK 实现。使用 Dubbo 开发的微服务原生具备相互之间的远程地址发现与通信能力，
利用 Dubbo 提供的丰富服务治理特性，可以实现诸如服务发现、负载均衡、流量调度等服务治理诉求。Dubbo 被设计为高度可扩展，用户可以方便的实现流量拦截、选址的各种定制逻辑。

Dubbo3 定义为面向云原生的下一代 RPC 服务框架。3.0 基于 [Dubbo 2.x](../../docsv2.7) 演进而来，在保持原有核心功能特性的同时， Dubbo3 在易用性、超大规模微服务实践、云原生基础设施适配、安全性等几大方向上进行了全面升级。

### Dubbo 是什么

Apache Dubbo 最初在 2008 年由 Alibaba 捐献开源，很快成为了国内开源服务框架选型的事实标准框架    ，得到了各行各业的广泛应用。在 2017 年，Dubbo 正式捐献到 Apache 软件基金会并成为 Apache 顶级项目，目前 Dubbo3 已经是一站式的微服务解决方案提供：
* 基于 HTTP/2 的 [Triple 协议](../../whatsnew/triple)以及面向代理 API 的编程体验。
* 强大的[流量治理能力](../../tasks/traffic-management)，如地址发现、负载均衡、路由选址、动态配置等。
* [多语言 SDK 实现](../../mannual/)，涵盖 Java、Golang、Javascript 等，更多语言实现将会陆续发布。
* 灵活的适配与扩展能力，可轻松与微服务体系其他组件如 Tracing、Transaction 等适配。
* [Dubbo Mesh 解决方案](../../whatsnew/mesh)，同时支持 Sidecar、Proxyless 等灵活的 Mesh 部署方案。

Apache Dubbo 总体架构能很好的满足企业的大规模微服务实践，因为它从设计之初就是为了解决超大规模微服务集群实践问题，不论是阿里巴巴还是工商银行、中国平安、携程等社区用户，它们都通过多年的大规模生产环境流量对 Dubbo 的稳定性与性能进行了充分验证，因此，Dubbo 在解决业务落地与规模化实践方面有着无可比拟的优势：
* 开箱即用
    * 易用性高，如 Java 版本的面向接口代理特性能实现本地透明调用
    * 功能丰富，基于原生库或轻量扩展即可实现绝大多数的微服务治理能力
* 面向超大规模微服务集群设计
    * 极致性能，高性能的 RPC 通信协议设计与实现
    * 横向可扩展，轻松支持百万规模集群实例的地址发现与流量治理
* [高度可扩展](../extensibility)
  * 调用过程中对流量及协议的拦截扩展，如 Filter、Router、LB 等
  * 微服务治理组件扩展，如 Registry、Config Center、Metadata Center 等
* 企业级微服务治理能力
    * 国内共有云厂商支持的事实标准服务框架
    * 多年企业实践经验考验，参考[用户实践案例](../../../users)
    
### Dubbo 基本工作流程

![dubbo-rpc](/imgs/v3/concepts/rpc.png)

Dubbo 首先是一款 RPC 框架，它定义了自己的 RPC 通信协议与编程方式。如上图所示，用户在使用 Dubbo 时首先需要定义好 Dubbo 服务；其次，是在将 Dubbo 服务部署上线之后，依赖 Dubbo 的应用层通信协议实现数据交换，Dubbo 所传输的数据都要经过序列化，而这里的序列化协议是完全可扩展的。
使用 Dubbo 的第一步就是定义 Dubbo 服务，服务在 Dubbo 中的定义就是完成业务功能的一组方法的集合，可以选择使用与某种语言绑定的方式定义，如在 Java 中 Dubbo 服务就是有一组方法的 Interface 接口，也可以使用语言中立的 Protobuf Buffers  [IDL 定义服务](../../tasks/idl)。定义好服务之后，服务端（Provider）需要提供服务的具体实现，并将其声明为 Dubbo 服务，而站在服务消费方（Consumer）的视角，通过调用 Dubbo 框架提供的 API 可以获得一个服务代理（stub）对象，然后就可以像使用本地服务一样对服务方法发起调用了。
在消费端对服务方法发起调用后，Dubbo 框架负责将请求发送到部署在远端机器上的服务提供方，提供方收到请求后会调用服务的实现类，之后将处理结果返回给消费端，这样就完成了一次完整的服务调用。如图中的 Request、Response 数据流程所示。
>需要注意的是，在 Dubbo 中，我们提到服务时，通常是指 RPC 粒度的、提供某个具体业务增删改功能的接口或方法，与一些微服务概念书籍中泛指的服务并不是一个概念。

在分布式系统中，尤其是随着微服务架构的发展，应用的部署、发布、扩缩容变得极为频繁，作为 RPC 消费方，如何定动态的发现服务提供方地址成为 RPC 通信的前置条件。Dubbo 提供了自动的地址发现机制，用于应对分布式场景下机器实例动态迁移的问题。如下图所示，通过引入注册中心来协调提供方与消费方的地址，提供者启动之后向注册中心注册自身地址，消费方通过拉取或订阅注册中心特定节点，动态的感知提供方地址列表的变化。

![arch-service-discovery](/imgs/architecture.png)

### Dubbo 核心特性

#### 高性能 RPC 通信协议
跨进程或主机的服务通信是 Dubbo 的一项基本能力，Dubbo RPC 以预先定义好的协议编码方式将请求数据（Request）发送给后端服务，并接收服务端返回的计算结果（Response）。RPC 通信对用户来说是完全透明的，使用者无需关心请求是如何发出去的、发到了哪里，每次调用只需要拿到正确的调用结果就行。除了同步模式的 Request-Response 通信模型外，Dubbo3 还提供更丰富的通信模型选择：
* 消费端异步请求(Client Side Asynchronous Request-Response)
* 提供端异步执行（Server Side Asynchronous Request-Response）
* 消费端请求流（Request Streaming）
* 提供端响应流（Response Streaming）
* 双向流式通信（Bidirectional Streaming）

具体可参见各语言 SKDK 实现的可选协议列表 或 [Triple协议](../../whatsnew/triple)

#### 自动服务（地址）发现
Dubbo 的服务发现机制，让微服务组件之间可以独立演进并任意部署，消费端可以在无需感知对端部署位置与 IP 地址的情况下完成通信。Dubbo 提供的是 Client-Based 的服务发现机制，使用者可以有多种方式启用服务发现：
* 使用独立的注册中心组件，如 [Nacos](https://nacos.io/)、Zookeeper、Consul、Etcd 等。
* 将服务的组织与注册交给底层容器平台，如 Kubernetes，这被理解是一种更云原生的使用方式

#### 运行态流量管控
透明地址发现让 Dubbo 请求可以被发送到任意 IP 实例上，这个过程中流量被随机分配。当需要对流量进行更丰富、更细粒度的管控时，就可以用到 Dubbo 的流量管控策略，Dubbo 提供了包括负载均衡、流量路由、请求超时、流量降级、重试等策略，基于这些基础能力可以轻松的实现更多场景化的路由方案，包括金丝雀发布、A/B测试、权重路由、同区域优先等，更酷的是，Dubbo 支持流控策略在运行态动态生效，无需重新部署。具体可参见：
* [流量治理示例](../../tasks/traffic-management)

#### 丰富的扩展组件及生态
Dubbo 强大的服务治理能力不仅体现在核心框架上，还包括其优秀的扩展能力以及周边配套设施的支持。通过 Filter、Router、Protocol 等几乎存在于每一个关键流程上的扩展点定义，我们可以丰富 Dubbo 的功能或实现与其他微服务配套系统的对接，包括 Transaction、Tracing 目前都有通过 SPI 扩展的实现方案，具体可以参见 Dubbo 扩展性的详情，也可以在 [apache/dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions) 项目中发现与更多的扩展实现。具体可参见：
* [Dubbo 生态](../../what/ecosystem)
* [Dubbo 可扩展性设计](../../what/extensibility)

#### 面向云原生设计

Dubbo 从设计上是完全遵循云原生微服务开发理念的，这体现在多个方面，首先是对云原生基础设施与部署架构的支持，包括 容器、Kubernetes 等，Dubbo Mesh 总体解决方案也在 3.1 版本正式发布；另一方面，Dubbo 众多核心组件都已面向云原生升级，包括 Triple 协议、统一路由规则、对多语言的支持。

值得一提的是，如何使用 Dubbo 支持弹性伸缩的服务如 Serverless 也在未来计划之中，这包括利用 Native Image 提高 Dubbo 的启动速度与资源消耗等。

结合当前版本，本节主要从以下两点展开 Dubbo 的云原生特性
* [容器调度平台（Kubernetes）](../../tasks/deploy-on-k8s)
* [Dubbo Mesh](../../whatsnew/mesh)

##### Kubernetes
Dubbo 微服务要支持 Kubernetes 平台调度，最基础的就是实现 dubbo 服务生命周期与容器生命周期的对齐，这包括 Dubbo 的启动、销毁、服务注册等生命周期事件。相比于以往 Dubbo 自行定义生命周期事件，并要求开发人员在运维实践过程中遵守约定，Kubernetes 底层基础设施定义了严格的组件生命周期事件(probe)，转而要求 Dubbo 去按约定适配。

Kubernetes Service 是另一个层面的适配，这体现了服务定义与注册向云原生底层基础设施下沉的趋势。在这种模式下，用户不再需要搭建额外的注册中心组件，Dubbo 消费端节点能自动对接到 Kubernetes（API-Server 或 DNS），根据服务名（Kubernetes Service Name） 查询到实例列表（Kubernetes endpoints）。 此时服务是通过标准的 Kubernetes Service API 定义，并被调度到各个节点。

##### Dubbo Mesh

Service Mesh 在业界得到了广泛的传播与认可，并被认为是下一代的微服务架构，这主要是因为它解决了很多棘手的问题，包括透明升级、多语言、依赖冲突、流量治理等。Service Mesh 的典型架构是通过部署独立的 Sidecar 组件来拦截所有的出口与入口流量，并在 Sidecar 中集成丰富的流量治理策略如负载均衡、路由等，除此之外，Service Mesh 还需要一个控制面（Control Panel）来实现对 Sidecar 流量的管控，即各种策略下发。我们在这里称这种架构为经典 Mesh。

然而任何技术架构都不是完美的，经典 Mesh 在实施层面也面临成本过高的问题
1. 需要运维控制面（Control Panel）
2. 需要运维 Sidecar
3. 需要考虑如何从原有 SDK 迁移到 Sidecar
4. 需要考虑引入 Sidecar 后整个链路的性能损耗

为了解决 Sidecar 引入的相关成本问题，Dubbo 引入并实现了全新的 Proxyless Mesh 架构，顾名思义，Proxyless Mesh 就是指没有 Sidecar 的部署，转而由 Dubbo SDK 直接与控制面交互，其架构图如下

![dubbo-proxyless](/imgs/v3/mesh/dubbo-proxyless.png)

可以设想，在不同的组织、不同的发展阶段，未来以 Dubbo 构建的微服务将会允许有三种部署架构：传统 SDK、基于 Sidecar 的 Service Mesh、脱离 Sidecar 的 Proxyless Mesh。基于 Sidecar 的 Service Mesh，即经典的 Mesh 架构，独立的 sidecar 运行时接管所有的流量，脱离 Sidecar 的 Proxyless Mesh，富 SDK 直接通过 xDS 与控制面通信。Dubbo 微服务允许部署在物理机、容器、Kubernetes 平台之上，能做到以 Admin 为控制面，以统一的流量治理规则进行治理。


