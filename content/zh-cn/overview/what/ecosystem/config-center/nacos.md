---
type: docs
title: "Nacos"
linkTitle: "Nacos"
weight: 20
description: ""
---

## 1 介绍

Nacos /nɑ:kəʊs/ 是 Dynamic Naming and Configuration Service 的首字母简称，一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。

Nacos 致力于帮助您发现、配置和管理微服务。Nacos 提供了一组简单易用的特性集，帮助您快速实现动态服务发现、服务配置、服务元数据及流量管理。

Nacos 帮助您更敏捷和容易地构建、交付和管理微服务平台。 Nacos 是构建以“服务”为中心的现代应用架构 (例如微服务范式、云原生范式) 的服务基础设施。

参考文档：https://nacos.io/zh-cn/docs/v2/what-is-nacos.html


## 2 使用说明 - Java
Dubbo 融合 Nacos 成为元数据中心的操作步骤非常简单，大致分为 `增加 Maven 依赖` 以及 `配置元数据中心` 两步。
> 如果元数据地址(dubbo.metadata-report.address)也不进行配置，会使用注册中心的地址来用作元数据中心。

### 2.1 增加 Maven 依赖

如果项目已经启用 Nacos 作为注册中心，则无需增加任何额外配置。

如果未启用 Nacos 注册中心，则请参考 [为注册中心增加 Nacos 依赖](../../registry/nacos/#21-增加依赖)。
> 当Dubbo使用`3.0.0`及以上版本时，需要使用Nacos `2.0.0`及以上版本

### 2.2 启用 Nacos 配置中心
```xml
<dubbo:config-center address="nacos://127.0.0.1:8848"/>
```

或者

```yaml
dubbo:
  config-center:
    address: nacos://127.0.0.1:8848
```

或者

```properties
dubbo.config-center.address=nacos://127.0.0.1:8848
```

或者

```java
ConfigCenterConfig configCenterConfig = new ConfigCenterConfig();
configCenterConfig.setAddress("nacos://127.0.0.1:8848");
```

`address` 格式请参考 [Nacos 注册中心 - 启用配置](../../registry/nacos/#22-配置并启用-nacos)
