---
type: docs
title: "Apollo"
linkTitle: "Apollo"
weight: 4
description: "Apollo 配置中心的基本使用和工作原理。"
---

## 1 前置条件
* 了解 [Dubbo 基本开发步骤](../../../quick-start/spring-boot/)
* 安装并启动 [Apollo](https://www.apolloconfig.com/#/zh/README)

## 2 使用说明
在此查看[完整示例代码](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-configcenter/dubbo-samples-configcenter-apollo)

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

### 3.1 配置隔离
```xml
<dubbo:config-center protocol="apollo" address="127.0.0.1:2181"/>
```

Apollo中的一个核心概念是命名空间 - namespace（和上面zookeeper的namespace概念不同），在这里全局和应用级别配置就是通过命名空间来区分的。

默认情况下，Dubbo会从名叫`dubbo`（由于 Apollo 不支持特殊后缀 `.properties` ）的命名空间中读取全局配置（`<dubbo:config-center namespace="your namespace">`）

![apollo-configcenter-dubbo.png](/imgs/user/apollo-configcenter-dubbo.png)

由于 Apollo 也默认将会在 `dubbo` namespace 中存储服务治理规则（如路由规则），建议通过单独配置 `group` 将服务治理和配置文件托管分离开，以 XML 配置方式为例：
```xml
<dubbo namespace="governance" group ="dubbo"/>
```
这里，服务治理规则将存储在 governance namespace，而配置文件将存储在 dubbo namespace，如下图所示：
![apollo-configcenter-governance-dubbo.png](/imgs/user/apollo-configcenter-governance-dubbo.png)

> 关于文件配置托管，相当于是把 `dubbo.properties` 配置文件的内容存储在了 Apollo 中，应用通过关联共享的 `dubbo` namespace 继承公共配置,
>  应用也可以按照 Apollo 的做法来覆盖个别配置项。

## 4 工作原理

所有的服务治理规则都是全局性的，默认从公共命名空间 `dubbo` 读取和订阅：

![apollo-configcenter-governance.jpg](/imgs/user/apollo-configcenter-governance.jpg)

不同的规则以不同的 key 后缀区分：

- configurators，[覆盖规则](../../examples/config-rule)
- tag-router，[标签路由](../../examples/routing-rule)
- condition-router，[条件路由](../../examples/condition-router)
- migration, [迁移规则](../../examples/todo)



