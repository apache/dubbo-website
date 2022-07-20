---
type: docs
title: "Nacos"
linkTitle: "Nacos"
weight: 3
description: ""
---

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


