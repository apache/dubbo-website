---
type: docs
title: "动态调整服务超时时间"
linkTitle: "动态调整服务超时时间"
weight: 5
description: "在 Dubbo-Admin 动态调整服务超时时间"
---



Dubbo提供动态调整超时时间的服务治理能力，可以在无需重启应用的情况下，动态调整服务超时时间。

Dubbo可以通过XML配置，注解配置，动态配置实现动态调整超时时间，这里主要介绍动态配置的方式，其他配置方式请参考旧文档[配置](https://dubbo.apache.org/zh/docsv2.7/user/configuration/)

## 开始之前

请确保成功运行Dubbo-Admin



> **提示**
>
> docker部署dubbo-admin，docker-compose.yml如下：
>
> ```
>version: '3'
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

在日常工作中会遇到各类超时配置，业务逻辑变更后，已有调用关系随着业务发展可能需要不断调整，相应服务接口响应时间的变化可能需要上线后才能确定。Dubbo-Admin提供了动态的超时配置能力，能够帮助您快速动态调整接口超时时间，提高服务的可用性。



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

**对于动态调整超时时间场景，只需要理清楚以下问题基本就知道配置该怎么写了：**

1. 要修改整个应用的配置还是某个服务的配置。
   - 应用：`scope: application, key: app-name`（还可使用`services`指定某几个服务）。
   - 服务：`scope: service, key:group+service+version `。
2. 修改是作用到消费者端还是提供者端。
   - 消费者：`side: consumer` ，作用到消费端时（你还可以进一步使用`providerAddress`, `applications`选定特定的提供者示例或应用）。
   - 提供者：`side: provider`。
3. 配置是否只对某几个特定实例生效。
   - 所有实例：`addresses: ["0.0.0.0"] `或`addresses: ["0.0.0.0:*"] `具体由side值决定。
   - 指定实例：`addersses[实例地址列表]`。
4. 要修改的超时时间。

## 结果验证
选择和超时配置相关的应用，触发该调用验证。