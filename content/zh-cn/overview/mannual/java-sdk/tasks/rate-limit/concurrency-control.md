---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
description: "Dubbo 框架内置的并发控制或者限流策略，通过限制从同一客户端到同一服务的并发请求数，防止恶意请求使服务器过载，确保服务的稳定性，并防止使用过多资源。"
linkTitle: 框架内置限流
title: Dubbo 框架内置的并发控制策略
type: docs
weight: 2
---

Dubbo 通过 Filter 拦截器机制，内置了并发控制策略实现。限制从同一客户端到同一服务的并发请求数，防止恶意请求使服务器过载，确保服务的稳定性，并防止使用过多资源。

* 控制某些服务的最大并发请求数，确保其他服务的资源可用性。系统过载和确保系统稳定性。
* 允许在需求增加时更平滑地扩展服务。
* 确保服务在高峰使用时间保持可靠和稳定。

{{% alert title="注意" color="warning" %}}
这种方式要求用户准确的预先评估系统能处理的并发数，而准确的评估系统处理能力并不是一件容易的事情，因此 Dubbo 还提供了自适应限流模式，根据系统负载自动识别系统健康程度并进行限流保护，可以在此查看 [自适应限流模式使用文档](../adaptive-concurrency-control)。
{{% /alert %}}

## 限流策略配置
### 限制服务器端并发执行数(服务粒度)

限制 `com.foo.BarService` 的每个方法，服务器端并发执行（或占用线程池线程数）不能超过 10 个

XML 方式：
```xml
<dubbo:service interface="com.foo.BarService" executes="10" />
```

注解方式：
```java
@DubboService(executes=10)
private DemoServiceImpl implements DemoService{}
```

### 限制服务器端并发执行数(方法粒度)

限制 `com.foo.BarService` 的 `sayHello` 方法，服务器端并发执行（或占用线程池线程数）不能超过 10 个

XML 方式：
```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" executes="10" />
</dubbo:service>
```

注解方式：
```java
@DubboService(executes=10, methods = {@Method(name="sayHello",executes=10)})
private DemoServiceImpl implements DemoService{}
```

### 限制消费端并发调用数(服务粒度)

限制 `com.foo.BarService` 的每个方法，每客户端并发执行（或占用连接的请求数）不能超过 10 个

XML 方式：
```xml
<dubbo:service interface="com.foo.BarService" actives="10" />
```

注解方式：
```java
@DubboReference(actives=10)
private DemoService demoService;
```

### 限制消费端并发调用数(方法粒度)

限制 `com.foo.BarService` 的 `sayHello` 方法，每客户端并发执行（或占用连接的请求数）不能超过 10 个

XML 方式：
```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

注解方式：
```java
@DubboReference(actives=10, methods = {@Method(name="sayHello",executes=10)})
private DemoService demoService;
```

> 如果提供端 `@DubboService` 和消费端 `@DubboReference` 都配了 actives，则消费端配置值优先级更高，参见：[配置的覆盖策略](https://dubbo.apache.org/zh-cn/overview/mannual/java-sdk/reference-manual/config/principle/)。

## 最小并发数负载均衡

配置服务的客户端的 `loadbalance` 属性为 `leastactive`，此 Loadbalance 会调用并发数最小的 Provider（Consumer端并发数）。

```xml
<dubbo:reference interface="com.foo.BarService" loadbalance="leastactive" />
```

**或**

```xml
<dubbo:service interface="com.foo.BarService" loadbalance="leastactive" />
```