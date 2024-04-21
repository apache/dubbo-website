---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config-center/apollo/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config-center/apollo/
    - /zh-cn/overview/what/ecosystem/config-center/apollo/
description: Apollo 配置中心的基本使用和工作原理。
linkTitle: Apollo
title: Apollo
type: docs
weight: 4
---

## 1 前置条件
* 了解 [Dubbo 基本开发步骤](../../../quick-start/spring-boot/)
* 安装并启动 [Apollo](https://www.apolloconfig.com/#/zh/README)

## 2 使用说明
在此查看[完整示例代码](https://github.com/apache/dubbo-samples/tree/master/3-extensions/configcenter/dubbo-samples-configcenter-apollo)

### 2.1 增加 Maven 依赖

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.0.9</version>
</dependency>
<dependency>
    <groupId>com.ctrip.framework.apollo</groupId>
    <artifactId>apollo-openapi</artifactId>
    <version>2.0.0</version>
</dependency>
<dependency>
    <groupId>com.ctrip.framework.apollo</groupId>
    <artifactId>apollo-client</artifactId>
    <version>2.0.0</version>
</dependency>
```

### 2.2 启用 Apollo 配置中心
```xml
<dubbo:config-center address="apollo://localhost:8080"/>
```

或者

```yaml
dubbo
  config-center
    address: apollo://localhost:8080
```

或者

```properties
dubbo.config-center.address=apollo://localhost:8080
```

或者

```java
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("apollo://localhost:8080");
```

## 3 高级配置
Apollo中的一个核心概念是命名空间 - namespace，和上面 Zookeeper、Nacos 的 namespace 概念不同，因此使用方式上也比较特殊些，建议充分了解 Apollo 自身的用法后再阅读以下文档内容。

但总的来说，对 Apollo 的适配而言：
* namespace 特用于流量治理规则隔离，参见 3.1
* group 特用于外部化配置的隔离，参见 3.2

### 3.1 外部化配置

```xml
<dubbo:config-center group="demo-provider" address="apollo://localhost:8080"/>
```

config-center 的 `group` 决定了 Apollo 读取外部化配置 `dubbo.properties` 文件的位置：
1. 如果 group 为空，则默认从 `dubbo` namespace 读取配置，用户须将外部化配置写在 `dubbo` namespace 下。
2. 如果 group 不为空
  2.1 group 值为应用名，则从应用当前的 namespace 读取配置，用户须将外部化配置写在 Apollo 自动指定的应用默认 namespace 下。
  2.2 group 值为任意值，则从对应的 namespace 读取配置，用户须将外部化配置写在该 namespace 下。

如以下示例是用的默认 group='dubbo' 的全局外部化配置，即该配置可被所有应用读取到。
![apollo-configcenter-dubbo.png](/imgs/user/apollo-configcenter-dubbo.png)

如果配置 group='应用名' 则是应用特有配置，只有该应用可以读取到。

> 关于外部化文件配置托管，相当于是把 `dubbo.properties` 配置文件的内容存储在了 Apollo 中。每个应用都可以通过关联共享的 `dubbo` namespace 继承公共配置, 进而可以单独覆盖个别配置项。

### 3.2 流量治理规则
**流量治理规则一定都是全局共享的，因此每个应用内的 namespace 配置都应该保持一致。**

```xml
<dubbo:config-center namespace="governance" address="apollo://localhost:8080"/>
```

config-center 的 `namespace` 决定了 Apollo 存取 `流量治理规则` 的位置：
1. 如果 namespace 为空，则默认从 `dubbo` namespace 存取配置，须治理规则写在 `dubbo` namespace 下。
2. 如果 namespace 不为空，则从对应的 namespace 值读取规则，须治理规则写在该 namespace 下。

如以下示例是通过 `namespace='governance'` 将流量治理规则放在了 `governance` namespace 下。
![apollo-configcenter-governance-dubbo.png](/imgs/user/apollo-configcenter-governance-dubbo.png)

### 3.3 更多 Apollo 特有配置
当前 Dubbo 适配了 env、apollo.meta、apollo.cluster、apollo.id 等特有配置项，可通过 config-center 的扩展参数进行配置。

如
```properties
dubbo.config-center.address=apollo://localhost:8080
```

或者

```properties
dubbo.config-center.prameters.apollo.meta=xxx
dubbo.config-center.prameters.env=xxx
```