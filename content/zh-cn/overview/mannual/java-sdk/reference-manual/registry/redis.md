---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/registry/redis/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/registry/redis/
    - /zh-cn/overview/what/ecosystem/registry/redis/
description: Redis 注册中心的基本使用和工作原理。
linkTitle: Redis
title: Redis
type: docs
weight: 5
---






## 前置条件
* 了解 [Dubbo 基本开发步骤](../../../quick-start/spring-boot/)
* 安装并启动 [Redis](http://redis.io) 服务

## 使用说明

```xml
<dubbo:registry address="redis://10.20.153.10:6379" />
```

或

```xml
<dubbo:registry address="redis://10.20.153.10:6379?backup=10.20.153.11:6379,10.20.153.12:6379" />
```

或

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379" />
```

或

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379,10.20.153.11:6379,10.20.153.12:6379" />
```

## 选项

* 可通过 `<dubbo:registry group="dubbo" />` 设置 redis 中 key 的前缀，缺省为 `dubbo`。
* 可通过 `<dubbo:registry cluster="replicate" />` 设置 redis 集群策略，缺省为 `failover`：
    * `failover`: 只写入和读取任意一台，失败时重试另一台，需要服务器端自行配置数据同步
    * `replicate`: 在客户端同时写入所有服务器，只读取单台，服务器端不需要同步，注册中心集群增大，性能压力也会更大


## 工作原理

基于 Redis [^1] 实现的注册中心。

Redis 过期数据通过心跳的方式检测脏数据，服务器时间必须同步，并且对服务器有一定压力，否则过期检测会不准确

![/user-guide/images/dubbo-redis-registry.jpg](/imgs/user/dubbo-redis-registry.jpg)

使用 Redis 的 Key/Map 结构存储数据结构：

* 主 Key 为服务名和类型
* Map 中的 Key 为 URL 地址
* Map 中的 Value 为过期时间，用于判断脏数据，脏数据由监控中心删除 [^3]

使用 Redis 的 Publish/Subscribe 事件通知数据变更：

* 通过事件的值区分事件类型：`register`, `unregister`, `subscribe`, `unsubscribe`
* 普通消费者直接订阅指定服务提供者的 Key，只会收到指定服务的 `register`, `unregister` 事件
* 监控中心通过 `psubscribe` 功能订阅 `/dubbo/*`，会收到所有服务的所有变更事件

调用过程：

0. 服务提供方启动时，向 `Key:/dubbo/com.foo.BarService/providers` 下，添加当前提供者的地址
1. 并向 `Channel:/dubbo/com.foo.BarService/providers` 发送 `register` 事件
2. 服务消费方启动时，从 `Channel:/dubbo/com.foo.BarService/providers` 订阅 `register` 和 `unregister` 事件
3. 并向 `Key:/dubbo/com.foo.BarService/consumers` 下，添加当前消费者的地址
4. 服务消费方收到 `register` 和 `unregister` 事件后，从 `Key:/dubbo/com.foo.BarService/providers` 下获取提供者地址列表
5. 服务监控中心启动时，从 `Channel:/dubbo/*` 订阅 `register` 和 `unregister`，以及 `subscribe` 和`unsubsribe `事件
6. 服务监控中心收到 `register` 和 `unregister` 事件后，从 `Key:/dubbo/com.foo.BarService/providers` 下获取提供者地址列表
7. 服务监控中心收到 `subscribe` 和 `unsubsribe` 事件后，从 `Key:/dubbo/com.foo.BarService/consumers` 下获取消费者地址列表