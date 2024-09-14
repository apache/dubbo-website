---
description: "基于 Sentinel 的流量"
title: Sentinel限流降级
type: docs
weight: 3
---

Dubbo-go 中提供了内置的限流组件，用户可根据自己的业务场景调整限流值、限流后的行为等，具体可 [TpsLimiter](https://github.com/apache/dubbo-go/blob/main/filter/tps_limiter.go#L52) 定义与具体实现。用户可通过类似以下方式在服务端设置简单的限流策略：

```go
server.WithTpsLimiter("method-service") // 目前支持 method-service、polaris 等几个实现
server.WithTpsLimiterXxx() // 设置限流相关阈值，请根据具体方法填写
//tps.limit.strategy: "slidingWindow"
//tps.limit.rejected.handler: "default"
//tps.limit.interval: 1000
//tps.limit.rate: 3
```

Dubbo-go 内置限流策略相对简单，对于一些更复杂的场景，我们建议通过使用 Sentinel 等专业的第三方框架可以实现更丰富、更灵活的限流策略。

可在此查看 [本示例完整源码](https://github.com/apache/dubbo-go-samples/tree/main/filter/sentinel)，也可以参考 [Dubbo+Sentinel 的 Java 示例](/zh-cn/overview/mannual/java-sdk/tasks/rate-limit/sentinel/) 获得更多灵感。

## Provider 限流

### 基于 QpS 限流

### 基于并发任务数限流(当前在运行任务数)

## Consumer 限流

### 熔断策略



### 基于并发请求数限流(未收到响应的请求数)