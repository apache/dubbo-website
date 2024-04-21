---
aliases:
    - /zh/overview/core-features/extensibility/
description: 扩展适配
feature:
    description: |
        一切皆可扩展，通过扩展 (Filter、Router、Service Discovery、Configuration 等) 自定义调用、管控行为，适配开源微服务生态。
    title: 可扩展性
linkTitle: 扩展适配
title: 扩展适配
type: docs
weight: 6
---



Dubbo 从设计上是高度可扩展的，通过这些扩展点你可以做到：
* 拦截流量并控制流量行为
* 按需调优 Dubbo 的一些默认策略与实现
* 将 Dubbo 服务适配到公司内部微服务集群或其他主流的开源组件

## 一切皆可扩展

Dubbo 扩展能力使得 Dubbo 项目很方便的切分成一个一个的子模块，实现热插拔特性。用户完全可以基于自身需求，替换 Dubbo 原生实现，来满足自身业务需求。

![Admin 效果图](/imgs/v3/advantages/extensibility.png)

* **协议与编码扩展**。通信协议、序列化编码协议等
* **流量管控扩展**。集群容错策略、路由规则、负载均衡、限流降级、熔断策略等
* **服务治理扩展**。注册中心、配置中心、元数据中心、分布式事务、全链路追踪、监控系统等
* **诊断与调优扩展**。流量统计、线程池策略、日志、QoS 运维命令、健康检查、配置加载等


## 基于扩展点的微服务生态
众多的扩展点与抽象，是 Dubbo 与众多微服务生态组件对接、实现微服务治理能力的基础。

* [全链路追踪](../../tasks/observability/tracing/)
* [数据一致性](../../tasks/ecosystem/transaction/)
* [限流降级](../../core-features/traffic/circuit-breaking/)

Dubbo 的各语言 sdk 实现都是采用的 "微内核+插件" 的设计模式，几乎所有流程中的核心节点都被定义为扩展点，官方发布的组件也是以扩展点的实现形式发布，因此 Dubbo 可以平等的对待所有官方与第三方组件扩展。
* 扩展适配能力是实现 Dubbo 微服务生态的关键，Dubbo 生态组件如全链路追踪、注册中心实现等的适配都是基于 Filter、Registry、DynamicConfiguration 等扩展点实现。
* 扩展适配给用户带来最大的灵活性，开发者可以随时接入公司内部组件、按需定制核心能力等。

![extensibility-echosystem.png](/imgs/v3/feature/extensibility/arc.png)

以上是按架构层次划分的 Dubbo 内的一些核心扩展点定义及实现，从三个层次来展开：
* 协议通信层
* 流量管控层
* 服务治理层

## 协议通信层
在通信协议一节我们强调过，Dubbo 不绑定任何协议，用户可以选择 Triple、gRPC、Dubbo2、REST、自定义协议等任一 RPC 远程通信协议，除此之外，RPC 协议之上的数据编码格式 (即序列化协议) 也是通过扩展点定义，用户可以灵活选择 RPC 与序列化的通信协议组合。

![协议与编码原理图](/imgs/v3/feature/extensibility/protocol.png)

### Protocol
Protocol 扩展点定义对应的是 RPC 协议，利用这个扩展点可以让 Dubbo 作为统一的微服务开发和治理框架，而在下层通信协议上实现灵活切换。官方发布了对大多数主流 RPC 通信协议的适配，你可以通过几条简单的配置直接使用，如果你想使用公司自定义的 RPC 通信协议，请通过 Protocol 提供自定义扩展实现。

### Serialization
Serialization 扩展点定义了序列化协议扩展，Dubbo 官方提供了 Fastjson、Protobuf、Hessian2、Kryo、FST 等序列化协议适配。

## 流量管控层
Dubbo 在服务调用链路上预置了大量扩展点，通过这些扩展点用户可以控制运行态的流量走向、改变运行时调用行为等，包括 Dubbo 内置的一些负载均衡策略、流量路由策略、超时等很多流量管控能力都是通过这类扩展点实现的。

![协议与编码原理图](/imgs/v3/feature/extensibility/traffic.png)

### Filter
Filter 流量拦截器是 Dubbo 服务调用之上的 AOP 设计模式，Filter 用来对每次服务调用做一些预处理、后处理动作，使用 Filter 可以完成访问日志、加解密、流量统计、参数验证等任务，Dubbo 中的很多生态适配如限流降级 Sentinel、全链路追踪 Tracing 等都是通过 Fitler 扩展实现的。一次请求过程中可以植入多个 Filter，Filter 之间相互独立没有依赖。
* 从消费端视角，它在请求发起前基于请求参数等做一些预处理工作，在接收到响应后，对响应结果做一些后置处理；
* 从提供者视角则，在接收到访问请求后，在返回响应结果前做一些预处理，

### Router
Router 路由器是 Dubbo 中流量管控的关键组件，它将符合一定条件的流量转发到特定分组的地址子集，是 Dubbo 流量管控中一些关键能力如按比例流量转发、流量隔离等的基础。每次服务调用请求都会流经一组路由器 (路由链)，每个路由器根据预先设定好的规则、全量地址列表以及当前请求上下文计算出一个地址子集，再传给下一个路由器，重复这一过程直到最后得出一个有效的地址子集。

Dubbo 官方发布版本预置了丰富的流量管控规则与 router 实现，如 [流量管控](../traffic/) 一文中阐述的，用户通过下发规则即可实现各种模式的流量管控。如果有其他流量管控诉求，可以通过提供自定义的 router 扩展实现。

### Load Balance
在 Dubbo 中，Load Balance 负载均衡工作在 router 之后，对于每次服务调用，负载均衡负责在 router 链输出的地址子集中选择一台机器实例进行访问，保证一段时间内的调用都均匀的分布在地址子集的所有机器上。

Dubbo 官方提供了加权随机、加权轮询、一致性哈希、最小活跃度优先、最短响应时间优先等负载均衡策略，还提供了根据集群负载自适应调度的负载均衡算法。

## 服务治理层
以下是 Dubbo 部署的经典架构图，由注册中心 (服务发现)、配置中心和元数据中心构成了整个服务治理的核心。

![服务治理架构图](/imgs/v3/concepts/threecenters.png)

这里我们主要从架构、实现的视角来分析了 Dubbo 服务治理，Dubbo 很多服务治理的核心能力都是通过上图描述的几个关键组件实现的，用户通过控制面或者 Admin 下发的各种规则与配置、各类微服务集群状态的展示等都是直接与注册中心、配置中心和元数据中心交互。

在具体实现或者部署上，注册中心、配置中心和元数据中心可以是同一组件，比如 Zookeeper 可同时作为注册、配置和元数据中心，Nacos 也是如此。因此，三个中心只是从架构职责上的划分，你甚至可以用同一个 Zookeeper 集群来承担所有三个职责，只需要在应用里将他们设置为同一个集群地址就可以了。

> 在云原生部署架构下，随着 Kubernetes、Service Mesh 架构的流行，微服务基础设施呈现下沉趋势，注册、配置和元数据中心的职责正被 Kubernetes、Istio 等组件取代，具体可参见 [服务网格](../service-mesh/) 一节的描述。

### Registry
注册中心是 Dubbo 实现服务发现能力的基础，Dubbo 官方支持 Zookeeper、Nacos、Etcd、Consul、Eureka 等注册中心。

通过对 Consul、Eureka 的支持，Dubbo 也实现了与 Spring Cloud 体系在地址和通信层面的互通，让用户同时部署 Dubbo 与 Spring Cloud，或者从 Spring Cloud 迁移到 Dubbo 变得更容易。

### Config Center
配置中心是用户实现动态控制 Dubbo 行为的关键组件，我们在 [流量管控](../../tasks/traffic-management) 任务中下发的所有规则，都是先下发到配置中心保存起来，进而 Dubbo 实例通过监听配置中心的变化，收到路由规则并达到控制流量的行为。

Dubbo 官方支持 Zookeeper、Nacos、Etcd、Redis、Apollo 等配置中心实现。

### Metadata Center
与配置中心相反，从用户视角来看元数据中心是只读的，元数据中心唯一的写入方是 Dubbo 进程实例，Dubbo 实例会在启动之后将一些内部状态（如服务列表、服务配置、服务定义格式等）上报到元数据中心，供一些治理能力作为数据来源，如服务测试、文档管理、服务状态展示等。

Dubbo 官方支持 Zookeeper、Nacos、Etcd、Redis 等元数据中心实现。

## 自定义扩展示例

以下示例演示了如何扩展 Dubbo 来解决实际问题，可以跟随示例学习。

* [自定义 RPC 协议](../../tasks/extensibility/protocol/)
* [自定义流量路由规则](../../tasks/extensibility/router/)
* [自定义注册中心](../../tasks/extensibility/registry/)
* [自定义拦截器](../../tasks/extensibility/filter/)

## 更多扩展点
本文列出了 Dubbo 常用的一些扩展点，但还有大量的扩展点可供灵活定制，并且不同语言 sdk 的扩展定义和配置方式上也存在差异，以下是 Dubbo SDK 的扩展点手册。

* [Java 扩展点手册](../../mannual/java-sdk/reference-manual/spi/description/)
* [Go 扩展点手册](../../mannual/golang-sdk/preface/design/aop_and_extension/)
