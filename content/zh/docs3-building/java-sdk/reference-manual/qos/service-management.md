---
type: docs
title: "服务管理命令"
linkTitle: "服务管理命令"
weight: 3
description: "服务管理命令"
---


## ls 命令

列出消费者和提供者

```
dubbo>ls
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|org.apache.dubbo.demo.DemoService| Y |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```
列出 dubbo 的所提供的服务和消费的服务，以及消费的服务地址数

# 上线

## online 命令

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

# 下线


## offline 命令

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
