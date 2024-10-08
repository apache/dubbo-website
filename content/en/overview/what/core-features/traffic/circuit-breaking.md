---
aliases:
  - /en/overview/core-features/traffic/circuit-breaking/
description: ""
linkTitle: Rate Limiting & Circuit Breaking
title: Rate Limiting & Circuit Breaking
type: docs
weight: 5
---

Due to the distributed nature of microservices, building a stable microservice cluster is a significant challenge. Two critical points to focus on are:
* Rate Limiting
* Circuit Breaking

## Rate Limiting
**Rate limiting is more about ensuring service stability from the perspective of Dubbo service providers**. By explicitly setting request upper thresholds for Dubbo services, it ensures that the number of requests handled by the service is always within a reasonable range, thereby ensuring the overall stability of the system.

![provider-rate-limit](/imgs/v3/feature/circuit-breaking/provider-rate-limit.png)

Depending on the specific deployment of the service, the upper limit of traffic that the service can handle is fixed. When the number of requests to the service remains within a reasonable range, the system operates normally. However, when the number of requests severely exceeds the service's handling capacity, such as during traffic peaks in promotional periods, it may cause excessive resource consumption, high load on the service provider side, leading to response delays, unanswered requests, and system hang-ups.

The problem solved by rate limiting and its working mechanism are relatively easy to understand. The difficulty lies in determining the maximum traffic that the service can handle.
* One mode is for the user to preset a fixed rate limit value. For example, Dubbo achieves rate limiting capabilities by integrating products like Sentinel.
    * [Dubbo Sentinel Rate Limiting](../../../tasks/rate-limit/sentinel/)
* Another way is for the Dubbo framework to automatically perform rate limiting based on system or cluster load conditions. This is more flexible and convenient compared to the user presetting the rate limit value. Dubbo currently has a built-in adaptive rate limiting mode. For details, see:
    * [Java Adaptive Rate Limiting Usage](../../../mannual/java-sdk/advanced-features-and-usage/performance/adaptive-concurrency-control/)
    * [Go Adaptive Rate Limiting Usage](../../../reference/proposals/heuristic-flow-control/)
    * [Adaptive Rate Limiting Design Principles](../../../reference/proposals/heuristic-flow-control/)

## Circuit Breaking
**Circuit breaking is a crucial means to ensure system stability from the perspective of Dubbo service consumers**. A service often needs to call more downstream Dubbo services to complete business logic. At this time, the stability of downstream services will affect the current service and even the stability of the entire system. Circuit breaking is designed for unstable service scenarios. It can minimize the impact of unstable downstream services on upstream services.

Compared to directly returning a call failure message after circuit breaking, with service degradation capabilities, we can continue to call the pre-set service degradation logic and use the result of the degradation logic as the final call result, returning it more gracefully to the service caller.

![consumer-circuit-breaking](/imgs/v3/feature/circuit-breaking/consumer-circuit-breaking.png)

As shown in the figure above, Dubbo Consumer relies on three downstream Dubbo services. When Service 3 becomes unstable (e.g., response time increases, error rate rises), the threads and resources calling Service 3 from the Consumer will accumulate. If we do not impose any restrictions on the Consumer side at this time, the calls to Service 1 and Service 2 will also be affected in terms of stability. By circuit breaking Service 3, we can ensure the stability of the entire Dubbo Consumer service, preventing it from dragging down the entire Consumer service. There are many ways to implement circuit breaking for Service 3, including thread count, semaphore, error rate, etc.

Dubbo has achieved service circuit breaking and degradation capabilities by integrating mainstream frameworks in the industry.

* [Sentinel](../../../tasks/rate-limit/sentinel/)
* [Hystrix](../../../tasks/rate-limit/hystrix/)
* [Resilience4J](../../../tasks/rate-limit/resilience4j/)

