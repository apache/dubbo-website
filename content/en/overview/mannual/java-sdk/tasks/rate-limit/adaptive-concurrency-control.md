---
description: "Adaptive flow control, different from ordinary flow control strategies, has the ability to automatically adjust whether the flow control strategy is effective and the flow control threshold, heuristic flow control."
linkTitle: Adaptive Flow Control
title: Adaptive Flow Control
type: docs
weight: 3
---

For the design and implementation ideas of adaptive flow control, please refer to [Dubbo Adaptive Flow Control Function](/en/overview/reference/proposals/heuristic-flow-control/). Adaptive flow control can ensure the stability and reliability of distributed systems, especially in scenarios where service provider resources are limited and variable.

## Use Cases
- Service Degradation Prevention: When service providers face performance degradation due to resource exhaustion, adaptive flow control temporarily reduces the number of requests it accepts until normal operations resume.
- Peak Traffic Handling: When service traffic surges suddenly, adaptive flow control can help prevent service overload by dynamically reducing the number of accepted requests.
- Unpredictable Traffic Handling: Service providers may encounter unpredictable traffic, and third-party applications may occasionally generate traffic while using the service. Adaptive flow control can adjust the maximum allowed concurrent requests based on current system load to prevent overload.

## Implementation

The setup method is similar to static maximum concurrency value settings; simply set the flowcontrol parameter on the server side. There are two optional values:
* heuristicSmoothingFlowControl. When the server receives a request, it first checks if CPU usage exceeds 50%. If not, it accepts and processes the request. If it exceeds 50%, indicating high current load, it obtains the current maxConcurrency value from the HeuristicSmoothingFlowControl algorithm. If the number of currently processed requests exceeds maxConcurrency, the request is rejected.
* autoConcurrencyLimiter. The main difference from HeuristicSmoothingFlowControl is that AutoConcurrencyLimiter is window-based; it uses the accumulated sample data within the window to update maxConcurrency whenever a certain amount of data is accumulated, and utilizes exploreRatio to explore remaining capacity.

> The flow control function can better work when there are multiple nodes on the server side and the consumer side has enabled retry strategy.

### Example 1: Using heuristicSmoothingFlowControl Adaptive Flow Control Algorithm

```properties
dubbo.provider.flowcontrol=heuristicSmoothingFlowControl
```

```xml
<dubbo:provider flowcontrol="heuristicSmoothingFlowControl" />
```

### Example 2: Using autoConcurrencyLimiter Adaptive Flow Control Algorithm
```properties
dubbo.provider.flowcontrol=autoConcurrencyLimiter
```

```xml
<dubbo:provider flowcontrol="autoConcurrencyLimiter" />
```

### Example 3: Setting Service Granularity of heuristicSmoothingFlowControl Adaptive Flow Control

```xml
<dubbo:service interface="com.foo.BarService" flowcontrol="heuristicSmoothingFlowControl" />
```

