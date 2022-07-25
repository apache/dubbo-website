---
type: docs
title: "应用级服务发现"
linkTitle: "应用级服务发现"
weight: 3
---

在这里查看更多文档
* [应用级服务发现详细设计](https://github.com/apache/dubbo-awesome/blob/master/proposals/D1-application-level-service-discovery.md)
* [应用级服务发现解读 (blog)](https://dubbo.apache.org/zh/blog/2021/06/02/dubbo3-%E5%BA%94%E7%94%A8%E7%BA%A7%E6%9C%8D%E5%8A%A1%E5%8F%91%E7%8E%B0/)
* [如何从接口级服务发现迁移到应用级服务发现](../../../docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery)
* [饿了么应用级服务发现实践](../../../users/eleme)
* [工商银行应用级服务发现实践](../../../users/icbc)

概括来说，Dubbo3 引入的应用级服务发现主要有以下优势
* 适配云原生微服务变革。云原生时代的基础设施能力不断向上释放，像 Kubernetes 等平台都集成了微服务概念抽象，Dubbo3 的应用级服务发现是适配各种微服务体系的通用模型。
* 提升性能与可伸缩性。支持超大规模集群的服务治理一直以来都是 Dubbo 的优势，通过引入应用级服务发现模型，从本质上解决了注册中心地址数据的存储与推送压力，相应的 Consumer 侧的地址计算压力也成数量级下降；集群规模也开始变得可预测、可评估（与 RPC 接口数量无关，只与实例部署规模相关）。

下图是 Dubbo2 的服务发现模型：Provider 注册服务地址，Consumer 经过注册中心协调并发现服务地址，进而对地址发起通信，这是被绝大多数微服务框架的经典服务发现流程。而 Dubbo2 的特殊之处在于，它把 “RPC 接口”的信息也融合在了地址发现过程中，而这部分信息往往是和具体的业务定义密切相关的。

![//imgs/v3/concepts/servicediscovery_old.png](/imgs/v3/concepts/servicediscovery_old.png)

而在接入云原生基础设施后，基础设施融入了微服务概念的抽象，容器化微服务被编排、调度的过程即完成了在基础设施层面的注册。如下图所示，基础设施既承担了注册中心的职责，又完成了服务注册的动作，而 “RPC 接口”这部分信息，由于与具体的业务相关，不可能也不适合被基础设施托管。

![//imgs/v3/concepts/servicediscovery_k8s.png](/imgs/v3/concepts/servicediscovery_k8s.png)

在这样的场景下，对 Dubbo3 的服务注册发现机制提出了两个要求：
Dubbo3 需要在原有服务发现流程中抽象出通用的、与业务逻辑无关的地址映射模型，并确保这部分模型足够合理，以支持将地址的注册行为和存储委托给下层基础设施
Dubbo3 特有的业务接口同步机制，是 Dubbo3 需要保留的优势，需要在 Dubbo3 中定义的新地址模型之上，通过框架内的自有机制予以解决。

这样设计的全新的服务发现模型，在架构兼容性、可伸缩性上都给 Dubbo3 带来了更大的优势。

![//imgs/v3/concepts/servicediscovery_mem.png](/imgs/v3/concepts/servicediscovery_mem.png)

在架构兼容性上，如上文所述，Dubbo3 复用下层基础设施的服务抽象能力成为了可能；另一方面，如 Spring Cloud 等业界其它微服务解决方案也沿用这种模型，
在打通了地址发现之后，使得用户探索用 Dubbo 连接异构的微服务体系成为了一种可能。

Dubbo3 服务发现模型更适合构建可伸缩的服务体系，这点要如何理解？
这里先举个简单的例子，来直观的对比 Dubbo2 与 Dubbo3 在地址发现流程上的数据流量变化：假设一个微服务应用定义了 100 个接口（Dubbo 中的服务），
则需要往注册中心中注册 100 个服务，如果这个应用被部署在了 100 台机器上，那这 100 个服务总共会产生 100 * 100 = 10000 个虚拟节点；而同样的应用，
对于 Dubbo3 来说，新的注册发现模型只需要 1 个服务（只和应用有关和接口无关）， 只注册和机器实例数相等的 1 * 100 = 100 个虚拟节点到注册中心。
在这个简单的示例中，Dubbo 所注册的地址数量下降到了原来的 1 / 100，对于注册中心、订阅方的存储压力都是一个极大的释放。更重要的是，
地址发现容量彻底与业务 RPC 定义解耦开来，整个集群的容量评估对运维来说将变得更加透明：部署多少台机器就会有多大负载，不会像 Dubbo2 一样，
因为业务 RPC 重构就会影响到整个集群服务发现的稳定性。


