---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/design/architecture/
    - /zh-cn/docs3-v2/golang-sdk/preface/design/architecture/
description: 架构
keywords: 架构
title: 架构
type: docs
---






### 架构说明

![architecture](/imgs/docs3-v2/golang-sdk/concept/more/architecture/architecture.png)

### 节点说明

* `Registry` : dubbo-go中负责服务注册与发现的注册中心
* `Consumer` : 调用远程服务的服务消费方
* `Provider` : 暴露服务的服务提供方

### 过程说明
* `0. register` : 当服务提供方在启动的时候，会自动将自己的服务注册到注册中心
* `1. subscribe` : 服务消费方会在启动的时候，向注册中心订阅自己所需要的服务
* `2. notify` : 注册中心返回服务注册的信息给到服务消费方，当订阅的服务发生变更，会推送变更的数据给到消费方
* `3. invoke` : 服务消费者根据从注册中心获得的服务地址，经过负载均衡算法选出一个合适的服务地址发起请求