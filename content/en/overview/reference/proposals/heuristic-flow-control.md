---
aliases:
    - /en/overview/reference/proposals/heuristic-flow-control/
author: Quanlu Liu
date: 2023-01-30T00:00:00Z
description: The flexible services discussed in this article mainly refer to the functions of **load balancing on the consumer side** and **traffic limiting on the provider side**. In previous versions of Dubbo, the load balancing focused more on fairness, meaning that the consumer would choose equally from the providers, which didn’t perform ideally in some cases. The traffic limiting only provided static schemes, requiring users to set a static maximum concurrency value on the provider, which was not easy for users to determine. We made improvements to address these issues.
linkTitle: Flexible Services
title: Adaptive Load Balancing and Flow Control
type: docs
weight: 5
working_in_progress: true
---


# Overview
The flexible services discussed in this article mainly refer to the functions of **load balancing on the consumer side** and **traffic limiting on the provider side**. In previous versions of Dubbo,
* The load balancing focused more on fairness, meaning the consumer chooses equally from the provider, which didn’t perform ideally in some cases.
* The traffic limiting only provided static schemes, requiring users to set a static maximum concurrency value on the provider, which was not easy for users to determine.

We made improvements to address these issues.

## Load Balancing
### Usage Introduction
In the original Dubbo versions, there were five loading balancing schemes available: `Random`, `ShortestResponse`, `RoundRobin`, `LeastActive`, and `ConsistentHash`. Except for `ShortestResponse` and `LeastActive`, the others mainly considered fairness and stability.

For `ShortestResponse`, its design aims to select the provider with the shortest response time to improve overall system throughput. However, two issues arise:
1. In most scenarios, the response times of different providers do not show significant differences, making this algorithm degrade to random selection.
2. The response time does not always represent the machine’s throughput capacity. For `LeastActive`, it believes traffic should be allocated to machines with fewer active connections, but it similarly fails to reflect the machine's throughput capacity.

Based on this analysis, we propose two new load balancing algorithms. One is a simple `P2C` algorithm based on fairness, while the other is an `adaptive` method that attempts to dynamically assess the throughput capacity of the provider machines and allocate traffic accordingly to improve overall system performance.

#### Overall Effect
The effectiveness experiments for load balancing were conducted under two different conditions: balanced provider machine configurations and configurations with large discrepancies.

![image.png](/imgs/overview/reference/proposals/heuristic-flow-control/1675265258687-c3df68a8-80e0-4311-816c-63480494850c.png)

![image.png](/imgs/overview/reference/proposals/heuristic-flow-control/1675265271198-5b045ced-8524-42a2-8b34-d7edbbd1f232.png)

#### Usage Method
[Usage method of Dubbo Java implementation](/en/overview/mannual/java-sdk/advanced-features-and-usage/performance/loadbalance) is the same as the original load balancing method. Just set "loadbalance" to "p2c" or "adaptive" on the consumer side.

#### Code Structure
The algorithm implementation of load balancing only needs to inherit from the LoadBalance interface in the existing load balancing framework.

### Principle Introduction

#### P2C Algorithm

The Power of Two Choice algorithm is simple yet classic, mainly as follows:

1. For each call, make two random selections from the available provider list, selecting two nodes, providerA and providerB.
2. Compare providerA and providerB, choosing the one with the smaller "current active connection count".

#### Adaptive Algorithm

[Code's GitHub address](https://github.com/apache/dubbo/pull/10745)

##### Related Metrics
1. cpuLoad
![img](/imgs/overview/reference/proposals/heuristic-flow-control/26808016bc7f1ee83ab425e308074f17.svg). This metric is obtained from the provider machine and passed to the consumer via the invocation's attachment.

2. rt
rt is the time taken for an RPC call, measured in milliseconds.

3. timeout
timeout is the remaining timeout for this RPC call, measured in milliseconds.

4. weight
weight is the service weight set.

5. currentProviderTime
The time on the provider side when calculating cpuLoad, measured in milliseconds.

6. currentTime
currentTime is the last calculated load time, initialized to currentProviderTime, measured in milliseconds.
7. multiple
![img](/imgs/overview/reference/proposals/heuristic-flow-control/b60f036bd026b92129df8a6476922cc8.svg)

8. lastLatency
![img](/imgs/overview/reference/proposals/heuristic-flow-control/f2abbc771049cf4f3e492e93a258d699.svg)![img](/imgs/overview/reference/proposals/heuristic-flow-control/8fb1af970b995232ebed2764a5706aab.svg)

9. beta
Smoothing parameter, defaulting to 0.5.

10. ewma
Smooth value of lastLatency![img](/imgs/overview/reference/proposals/heuristic-flow-control/c26fdbae56f3a06c46434ae91185a3d6.svg)

11. inflight
inflight is the number of requests not yet returned on the consumer side.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/f429c4726dec484e70ee73e6a37c88dd.svg)

12. load
For a candidate backend machine x, if the time since the last call is greater than 2 * timeout, its load value is 0. Otherwise,

![img](/imgs/overview/reference/proposals/heuristic-flow-control/0f56746b3643dc3ed0e019c24ad5f377.svg)

##### Algorithm Implementation
Still based on the P2C algorithm.

1. Make two random selections from the candidate list to get providerA and providerB.
2. Compare the load values of providerA and providerB, selecting the smaller one.

## Adaptive Traffic Limiting

Unlike load balancing running on the consumer side, traffic limiting operates on the provider side. Its purpose is to limit the maximum number of concurrent tasks processed by the provider. The processing capacity of a server machine theoretically has an upper limit, and when a large number of requests occur in a short period, it can lead to undelivered requests and overload the machine. This scenario can lead to two issues:

1. Due to backlogged requests, all requests may have to wait a long time to be processed, leading to service paralysis.
2. Prolonged server overload poses a risk of downtime.

Therefore, when overload risks are present, it is better to reject some requests. In previous versions of Dubbo, traffic limiting was achieved by setting a static maximum concurrency value on the provider side. However, in scenarios with many services, complex topology, and dynamically changing processing capabilities, calculating a static value is difficult.

Based on these reasons, we require an adaptive algorithm that can dynamically adjust the maximum concurrency value of server machines to process as many received requests as possible while ensuring the machine does not overload. Therefore, we implemented two adaptive traffic limiting algorithms in the Dubbo framework: `HeuristicSmoothingFlowControl` based on heuristic smoothing and `AutoConcurrencyLimier` based on a window.

[Code's GitHub address](https://github.com/apache/dubbo/pull/10642)

### Usage Introduction
#### Overall Effect

The effectiveness experiments for adaptive traffic limiting were conducted under conditions of large provider machine configurations, and to highlight the effects, we increased the complexity of individual requests, set the timeout as large as possible, and enabled the retry functionality on the consumer side.
![image.png](/imgs/overview/reference/proposals/heuristic-flow-control/1675267798831-3da99681-577f-4e5a-b122-b87c8aba7299.png)

#### Usage Method
To ensure the presence of multiple nodes on the server side and the enabling of retry strategies on the consumer side, the traffic limiting function can perform better.

[Method to enable adaptive traffic limiting in Dubbo Java implementation](/en/overview/mannual/java-sdk/advanced-features-and-usage/performance/loadbalance) is similar to setting a static maximum concurrency value, simply set "flowcontrol" to "autoConcurrencyLimier" or "heuristicSmoothingFlowControl" on the provider side.

#### Code Structure
1. FlowControlFilter: the filter on the provider side responsible for implementing traffic control based on the results of the limiting algorithm.
2. FlowControl: the interface for limiting algorithms implemented based on Dubbo's SPI. Specific implementation algorithms for traffic limiting need to inherit from this interface and be usable via Dubbo's SPI.
3. CpuUsage: periodically retrieves relevant CPU metrics.
4. HardwareMetricsCollector: methods for obtaining hardware-related metrics.
5. ServerMetricsCollector: methods for obtaining metrics required for traffic limiting based on sliding windows. For example, QPS, etc.
6. AutoConcurrencyLimier: specific implementation algorithm for adaptive traffic limiting.
7. HeuristicSmoothingFlowControl: specific implementation method for adaptive traffic limiting.

### Principle Introduction
#### HeuristicSmoothingFlowControl
##### Related Metrics
1. alpha
alpha is the acceptable delay increase, defaulting to 0.3.

2. minLatency
The minimum latency value in a time window.

3. noLoadLatency
noLoadLatency is the delay without any queue time. This is an inherent property of server machines but is not constant. In the HeuristicSmoothingFlowControl algorithm, we determine the current noLoadLatency based on the CPU usage. When CPU usage is low, we consider minLatency as noLoadLatency. When CPU usage is moderate, we use a smooth update of noLoadLatency's value with minLatency. When CPU usage is high, noLoadLatency’s value remains unchanged.

4. maxQPS
The maximum QPS within a time window.

5. avgLatency
The average latency over a time window, measured in milliseconds.

6. maxConcurrency
The calculated maximum concurrency value for the current service provider.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/f40e48ebdb49648cf942714609808c52.svg)

##### Algorithm Implementation
When the server receives a request, it first checks whether the CPU usage exceeds 50%. If not, the request is accepted for processing. If it does exceed 50%, the current maxConcurrency value is obtained from the HeuristicSmoothingFlowControl algorithm. If the currently processed request count exceeds maxConcurrency, the request is rejected.

#### AutoConcurrencyLimier
##### Related Metrics
1. MaxExploreRatio
Default set to 0.3.
2. MinExploreRatio
Default set to 0.06.
3. SampleWindowSizeMs
The duration of the sampling window, defaulting to 1000 milliseconds.
4. MinSampleCount
The minimum request count for the sampling window, defaulting to 40.
5. MaxSampleCount
The maximum request count for the sampling window, defaulting to 500.
6. emaFactor
Smoothing processing parameter, defaulting to 0.1.
7. exploreRatio
Exploration rate, initially set to MaxExploreRatio.
If avgLatency <= noLoadLatency * (1.0 + MinExploreRatio) or qps >= maxQPS * (1.0 + MinExploreRatio),
then exploreRatio = min(MaxExploreRatio, exploreRatio + 0.02);
Otherwise,
exploreRatio = max(MinExploreRatio, exploreRatio - 0.02).

8. maxQPS
The maximum QPS within the window period.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/d5cf045bc17267befc176f3d76273267.svg)
9. noLoadLatency
![img](/imgs/overview/reference/proposals/heuristic-flow-control/8c700211f5c7a13403e3088df9cd9f43.svg)
10. halfSampleIntervalMs
Half sampling interval, defaulting to 25000 milliseconds.
11. resetLatencyUs
The timestamp for resetting all values next time, including the values within the window and noLoadLatency. Measured in microseconds and initialized to 0.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/1af4a6134ede96985302ee8a27f93df7.svg)
12. remeasureStartUs
The starting time for resetting the window next time.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/c7da904b9a4c890456499b09d01938d3.svg)
13. startSampleTimeUs
The starting time for sampling, measured in microseconds.
14. sampleCount
The number of requests within the current sampling window.
15. totalSampleUs
The sum of latencies for all requests within the sampling window, measured in microseconds.
16. totalReqCount
The total number of requests within the sampling window, differing from sampleCount.
17. samplingTimeUs
The timestamp of the current request's sampling, measured in microseconds.
18. latency
The latency of the current request.
19. qps
The QPS value within this time window.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/c0e8b30fc1ecf9438bc2d574fb3da8b6.svg)
20. avgLatency
The average latency within the window.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/3a3acfdb05be7d3985835d43e492d3b9.svg)
21. maxConcurrency
The maximum concurrency value calculated in the previous window for the current period.
22. nextMaxConcurrency
The next maximum concurrency value calculated for the current window.
![img](/imgs/overview/reference/proposals/heuristic-flow-control/09852cc0ef125b43a37719796cb8baae.svg)

##### Little's Law
* When the service is in a stable state: concurrency = latency * qps. This is the foundation of the adaptive traffic limiting theory.
* When requests do not overload the machine, latency remains stable, and qps and concurrency are linearly related.
* When an excessive number of requests occur in a short time, leading to service overload, concurrency will increase with latency, while qps will tend to stabilize.

##### Algorithm Implementation
The algorithm execution process of AutoConcurrencyLimier is similar to HeuristicSmoothingFlowControl. The main difference is:

AutoConcurrencyLimier is window-based. Only when a certain amount of sample data accumulates within the window will the maxConcurrency value be updated using the window data. Additionally, it uses the exploreRatio to explore the remaining capacity.

Moreover, every so often, max_concurrency will be automatically reduced for a period to handle the rise in noLoadLatency, as estimating noLoadLatency requires the service to be in a low-load state, making the reduction of maxConcurrency unavoidable.

Since max_concurrency < concurrency, the service will reject all requests, and the traffic limiting algorithm sets "emptying all the time spent waiting for queued requests" to 2 * latency, ensuring that the majority of samples for minLatency were not waiting in line.
