---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/stickiness/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/stickiness/
description: 为有状态服务配置粘滞连接
linkTitle: 粘滞连接
title: 粘滞连接
type: docs
weight: 31
---





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