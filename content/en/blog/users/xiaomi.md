---
date: 2023-01-15
title: "小米与 Dubbo 社区的合作"
linkTitle: "小米"
tags: ["用户案例"]
weight: 4
---

小米一直在积极拥抱开源社区并提交贡献，参与Dubbo3建设发布以来，在内部业务也积极推进升级工作，目前实例数已经升级到了一定的比例 。升级过程总体平稳，稳定性指标正常，性能提升明显，率先升级完成的应用更早拥有了mesh化的条件。从升级后的数据表现来看，Dubbo3改变以往接口粒度的注册发现方式为应用粒度的注册发现方式，这样带来了注册中心存储和运行的更稳定，降低运维成本；使用protobuf协议进行序列化与反序列化，性能和字节大小均提升数量级；完全兼容gprc，给小米这样多言语并存的服务环境带来了极大便利。

Xiaomi is devoted to making continuous contribution to the open source community. Since the introduction of Dubbo3,  internal projects are rapidly upgrading to the latest version of Dubbo. Currently, At present the numbers of instances has been upgrade to a certain proportion. Not only performance improvements have been seen, but services are also running smoothly with improvements in availability. Statistics provide proof that Dubbo’s switch from api-level discovery to application-level discovery has improved the availability and reliability of service discovery, which leads to lower operations cost. In addition, using ProtoBuf for serialization and deserialization has reduced data exchange size. Lastly, full compatibility with grpc provides convenience to Xiaomi’s multi-language development environment.

Dubbo3 基于 Dubbo2 演进而来，Dubbo3 在云原生基础设施适配、服务注册发现、面向下一代协议设计等几大方向上进行了全面升级。并且往 3.0 版本的升级过程将会是完全透明的，用户无需做任何业务改造，就可以直接升级到 Dubbo 3.0。
下面从云原生适配、全新服务发现模型、通信协议、升级兼容四个方面详细介绍。

Having evolved from Dubbo2, Dubbo3 is a major upgrade in several areas including, Cloud Native adaptation, service discovery, communication protocols. Furthermore, upgrading to version 3.0 requires no changes in application code. The following is a detailed introduction to Dubbo3’s features.

### 云原生适配  Cloud Native Adaptation
Dubbo3从理念到设计再到实现最大的变革之一在于全面遵循云原生环境，做到了面向未来，为了达到这个目标dubbo本身做了相当重要的取舍。
在“取”这个层面，Dubbo3众多核心组件已经面向云原生升级，支持 Kubernetes 平台调度，实现了服务生命周期与容器生命周期的对齐，Serverless、Native Image等机制都在计划之中。

在“舍”这个层面，Dubbo3割舍了以往要求开发人员遵守并熟知的Dubbo启动、销毁、注册等生命周期事件，Dubbo3自身设配了Kubernetes基础设施定义的生命周期事件(probe)，并且将服务的定义与注册下沉到了Kubernetes Service，重新划定了dubbo和k8s基础设施的边界。

To be future proof, the design and development of Dubbo3 has fully adapted Cloud Native. To meet this goal, Dubbo has made some trade-offs.Several core components of Dubbo3 support Kubernetes. In particular, Dubbo3 implements Kubernetes service and container life-cycle. Serverless and native image support will be release in the future.

To support Kubernetes, Dubbo3 places service registration and discovery down to the Kubernetes Service layer, thus reestablishing the boundary between Dubbo and Kubernetes. However, this requires deprecating Dubbo’s own service discovery events.

### 全新服务发现模型  New Service Discovery Model
Dubbo以往版本与Spring Cloud、gRPC等同属主流的服务框架进行服务发现的粒度不一致，Dubbo选择了基于更细粒度的接口来进行服务发现，Dubbo3.x进行了服务发现机制的对齐，即以应用粒度来进行服务发现，应用粒度的机制也带来了几点好处：

1. 打通与其他异构微服务体系的地址互发现障碍，这一点对于小米这样的多语种多框架并存的技术组织非常重要。
2. 提升了 Dubbo3 在大规模集群实践中的性能与稳定性。新模型可大幅提高系统资源利用率，降低 Dubbo 地址的单机内存消耗近一半，降低注册中心集群的存储与推送压力一半以上， Dubbo 可支持集群规模步入百万实例层次。

Previous versions of Dubbo differs from other mainstream service discovery middle-ware such as Spring Cloud and gRPC in its service discovery granularity. In the past Dubbo discovers services at the API level. Dubbo3, however, utilizes application level service discovery. This provides the following benefits.

1. Eliminates incompatibility issues with other service discovery platforms, which is crucial since Xiaomi has diverse languages and development frameworks.
2. The new service discovery model improves resource utilization, lowers Dubbo address’s single machine memory usage, lowers service discover cluster’s load.

### 全新RPC 通信协议  New RPC Communication Protocal
定义了全新的 RPC 通信协议 – Triple，它是基于 HTTP/2 上构建的 RPC 协议。 使用 Triple 协议，用户将获得以下能力：

1. 完全兼容gRPC，能够更友好的支持跨语言跨框架的微服务进行互通。
2. 支持Protobuf进行序列化与反序列化，性能和字节大小均提升数量级。

Introduction of a new RPC communication protocol based on HTTP/2 called Triple. Using Triple has the following benefits.

1. Complete compatibility with gRPC.
2. Protobuf support for serialization and deserialization.

### 升级与兼容性  Upgrade and Backwards Compatibility
对业务而言，在保证兼容以往版本的前提下进行升级是最核心的问题，在 3.0 版本的设计与开发之初，就定下了兼容老版本 Dubbo 用户（2.5、2.6、2.7）的目标。因此，往 3.0 版本的升级过程将会是完全透明的，用户无需做任何业务改造，升级 3.x 后的框架行为将保持与 2.x 版本完全一致。

但也要注意，透明升级仅仅是通往 3.0 的第一步，因为 “框架行为保持一致” 也就意味着用户将无法体验到 3.0 的新特性。如果要启用 3.0 带来的新特性，用户则需要进行一定的改造，这个过程称为迁移，这是一个按需开启的过程。
因此，对老用户而言，有两条不同的迁移路径：

1. 分两步走，先以兼容模式推动业务升级到 3.0 版本（无需改造），之后在某些时机按需启用新特性（按需改造）；
2. 升级与迁移同步完成，在业务升级到 3.0 版本的同时，完成改造并启用新特性；

第一种方式更安全，第二种方式更彻底，业务可根据自身的情况来进行评判选择。

For production systems, upgrading a dependency while maintaining backward compatibility is challenging. Supporting users of older versions of Dubbo (2.5, 2.6, 2,7) is a goal of Dubbo3’s design and development. Thus, upgrading to Dubbo3 is painless. No changes are required to be made to existing production systems. However to use Dubbo3’s new features, additional changes are needed to existing code. Thus, there are two suggested upgrade paths.

1. Upgrade to Dubbo3 but do not use Dubbo3’s new features. This path requires no code changes.
2. Upgrade to Dubbo3 while making additional changes to support the new features.

### 建议
1. dubbo3已经和云原生做了深度适配，建议后续能够和istio等service mesh框架进行更多的衔接打通，方便dubbo用户更简单的走向mesh化之路；
2. 建议在调用方和服务方调用链路上增加更多的可选可观测点；

Suggestions
1. Since Dubbo3 is closely compatible with Cloud Native, further work can be done to enhance Dubbo’s support of istio and other service mesh frameworks to speed up Dubbo users’ adaption of service mesh.
2. Add more performance metrics to monitor Dubbo consumers and providers.

### 作者
* 张志勇
* 张平
* 许铮

