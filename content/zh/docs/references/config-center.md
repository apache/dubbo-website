---
type: docs
title: "配置中心参考手册"
linkTitle: "配置中心"
weight: 2
description: "Dubbo 配置中心参考手册"
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

## 外部化配置
请参考文档 [外部化配置](../configuration/external-config)

## 动态配置
[TODO 待完善]

## 服务治理

#### Zookeeper

默认节点结构：

![zk-configcenter-governance](/imgs/user/zk-configcenter-governance.jpg)

- namespace，用于不同配置的环境隔离。
- config，Dubbo 约定的固定节点，不可更改，所有配置和服务治理规则都存储在此节点下。
- dubbo，所有服务治理规则都是全局性的，dubbo 为默认节点
- configurators/tag-router/condition-router/migration，不同的服务治理规则类型，node value 存储具体规则内容

#### Apollo

所有的服务治理规则都是全局性的，默认从公共命名空间 `dubbo` 读取和订阅：

![apollo-configcenter-governance.jpg](/imgs/user/apollo-configcenter-governance.jpg)

不同的规则以不同的 key 后缀区分：

- configurators，[覆盖规则](../../examples/config-rule)
- tag-router，[标签路由](../../examples/routing-rule)
- condition-router，[条件路由](../../examples/condition-router)
- migration, [迁移规则](../../examples/todo)

#### Nacos

所有的服务治理规则都是全局的，默认从 namespace: `public` 下进行读取， 通过 dataId: `interface name` 以及 group: `dubbo` 去读取和订阅：

![nacos-configcenter-governance.jpg](/imgs/user/nacos-configcenter-governance.png)

不同的规则以 dataId 的后缀区分：

- configurators，[覆盖规则](../../examples/config-rule)
- tag-router，[标签路由](../../examples/routing-rule)
- condition-router，[条件路由](../../examples/condition-router)
- migration, [迁移规则](../../examples/todo)

