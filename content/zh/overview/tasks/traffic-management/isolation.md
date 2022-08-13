---
type: docs
title: "临时踢除问题服务实例"
linkTitle: "临时踢除问题服务实例"
weight: 5
description: "在 Dubbo-Admin 临时踢除问题服务实例"
---


Dubbo提供临时踢除问题服务实例的服务治理能力，可以在无需重启应用的情况下，临时踢除问题服务实例。

Dubbo可以通过XML配置，注解配置，动态配置实现动态调整超时时间，这里主要介绍动态配置的方式，其他配置方式请参考旧文档[配置](https://dubbo.apache.org/zh/docsv2.7/user/configuration/)


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

服务在线上运行的过程中，难免遇到某些节点有问题，为了不影响整体服务的正常运行，需要临时下线问题的服务实例。Dubbo-Admin提供了临时踢除问题服务实例能力，能够帮助您临时下线问题服务实例，不影响整体服务的运行。



## 操作步骤

1. 登录Dubbo-Admin控制台
2. 在左侧导航栏选择服务治理 > 动态配置。
3. 点击创建按钮，在创建动态配置面板中，填写规则内容，然后单击保存。



## 规则详解

#### 配置模板

```yaml
---
configVersion: v2.7
scope: application/service
key: app-name/group+service+version
enabled: true
configs:
- addresses: ["0.0.0.0"]
  providerAddresses: ["1.1.1.1:20880", "2.2.2.2:20881"]
  side: consumer
  applications/services: []
  parameters:
    timeout: 1000
    loadbalance: random
- addresses: ["0.0.0.0:20880"]
  side: provider
  applications/services: []
  parameters:
    threadpool: fixed
    threads: 200
    iothreads: 4
    dispatcher: all
    weight: 200
...
```

**对于临时踢除问题服务实例场景，只需要理清楚以下问题基本就知道配置该怎么写了：**

1. 要修改整个应用的配置还是某个服务的配置。
   - 应用：`scope: application, key: app-name`（还可使用`services`指定某几个服务）。
   - 服务：`scope: service, key:group+service+version `。
2. 修改是作用到提供者端。
   - 提供者：`side: provider`。
3. 配置是否只对某几个特定实例生效。
   - 所有实例：`addresses: ["0.0.0.0"] `或`addresses: ["0.0.0.0:*"] `具体由side值决定。
   - 指定实例：`addersses[实例地址列表]`。
4. 要修改的disabled参数。

## 结果验证
选择和临时踢除问题服务实例配置相关的应用，触发该调用验证。