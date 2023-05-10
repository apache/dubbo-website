---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config-center/nacos/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config-center/nacos/
    - /zh-cn/overview/what/ecosystem/config-center/nacos/
description: Nacos 配置中心的基本使用和工作原理。
linkTitle: Nacos
title: Nacos
type: docs
weight: 3
---

## 1 前置条件
* 了解 [Dubbo 基本开发步骤](../../../quick-start/spring-boot/)
* 安装并启动 [Nacos](https://nacos.io/zh-cn/docs/quick-start.html)
> 当Dubbo使用`3.0.0`及以上版本时，需要使用Nacos `2.0.0`及以上版本。

## 2 使用说明

### 2.1 增加 Maven 依赖
如果项目已经启用 Nacos 作为注册中心，则无需增加任何额外配置。

如果未启用 Nacos 注册中心，则请参考 [为注册中心增加 Nacos 依赖](../../registry/nacos/#21-增加依赖)。

### 2.2 启用 Nacos 配置中心
```xml
<dubbo:config-center address="nacos://127.0.0.1:8848"/>
```

或者

```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:8848
```

或者

```properties
dubbo.config-center.address=nacos://127.0.0.1:8848
```

或者

```java
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("nacos://127.0.0.1:8848");
```

`address` 格式请参考 [Nacos 注册中心 - 启用配置](../../registry/nacos/#22-配置并启用-nacos)

## 3 高级配置
如要开启认证鉴权，请参考 [Nacos 注册中心 - 启用认证鉴权](../../registry/nacos/#31-认证)

### 3.1 外部化配置
#### 3.1.1 全局外部化配置
**1. 应用开启 config-center 配置**
```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:2181
    config-file: dubbo.properties # optional
```
`config-file` - 全局外部化配置文件 key 值，默认 `dubbo.properties`。`config-file` 代表将 Dubbo 配置文件存储在远端注册中心时，文件在配置中心对应的 key 值，通常不建议修改此配置项。

**2. Nacos Server 增加配置**

![nacos-configcenter-global-properties.png](/imgs/user/nacos-configcenter-global-properties.png)

dataId 是 `dubbo.properties`，group 分组与 config-center 保持一致，如未设置则默认填 `dubbo`。

#### 3.1.2 应用特有外部化配置

**1. 应用开启 config-center 配置**
```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:2181
    app-config-file: dubbo.properties # optional
```

`app-config-file` - 当前应用特有的外部化配置文件 key 值，如 `app-name-dubbo.properties`，仅在需要覆盖全局外部化配置文件 `config-file` 时才配置。

**2. Nacos Server 增加配置**

![nacos-configcenter-application-properties.png](/imgs/user/nacos-configcenter-application-properties.png)

dataId 是 `dubbo.properties`，group 分组设置为应用名即 `demo-provider`。

### 3.2 设置 group 与 namespace
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    group: dubbo-cluster1
    namespace: dev1
```

对配置中心而言，`group` 与 `namespace` 应该是全公司（集群）统一的，应该避免不同应用使用不同的值。

### 3.3 Nacos 扩展配置
更多 Nacos sdk/server 支持的参数配置请参见 [Nacos 注册中心 - 更多配置](../../registry/nacos/#35-更多配置)

## 4 流量治理规则
对 Nacos 而言，所有流量治理规则和外部化配置都应该是全局可见的，因此相同逻辑集群内的应用都必须使用相同的 namespace 与 group。其中，namespace 的默认值是 `public`，group 默认值是 `dubbo`，应用不得擅自修改 namespace 与 group，除非能保持全局一致。

流量治理规则的增删改建议通过 dubbo-admin 完成，更多内容可查看 Dubbo 支持的流量治理能力。

![nacos-configcenter-governance.jpg](/imgs/user/nacos-configcenter-governance.png)

流量治理规则有多种类型，不同类型的规则 dataId 的后缀是不同的：

- configurators [覆盖规则](/zh-cn/overview/core-features/traffic/configuration-rule/)
- tag-router [标签路由](/zh-cn/overview/core-features/traffic/tag-rule/) 与 condition-router [条件路由](/zh-cn/overview/core-features/traffic/condition-rule/)