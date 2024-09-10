---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/config-connections/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/stickiness/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/lazy-connect/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/config-connections/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/stickiness/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/lazy-connect/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/config-connections/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/config-connections/
description: Dubbo 中服务端和客户端的连接控制
linkTitle: 连接控制
title: 连接控制
type: docs
weight: 29
---





## 功能说明
连接控制功能可以使用户能够控制和管理进出服务器连接数，限制连接数并设置超时，以确保 Dubbo 系统的稳定性和性能，还允许用户根据 IP 地址、端口和协议配置不同级别的访问控制，保护系统免受恶意流量的影响，并降低服务中断的风险，此外提供了一种监视当前流量和连接状态的方法。

## 使用场景
1. 服务器过载时减少连接数：当服务器过载时，使用 Dubbo 通过设置最大连接限制来减少连接数减少服务器上的负载并防止其崩溃。
2. 减少服务器受到攻击时的连接数：Dubbo 可以限制服务器受到攻击的连接数防止恶意连接充斥服务器并导致服务器崩溃。
3. 限制特定服务的连接数：Dubbo 可以限制特定服务连接数防止服务过载过多的请求并确保及时响应所有请求。
4. 限制来自单个IP地址的连接数：Dubbo 可以限制来自单个地址的连接数降低来自单个IP地址的恶意活动的风险。

## 使用方式
### 服务端连接控制

限制服务器端接受的连接不能超过 10 个 [^1]：

```xml
<dubbo:provider protocol="dubbo" accepts="10" />
```

或

```xml
<dubbo:protocol name="dubbo" accepts="10" />
```

### 客户端连接控制

限制客户端服务使用连接不能超过 10 个 [^2]：

```xml
<dubbo:reference interface="com.foo.BarService" connections="10" />
```

或

```xml
<dubbo:service interface="com.foo.BarService" connections="10" />
```

如果 `<dubbo:service>` 和 `<dubbo:reference>` 都配了 connections，`<dubbo:reference>` 优先，参见：[配置的覆盖策略](/zh-cn/overview/mannual/java-sdk/reference-manual/config/principle/)

[^1]: 因为连接在 Server上，所以配置在 Provider 上
[^2]: 如果是长连接，比如 Dubbo 协议，connections 表示该服务对每个提供者建立的长连接数




## 功能说明
允许消费者在提供者接收请求之前向提供者发送请求，消费者等待提供者准备就绪，然后将发送消费者者的请求，当消费者需要连接到提供者，提供者尚未准备好接受请求时，确保在正确的时间发送请求，防止消费者被速度慢或不可用的提供程序阻止。

## 使用场景
粘滞连接用于有状态服务，尽可能让客户端总是向同一提供者发起调用，除非该提供者挂了，再连另一台。

粘滞连接将自动开启 [延迟连接](../lazy-connect)，以减少长连接数。

## 使用方式
```xml
<dubbo:reference id="xxxService" interface="com.xxx.XxxService" sticky="true" />
```

Dubbo 支持方法级别的粘滞连接，如果你想进行更细粒度的控制，还可以这样配置。

```xml
<dubbo:reference id="xxxService" interface="com.xxx.XxxService">
    <dubbo:method name="sayHello" sticky="true" />
</dubbo:reference>
```





## 功能说明
当消费者请求服务时，实际使用服务时才建立真正的连接，避免不必要的连接来减少延迟并提高系统稳定性。

## 使用场景
延迟连接用于减少长连接数。当有调用发起时，再创建长连接。

## 使用方式
```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

> 该配置只对使用长连接的 dubbo 协议生效。
