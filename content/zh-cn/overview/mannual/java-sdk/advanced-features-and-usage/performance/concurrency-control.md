---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
description: Dubbo 中的并发控制
linkTitle: 并发控制
title: 并发控制
type: docs
weight: 28
---


## 功能说明
多种并发控制功能，帮助用户管理其应用程序和服务。

## 使用场景
限制从同一客户端到同一服务的并发请求数，防止恶意请求使服务器过载，确保服务的稳定性，并防止使用过多资源。

控制某些服务的最大并发请求数，确保其他服务的资源可用性。系统过载和确保系统稳定性。

允许在需求增加时更平滑地扩展服务。

确保服务在高峰使用时间保持可靠和稳定。

这种方式要求用户准确的预先评估系统能处理的并发数，而准确的评估系统处理能力并不是一件容易的事情，因此 Dubbo 还提供了自适应限流模式，根据系统负载自动识别系统健康程度并进行限流保护，可以在此 [查看使用文档](../adaptive-concurrency-control)。

## 使用方式
### 样例一

> 限制 `com.foo.BarService` 的每个方法，服务器端并发执行（或占用线程池线程数）不能超过 10 个

```xml
<dubbo:service interface="com.foo.BarService" executes="10" />
```

### 样例二

> 限制 `com.foo.BarService` 的 `sayHello` 方法，服务器端并发执行（或占用线程池线程数）不能超过 10 个

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" executes="10" />
</dubbo:service>
```
### 样例三

> 限制 `com.foo.BarService` 的每个方法，每客户端并发执行（或占用连接的请求数）不能超过 10 个

```xml
<dubbo:service interface="com.foo.BarService" actives="10" />
```

**或**

```xml
<dubbo:reference interface="com.foo.BarService" actives="10" />
```

### 样例四

> 限制 `com.foo.BarService` 的 `sayHello` 方法，每客户端并发执行（或占用连接的请求数）不能超过 10 个

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

或

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

> 如果 `<dubbo:service>` 和 `<dubbo:reference>` 都配了actives，`<dubbo:reference>` 优先，参见：[配置的覆盖策略](../../../reference-manual/config/principle/)。

### Load Balance 均衡

配置服务的客户端的 `loadbalance` 属性为 `leastactive`，此 Loadbalance 会调用并发数最小的 Provider（Consumer端并发数）。

```xml
<dubbo:reference interface="com.foo.BarService" loadbalance="leastactive" />
```

**或**

```xml
<dubbo:service interface="com.foo.BarService" loadbalance="leastactive" />
```