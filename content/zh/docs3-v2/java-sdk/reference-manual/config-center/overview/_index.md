---
type: docs
title: "配置中心概述"
linkTitle: "配置中心概述"
weight: 1
---

配置中心在 Dubbo 中承担3个职责：

1. 外部化配置：启动配置的集中式存储 （简单理解为 dubbo.properties 的外部化存储）。
2. 服务治理：服务治理规则的存储与通知。
3. 动态配置：控制动态开关或者动态变更属性值

启用动态配置，以 Zookeeper 为例，可查看 [配置中心属性详解](../../references/xml/dubbo-config-center)

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
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

> 为了兼容 2.6.x 版本配置，在使用 Zookeeper 作为注册中心，且没有显示配置配置中心的情况下，Dubbo 框架会默认将此 Zookeeper 用作配置中心，但将只作服务治理用途。
