---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/service-management/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/service-management/
description: 服务管理命令
linkTitle: 服务管理命令
title: 服务管理命令
type: docs
weight: 3
---




服务管理功能提供了一系列的命令对 Dubbo 服务进行管理。

## 服务管理

### ls 命令

列出消费者和提供者

```
dubbo>ls
As Provider side:
+------------------------------------------------------------------------+---------------------+
|                          Provider Service Name                         |         PUB         |
+------------------------------------------------------------------------+---------------------+
|DubboInternal - UserRead/org.apache.dubbo.metadata.MetadataService:1.0.0|                     |
+------------------------------------------------------------------------+---------------------+
|               com.dubbo.dubbointegration.UserReadService               |nacos-A(Y)/nacos-I(Y)|
+------------------------------------------------------------------------+---------------------+
As Consumer side:
+-----------------------------------------+-----------------+
|          Consumer Service Name          |       NUM       |
+-----------------------------------------+-----------------+
|com.dubbo.dubbointegration.BackendService|nacos-AF(I-2,A-2)|
+-----------------------------------------+-----------------+

```

列出 dubbo 的所提供的服务和消费的服务，以及消费的服务地址数。

{{% alert title="注意" color="primary" %}}
- 带有 `DubboInternal` 前缀的服务是 Dubbo 内置的服务，默认不向注册中心中注册。
- 服务发布状态中的 `nacos-A(Y)` 第一部分是对应的注册中心名，第二部分是注册的模式（`A` 代表应用级地址注册，`I` 代表接口级地址注册），第三部分代表对应模式是否已经注册
- 服务订阅状态中的 `nacos-AF(I-2,A-2)` 第一部分是对应的注册中心名，第二部分是订阅的模式（`AF` 代表双订阅模式，`FA` 代表仅应用级订阅，`FI` 代表仅接口级订阅），第三部分中前半部分代表地址模式来源（`A` 代表应用级地址，`I` 代表接口级地址）后半部分代表对应的地址数量
{{% /alert %}}

## 上线

### online 命令

Online 上线服务命令

当使用延迟发布功能的时候(通过设置 org.apache.dubbo.config.AbstractServiceConfig#register 为 false)，后续需要上线的时候，可通过 Online 命令
```
//上线所有服务
dubbo>online
OK

//根据正则，上线部分服务
dubbo>online com.*
OK
```

## 下线


### offline 命令

下线服务命令

由于故障等原因，需要临时下线服务保持现场，可以使用 Offline 下线命令。

```
//下线所有服务
dubbo>offline
OK

//根据正则，下线部分服务
dubbo>offline com.*
OK
```
