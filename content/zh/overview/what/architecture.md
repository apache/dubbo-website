---
type: docs
title: "概念与架构"
linkTitle: "概念与架构"
weight: 2
---
## RPC 通信
Dubbo3 的 Triple 协议构建在 HTTP/2 协议之上，因此具有更好的穿透性与通用性，Triple 协议兼容 gRPC，提供 Request Response、Request Streaming、Response Streaming、Bi-directional Streaming 等通信模型；从 Triple 协议开始，Dubbo 还支持基于 IDL 的服务定义。

此外，Dubbo 还集成了业界主流的大部分协议，使得用户可以在 Dubbo 框架范围内使用这些通信协议，为用户提供了统一的编程模型与服务治理模型，这些协议包括 rest、hessian2、jsonrpc、thrift 等，注意不同语言 SDK 实现支持的范围会有一些差异。

具体可查看
* [Triple 速览](../../whatsnew/triple)
* [Specification](https://github.com/apache/dubbo-awesome/blob/master/proposals/D0-triple.md)

## 服务发现
服务发现，即消费端自动发现服务地址列表的能力，是微服务框架需要具备的关键能力，借助于自动化的服务发现，微服务之间可以在无需感知对端部署位置与 IP 地址的情况下实现通信。

实现服务发现的方式有很多种，Dubbo 提供的是一种 Client-Based 的服务发现机制，通常还需要部署额外的第三方注册中心组件来协调服务发现过程，如常用的 [Nacos](https://nacos.io/)、Consul、Zookeeper 等，Dubbo 自身也提供了对多种注册中心组件的对接，用户可以灵活选择。

Dubbo 基于消费端的自动服务发现能力，其基本工作原理如下图：

![architecture](/imgs/architecture.png)

在传统的部署架构下，服务发现涉及提供者、消费者和注册中心三个参与角色，其中，提供者注册 URL 地址到注册中心，注册中心负责对数据进行聚合，消费者从注册中心订阅 URL 地址更新。
在云原生背景下，比如当应用部署在 Kubernetes 等平台，由于平台自身维护了应用/服务与实例间的映射关系，因此注册中心与注册动作在一定程度上被下沉到了基础设施层，因此框架自身的注册动作有时并不是必须的。

Dubbo3 提供了全新的应用级服务发现模型，该模型在设计与实现上区别于 Dubbo2 的接口级服务发现模型。可在此查看：
* [应用级服务发现](../../whatsnew/service-discovery)

## 流量治理
Dubbo2 开始 Dubbo 就提供了丰富服务治理规则，包括路由规则、动态配置等。

一方面 Dubbo3 正在通过对接 xDS 对接到时下流行的 Mesh 产品如 Istio 中所使用的以 VirtualService、DestinationRule 为代表的治理规则，另一方面 Dubbo 正寻求设计一套自有规则以实现在不通部署场景下的流量治理，以及灵活的治理能力。

* [Dubbo2 服务治理规则](../../tasks/traffic-management)
* Dubbo3 服务治理规则

## Dubbo Mesh
Dubbo Mesh 的目标是提供适应 Dubbo 体系的完整 Mesh 解决方案，包含定制化控制面（Control Plane）、定制化数据面解决方案。Dubbo 控制面基于业界主流 Istio 扩展，支持更丰富的流量治理规则、Dubbo应用级服务发现模型等，Dubbo 数据面可以采用 Envoy Sidecar，即实现 Dubbo SDK + Envoy 的部署方案，也可以采用 Dubbo Proxyless 模式，直接实现 Dubbo 与控制面的通信。Dubbo Mesh 在快速演进中，我们将努力保持文档内容的更新。

![mix-mesh](/imgs/v3/mesh/mix-mesh.png)

在此查看 Dubbo Mesh 设计细节
* [Dubbo Proxy Mesh](https://github.com/apache/dubbo-awesome/blob/master/proposals/D3.1-thinsdk-sidecar-mesh.md)
* [Dubbo Proxyless Mesh](https://github.com/apache/dubbo-awesome/blob/master/proposals/D3.2-proxyless-mesh.md)
* [Dubbo 控制面规划](https://github.com/apache/dubbo-awesome/blob/master/proposals/D3.2-proxyless-mesh.md)

## 部署架构
> 本节侧重描述传统模式下的 Dubbo 部署架构，在云原生背景下的部署架构会有些变化，主要体现在基础设施（Kubernetes、Service Mesh等）会承担更多的职责，
> 中心化组件如注册中心、元据中心、配置中心等的职责被集成、运维变得更加简单，但通过强调这些中心化的组件能让我们更容易理解 Dubbo 的工作原理。

作为一个微服务框架，Dubbo sdk 跟随着微服务组件被部署在分布式集群各个位置，为了在分布式环境下实现各个微服务组件间的协作，
Dubbo 定义了一些中心化组件，这包括：
* 注册中心。协调 Consumer 与 Provider 之间的地址注册与发现
* 配置中心。
    * 存储 Dubbo 启动阶段的全局配置，保证配置的跨环境共享与全局一致性
    * 负责服务治理规则（路由规则、动态配置等）的存储与推送。
* 元数据中心。
    * 接收 Provider 上报的服务接口元数据，为 Admin 等控制台提供运维能力（如服务测试、接口文档等）
    * 作为服务发现机制的补充，提供额外的接口/方法级别配置信息的同步能力，相当于注册中心的额外扩展

![threecenters](/imgs/v3/concepts/threecenters.png)

上图完整的描述了 Dubbo 微服务组件与各个中心的交互过程。

以上三个中心并不是运行 Dubbo 的必要条件，用户完全可以根据自身业务情况决定只启用其中一个或多个，以达到简化部署的目的。通常情况下，所有用户都会以独立的注册中心
以开始 Dubbo 服务开发，而配置中心、元数据中心则会在微服务演进的过程中逐步的按需被引入进来。

### 注册中心

注册中心扮演着非常重要的角色，它承载着服务注册和服务发现的职责。目前Dubbo支持以下两种粒度的服务发现和服务注册，分别是接口级别和应用级别，注册中心可以按需进行部署：

- 在传统的Dubbo SDK使用姿势中，如果仅仅提供直连模式的RPC服务，不需要部署注册中心。
- 无论是接口级别还是应用级别，如果需要Dubbo SDK自身来做服务注册和服务发现，则可以选择部署注册中心，在Dubbo中集成对应的注册中心。

- 在Dubbo + Mesh 的场景下，随着 Dubbo 服务注册能力的弱化，Dubbo内的注册中心也不再是必选项，其职责开始被控制面取代，如果采用了Dubbo + Mesh的部署方式，无论是ThinSDK的mesh方式还是Proxyless的mesh方式，都不再需要独立部署注册中心。

而注册中心并不依赖于配置中心和元数据中心，如下图所示：

![centers-registry](/imgs/v3/concepts/centers-registry.png)

该图中没有部署配置中心和元数据中心，在Dubbo中会默认将注册中心的实例同时作为配置中心和元数据中心，这是Dubbo的默认行为，如果确实不需要配置中心或者元数据中心的能力，可在配置中关闭，在注册中心的配置中有两个配置分别为use-as-config-center和use-as-metadata-center，将配置置为false即可。

### 元数据中心

元数据中心在2.7.x版本开始支持，随着应用级别的服务注册和服务发现在Dubbo中落地，元数据中心也变的越来越重要。在以下几种情况下会需要部署元数据中心：

1. 对于一个原先采用老版本Dubbo搭建的应用服务，在迁移到Dubbo 3时，Dubbo 3 会需要一个元数据中心来维护RPC服务与应用的映射关系（即接口与应用的映射关系），因为如果采用了应用级别的服务发现和服务注册，在注册中心中将采用“应用 ——  实例列表”结构的数据组织形式，不再是以往的“接口 —— 实例列表”结构的数据组织形式，而以往用接口级别的服务注册和服务发现的应用服务在迁移到应用级别时，得不到接口与应用之间的对应关系，从而无法从注册中心得到实例列表信息，所以Dubbo为了兼容这种场景，在Provider端启动时，会往元数据中心存储接口与应用的映射关系。
2. 为了让注册中心更加聚焦与地址的发现和推送能力，减轻注册中心的负担，元数据中心承载了所有的服务元数据、大量接口/方法级别配置信息等，无论是接口粒度还是应用粒度的服务发现和注册，元数据中心都起到了重要的作用。

如果有以上两种需求，都可以选择部署元数据中心，并通过Dubbo的配置来集成该元数据中心。

元数据中心并不依赖于注册中心和配置中心，用户可以自由选择是否集成和部署元数据中心，如下图所示：

![centers-metadata](/imgs/v3/concepts/centers-metadata.png)

该图中不配备配置中心，意味着可以不需要全局管理配置的能力。该图中不配备注册中心，意味着可能采用了Dubbo mesh的方案，也可能不需要进行服务注册，仅仅接收直连模式的服务调用。

### 配置中心

配置中心与其他两大中心不同，它无关于接口级还是应用级，它与接口并没有对应关系，它仅仅与配置数据有关，即使没有部署注册中心和元数据中心，配置中心也能直接被接入到Dubbo应用服务中。在整个部署架构中，整个集群内的实例（无论是Provider还是Consumer）都将会共享该配置中心集群中的配置，如下图所示：
![centers-config](/imgs/v3/concepts/centers-config.png)

该图中不配备注册中心，意味着可能采用了Dubbo mesh的方案，也可能不需要进行服务注册，仅仅接收直连模式的服务调用。

该图中不配备元数据中心，意味着Consumer可以从Provider暴露的MetadataService获取服务元数据，从而实现RPC调用

### 保证三大中心高可用的部署架构

虽然三大中心已不再是Dubbo应用服务所必须的，但是在真实的生产环境中，一旦已经集成并且部署了该三大中心，三大中心还是会面临可用性问题，Dubbo需要支持三大中心的高可用方案。在Dubbo中就支持多注册中心、多元数据中心、多配置中心，来满足同城多活、两地三中心、异地多活等部署架构模式的需求。

Dubbo SDK对三大中心都支持了Multiple模式。

- 多注册中心：Dubbo 支持多注册中心，即一个接口或者一个应用可以被注册到多个注册中心中，比如可以注册到ZK集群和Nacos集群中，Consumer也能够从多个注册中心中进行订阅相关服务的地址信息，从而进行服务发现。通过支持多注册中心的方式来保证其中一个注册中心集群出现不可用时能够切换到另一个注册中心集群，保证能够正常提供服务以及发起服务调用。这也能够满足注册中心在部署上适应各类高可用的部署架构模式。
- 多配置中心：Dubbo支持多配置中心，来保证其中一个配置中心集群出现不可用时能够切换到另一个配置中心集群，保证能够正常从配置中心获取全局的配置、路由规则等信息。这也能够满足配置中心在部署上适应各类高可用的部署架构模式。

- 多元数据中心：Dubbo 支持多元数据中心：用于应对容灾等情况导致某个元数据中心集群不可用，此时可以切换到另一个元数据中心集群，保证元数据中心能够正常提供有关服务元数据的管理能力。

拿注册中心举例，下面是一个多活场景的部署架构示意图：

![multiple-registry-deployment-architecture](/imgs/v3/concepts/multiple-registry-deployment-architecture.png)
