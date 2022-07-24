---
type: docs
title: "What's New in Dubbo3"
linkTitle: "新版本特性速览"
weight: 2
description: "Dubbo3 相比 2.7 版本进行了全面的升级，以下是新增的一些核心特性"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/overview/whatsnew/)。
{{% /pageinfo %}}

## 全新服务发现模型
相比于 2.x 版本中的基于`接口`粒度的服务发现机制，3.x 引入了全新的[基于应用粒度的服务发现机制](../concepts/service-discovery)，
新模型带来两方面的巨大优势：
* 进一步提升了 Dubbo3 在大规模集群实践中的性能与稳定性。新模型可大幅提高系统资源利用率，降低 Dubbo 地址的单机内存消耗（50%），降低注册中心集群的存储与推送压力（90%），
Dubbo 可支持集群规模步入百万实例层次。
* 打通与其他异构微服务体系的地址互发现障碍。新模型使得 Dubbo3 能实现与异构微服务体系如Spring Cloud、Kubernetes Service、gRPC 等，在地址发现层面的互通，
为连通 Dubbo 与其他微服务体系提供可行方案。

在 Dubbo3 前期版本将会同时提供对两套地址发现模型的支持，以最大程度保证业务升级的兼容性。

## 下一代 RPC 通信协议
定义了全新的 RPC 通信协议 -- Triple，一句话概括 Triple：它是基于 HTTP/2 上构建的 RPC 协议，完全兼容 gRPC，并在此基础上扩展出了更丰富的语义。
使用 Triple 协议，用户将获得以下能力  
* 更容易到适配网关、Mesh架构，Triple 协议让 Dubbo 更方便的与各种网关、Sidecar 组件配合工作。
* 多语言友好，推荐配合 Protobuf 使用 Triple 协议，使用 IDL 定义服务，使用 Protobuf 编码业务数据。
* 流式通信支持。Triple 协议支持 Request Stream、Response Stream、Bi-direction Stream

## 云原生
Dubbo3 构建的业务应用可直接部署在 VM、Container、Kubernetes 等平台，Dubbo3 很好的解决了 Dubbo 服务与调度平台之间的生命周期对齐，Dubbo 服务发现地址
与容器平台绑定的问题。

在服务发现层面，Dubbo3 支持与 [Kubernetes Native Service]() 的融合，目前限于 Headless Service。

Dubbo3 规划了两种形态的 Service Mesh 方案，在不同的业务场景、不同的迁移阶段、不同的基础设施保障情况下，Dubbo 都会有 Mesh 方案可供选择，
而这进一步的都可以通过统一的控制面进行治理。
* 经典的基于 Sidecar 的 Service Mesh
* 无 Sidecar 的 Proxyless Mesh

用户在 Dubbo2 中熟知的路由规则，在 3.x 中将被一套[`统一的流量治理规则`](../concepts/traffic-management)取代，这套统一流量规则将覆盖未来 Dubbo3 的 Service Mesh、SDK 等多种部署形态，
实现对整套微服务体系的治理。

## 扩展点分离
Dubbo3 的 maven 也发生了一些变化，`org.apache.dubbo:dubbo:3.0.0` 将不再是包含所有资源的 all-in-one 包，一些可选的依赖已经作为独立组件单独发布，
因此如果用户使用了不在 `dubbo` 核心依赖包中的独立组件，如 registry-etcd、rpc-hessian 等，需要为这些组件在 pom.xml 中单独增加依赖包。

Zookeeper 扩展实现仍在核心依赖包中，依赖保持不变
```xml
<properties>
    <dubbo.version>3.0.0</dubbo.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper</artifactId>
        <version>${dubbo.version}</version>
        <type>pom</type>
    </dependency>
</dependencies>
```

Redis 扩展实现已经不在核心依赖包中，如启用了 Redis 相关功能，需单独增加依赖包
```xml
<properties>
    <dubbo.version>3.0.0</dubbo.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper</artifactId>
        <version>${dubbo.version}</version>
        <type>pom</type>
    </dependency>

    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-registry-redis</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
</dependencies>
```

> 详情请参见扩展点实现列表

## 服务柔性
> 尚未发布

Dubbo3.0 的柔性增强以面向失败设计为理念，提供包括精准容量评估、自适应限流、自适应负载均衡的支持，自底向上的分步构建大规模可靠应用。
从单一服务的视角看，服务是压不垮的，稳定的。从分布式视角看，复杂的拓扑不会带来性能的下降，分布式负载均衡能够以最优的方式动态分配流量，保证异构系统能够根据运行时的准确服务容量合理分配请求，从而达到性能最优。

## 全面的性能提升

对比 2.x 版本，Dubbo3 版本

- 服务发现资源利用率显著提升。
  - 对比接口级服务发现，单机常驻内存下降  50%，地址变更期 GC 消耗下降一个数量级 (百次 -> 十次)
  - 对比应用级服务发现，单机常驻内存下降 75%，GC 次数趋零
- Dubbo 协议性能持平，Triple 协议在网关、Stream吞吐量方面更具优势。
  - Dubbo协议 （3.0 vs 2.x），3.0 实现较 2.x 总体 qps rt 持平，略有提升
  - Triple协议 vs Dubbo协议，直连调用场景 Triple 性能并无优势，其优势在网关、Stream调用场景。

详情请参考[Benchmark](../performance/benchmarking)

## Native Image
详情请参考[使用 GraavlVM 构建 Dubbo Native Image](../references/graalvm/support-graalvm)
