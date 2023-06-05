---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/registry/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/registry/overview/
description: ""
linkTitle: 注册中心概述
title: 注册中心概述
type: docs
weight: 1
---


注册中心是 Dubbo 服务治理的核心组件，Dubbo 依赖注册中心的协调实现服务（地址）发现，自动化的服务发现是微服务实现动态扩缩容、负载均衡、、流量治理的基础。Dubbo 的服务发现机制经历了 Dubbo2 时代的接口级服务发现、Dubbo3 时代的应用级服务发现，具体可参见 [服务发现机制](/zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/) 解析了解具体演进过程。

## 基本使用
开发应用时必须指定 Dubbo 注册中心（registry）组件，配置很简单，只需指定注册中心的集群地址即可：

以 Spring Boot 开发为例，在 application.yml 增加 registry 配置项目

```yaml
dubbo
 registry
  address: {protocol}://{cluster-address}
```
其中，protocol 为选择的配置中心类型，cluster-address 为访问注册中心的集群地址，如

`address: nacos://localhost:8848`

如需集群格式地址可使用 backup 参数

`address: nacos://localhost:8848?backup=localshot:8846,localshot:8847`

> 应用必须指定 Dubbo 注册中心，即使不启用注册中心也要配置（可通过设置地址为空 address='N/A' ）。

除了 其余根据每个配置中心的不同，可以参考 [registry 配置参考手册](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#registry)或通过 parameters 参数进行扩展。

## 配置中心与元数据中心
配置中心、元数据中心是实现 Dubbo 高阶服务治理能力的基础组件，相比于注册中心通常这两个组件的配置是可选的。

为了兼容 2.6 及老版本的配置，对于部分注册中心类型（如 Zookeeper、Nacos 等），Dubbo 会同时将其用作元数据中心和配置中心。

```yaml
dubbo
 registry
  address: nacos://localhost:8848
```

框架解析后的默认行为

```yaml
dubbo
 registry
  address: nacos://localhost:8848
 config-center
  address: nacos://localhost:8848
 metadata-report
  address: nacos://localhost:8848
```

可以通过以下两个参数来调整或控制默认行为

```yaml
dubbo
 registry
  address: nacos://localhost:8848
  use-as-config-center: false
  use-as-metadata-report: false
```

## 注册中心生态
Dubbo 主干目前支持的主流注册中心实现包括
* Zookeeper
* Nacos
* Redis

同时也支持 Kubernetes、Mesh 体系的服务发现。

另外，[Dubbo 扩展生态](https://github.com/apache/dubbo-spi-extensions) 还提供了 Consul、Eureka、Etcd 等注册中心扩展实现。也欢迎通过 [registry spi 扩展](../../spi/) 贡献更多的注册中心实现到 Dubbo 生态。

Dubbo 还支持在一个应用中 [指定多个注册中心](../multiple-registry/)，并将服务根据注册中心分组，这样做使得服务分组管理或服务迁移变得更容易。