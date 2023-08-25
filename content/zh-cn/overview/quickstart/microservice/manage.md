---
aliases:
    - /zh/overview/quickstart/java/brief/
description: 本文将基于 Dubbo Samples 示例演示如何快速搭建并部署一个微服务应用。
linkTitle: 尝试治理微服务
title: 尝试治理微服务
type: docs
weight: 3
---

我们推荐您使用，

## 部署示例应用
在上一篇文档中，我们部署了一个示例应用。接下来我们部署更多的应用，以方便演示服务治理相关能力。

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/10-task/dubbo-samples-shop/deploy/All.yml
```

使用以上命令可以部署我们预先准备好的示例应用，应用总体架构图如下：

![shop 应用总体架构图]()

## 可视化监控服务状态
admin

```shell
dubboctl dashboard grafana
```

https://grafana.service

## 流量管控
请参照以下任务，治理您的微服务应用，我们设计的任务包括：



## 接入更多服务治理能力

* 限流降级
* 分布式事务
* 安全
* 服务网格


