---
type: docs
title: "Zookeeper"
linkTitle: "Zookeeper"
weight: 2
description: "Zookeeper 配置中心的基本使用和工作原理。"
---

## 1 前置条件
* 了解 [Dubbo 基本开发步骤](../../../quick-start/spring-boot/)
* 安装并启动 [Zookeeper](https://zookeeper.apache.org/)

## 2 使用说明
在此查看[完整示例代码](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-configcenter/dubbo-samples-configcenter-annotation)

### 2.1 增加 Maven 依赖
如果项目已经启用 Zookeeper 作为注册中心，则无需增加任何额外配置。

如果未使用 Zookeeper 注册中心，则请参考 [为注册中心增加 Zookeeper 相关依赖](../../registry/zookeeper/#21-增加-maven-依赖)。

### 2.2 启用 Zookeeper 配置中心
```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

或者

```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
```

或者

```properties
dubbo.config-center.address=zookeeper://127.0.0.1:2181
```

或者

```java
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("zookeeper://127.0.0.1:2181");
```

`address` 格式请参考 [zookeeper 注册中心 - 启用配置](../../registry/zookeeper/#22-配置并启用-zookeeper)

## 3 高级配置
如要开启认证鉴权，请参考 [zookeeper 注册中心 - 启用认证鉴权](../../registry/zookeeper/#31-认证与鉴权)

### 3.1 外部化配置
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    config-file: dubbo.properties
```

`config-file` - 外部化配置文件 key 值，默认 `dubbo.properties`。`config-file` 代表将 Dubbo 配置文件存储在远端注册中心时，文件在配置中心对应的 key 值，通常不建议修改此配置项。

### 3.1 设置 group 与 namespace
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    group: dubbo-cluster1
    namespace: dev1
```

对配置中心而言，`group` 与 `namespace` 应该是全公司（集群）统一的，应该避免不同应用使用不同的值。

## 4 工作原理

### 4.1 外部化配置
外部化配置的存储结构如下图所示

![zk-configcenter.jpg](/imgs/user/zk-configcenter.jpg)

- namespace，用于不同配置的环境隔离。
- config，Dubbo约定的固定节点，不可更改，所有配置和流量治理规则都存储在此节点下。
- dubbo 与 application，分别用来隔离全局配置、应用级别配置：dubbo 是默认 group 值，application 对应应用名
- dubbo.properties，此节点的node value存储具体配置内容

### 4.2 流量治理规则
所有流量治理规则默认都存储在 `/dubbo/config` 节点下，具体节点结构图如下：

![zk-configcenter-governance](/imgs/user/zk-configcenter-governance.jpg)

- namespace，用于不同配置的环境隔离。
- config，Dubbo 约定的固定节点，不可更改，所有配置和流量治理规则都存储在此节点下。
- dubbo，所有服务治理规则都是全局性的，dubbo 为默认节点
- configurators/tag-router/condition-router/migration，不同的服务治理规则类型，node value 存储具体规则内容