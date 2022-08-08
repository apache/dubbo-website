---
type: docs
title: "通过权重调整流量分布"
linkTitle: "通过权重调整流量分布"
weight: 5
description: "在 Dubbo-Admin 通过权重调整流量分布"
---



Dubbo提供通过权重调整流量分布的服务治理能力，可以在无需重启应用的情况下，通过权重动态调整流量分布。

Dubbo可以通过XML配置，注解配置，动态配置实现通过权重调整流量分布，这里主要介绍动态配置的方式，其他配置方式请参考旧文档[配置](https://dubbo.apache.org/zh/docsv2.7/user/configuration/)

## 开始之前

请确保成功运行Dubbo-Admin



> **提示**
>
> docker部署dubbo-admin，docker-compose.yml如下：
>
> ```
> version: '3'
> services:
> zk:
>  image: zookeeper
>    container_name: zk
>     ports:
>          - 2181:2181
>      dubbo-admin:
>     image: apache/dubbo-admin
>     container_name: dubbo-admin
>     # 等待zk启动后再启动
>     depends_on:
>       - zk
>     ports:
>       - 8080:8080
>     environment:
>       - admin.registry.address=zookeeper://zk:2181
>       - admin.config-center=zookeeper://zk:2181
>       - admin.metadata-report.address=zookeeper://zk:2181
> ```
> 


## 背景信息

在机器性能差异的场景下，不同机器的负载需要进行系统评估，需要对某些机器降级。通过权重调整机器的流量比例，可以合理地评估机器性能。
某些服务会面临流量冲击，为了保证核心服务的可用性，需要对某些服务降级。通过权重调整流量分布，避免流量冲击引发的故障。


## 操作步骤

1. 登录Dubbo-Admin控制台
2. 在左侧导航栏选择服务治理 > 权重调整。
3. 点击创建按钮，在新建权重规则面板中，填写规则内容，然后单击保存。


## 规则详解


**对于通过权重动态调整流量分布场景，只需要理清楚以下问题基本就知道配置该怎么写了：**

1. 要修改整个应用的配置还是某个服务的配置。
   - 应用：`scope: application, key: app-name`（还可使用`services`指定某几个服务）。
   - 服务：`scope: service, key:group+service+version `。
2. 地址列表配置是否只对某几个特定实例生效。
   - 所有实例：`addresses: ["0.0.0.0"] `或`addresses: ["0.0.0.0:*"] `具体由side值决定。
   - 指定实例：`addersses[实例地址列表]`。
3. 要修改的权重。

## 结果验证
选择和权重配置相关的应用，触发该调用验证。