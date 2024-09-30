---
description: "Traffic Based on Sentinel"
title: Sentinel Rate Limiting and Downgrade
type: docs
weight: 3
---

Dubbo-go provides a built-in rate limiting component, allowing users to adjust rate limiting values and post-limiting behaviors according to their business scenarios. The specifics can be defined and implemented in [TpsLimiter](https://github.com/apache/dubbo-go/blob/main/filter/tps_limiter.go#L52). Users can set a simple rate limiting strategy on the server side in a manner similar to the following: 

```go
server.WithTpsLimiter("method-service") // Currently supports implementations like method-service, polaris, etc.
server.WithTpsLimiterXxx() // Set rate limiting related thresholds, please fill in according to the specific method
//tps.limit.strategy: "slidingWindow"
//tps.limit.rejected.handler: "default"
//tps.limit.interval: 1000
//tps.limit.rate: 3
```

The built-in rate limiting strategy in Dubbo-go is relatively simple. For more complex scenarios, we recommend using professional third-party frameworks like Sentinel to achieve richer and more flexible rate limiting strategies.

You can view the [complete source code for this example](https://github.com/apache/dubbo-go-samples/tree/main/filter/sentinel), and also refer to the [Java example of Dubbo+Sentinel](/en/overview/mannual/java-sdk/tasks/rate-limit/sentinel/) for more inspiration.

## Provider Rate Limiting

### QpS Based Rate Limiting

### Rate Limiting Based on Concurrent Task Count (Current Running Task Count)

## Consumer Rate Limiting

### Circuit Breaker Strategy

### Rate Limiting Based on Concurrent Request Count (Requests Awaiting Response)

