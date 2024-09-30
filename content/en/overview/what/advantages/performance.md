---
aliases:
    - /en/overview/what/advantages/performance/
description: Ultra-high performance
linkTitle: Ultra-high performance
title: Ultra-high performance
type: docs
weight: 2
---


Dubbo is designed to address Alibaba's large-scale e-commerce microservice cluster practices and has been tested in tens of thousands to millions of microservice practices in leading enterprises across various industries over the years. Therefore, Dubbo has unparalleled advantages in communication performance and stability, making it very suitable for building nearly infinitely scalable microservice clusters. This is also a significant advantage of Dubbo over many similar products in the industry from a practical perspective.

## High-performance data transmission
Dubbo natively supports two high-performance communication protocols: Dubbo2 and Triple. Among them:
* Dubbo2 is a binary private RPC communication protocol built on top of the TCP transport protocol. It is a very simple, compact, and efficient communication protocol.
* Triple is a new generation RPC communication protocol based on HTTP/2, which has advantages in gateway penetration, generality, and streaming communication. Triple is fully compatible with the gRPC protocol.

Below are the benchmark data based on Dubbo 3.2 version. You can also perform your own benchmarking through the [dubbo-benchmark](https://github.com/apache/dubbo-benchmark) project.

### TCP protocol benchmark

Compared to Dubbo 2.x and early 3.x versions:
* In smaller message scenarios like createUser and getUser, the improvement rate is about 180%.
* In extremely small message scenarios like existUser (only a boolean value), the improvement rate is about 24%.
* In larger message scenarios like listUser, the improvement rate is the highest, reaching 1000%!

![dubbo-rpc-protocol-benchmark](/imgs/v3/performance/rpc-dubbo.png)

### Triple protocol benchmark

* In smaller message scenarios like createUser, existUser, and getUser, the performance improvement is about 40-45% compared to version 3.1, and the improved performance is almost on par with gRPC in the same scenarios.
* In larger message scenarios like listUser, the improvement is about 17% compared to version 3.1, which is 11% lower than gRPC in the same scenario.

![dubbo-http2-protobuf-benchmark](/imgs/v3/performance/rpc-triple.png)

Learn more
* [Communication Protocols](../../../core-features/protocols)
* [Benchmark Metrics (periodically updated)](https://github.com/apache/dubbo/issues/10558#issuecomment-1473015636)

## Building scalable microservice clusters
Business growth brings rapid growth in cluster size, and the growth in cluster size poses challenges to the service governance architecture:
* Storage capacity bottleneck of the registry center
* Decreased efficiency in address pushing and parsing due to dynamic changes in nodes
* Resource overhead of storing a large number of network addresses on the consumer side
* Complex network link management
* Lossless online and offline traffic during peak periods
* Automatic node management of abnormal nodes

The above issues are directly related to the stability of the microservice cluster, so they can easily become bottlenecks affecting cluster and business growth. The larger the cluster size, the more amplified the impact of these issues. Many developers might think that they only have a few applications and currently do not need to worry about cluster size. However, as a key factor in technical architecture selection, we must fully consider the future scalability of the microservice cluster. Based on extensive research on microservice architectures and framework implementations in the industry, some products' performance bottlenecks may arrive quickly (the threshold for efficiently supporting bottleneck nodes in some products is relatively low, such as dozens of applications and hundreds of nodes).

Dubbo's advantage lies in its nearly infinite horizontal scalability of cluster size. Verified by the practice of trillions of calls in Alibaba's Double 11 scenario, understand the principles behind Dubbo's construction of production-ready, scalable large-scale microservice clusters through the following content:
* [Dubbo3 Service Discovery](../../../core-features/service-discovery/)
* [Traffic Control](../../../core-features/traffic/)

## Intelligent traffic scheduling
Dubbo3 has built-in implementations of rate limiting and scheduling algorithms that can adaptively sense the cluster load status and intelligently adjust traffic distribution. From the perspectives of both consumers and providers, it intelligently adjusts traffic distribution to ensure that traffic is scheduled to instances with the best processing capabilities, thereby improving the throughput and stability of the entire cluster.

### Adaptive load balancing
Adaptive load balancing considers how to allocate requests to the machine instances with the best processing capabilities from the consumer's perspective. Dubbo3 introduces two new load balancing algorithms:
* One is the simple `P2C` algorithm based on fairness considerations.
* The other is the adaptive method `adaptive`, which attempts to adaptively measure the throughput capacity of provider-side machines and then allocate traffic to machines with high throughput capacity as much as possible to improve the overall performance of the system.

### Adaptive Rate Limiting
Unlike load balancing, which operates on the consumer side, rate limiting functions on the provider side. Its purpose is to limit the maximum number of concurrent tasks that a provider instance can handle. Theoretically, the processing capacity of a server machine has an upper limit. Therefore, when the number of concurrent requests reaches or approaches this limit, rejecting some requests is actually a better choice. Compared to manually setting a static maximum concurrency value in advance, the adaptive rate limiting algorithm can dynamically adjust the maximum concurrency value of the server machine, allowing it to handle as many incoming requests as possible without overloading the machine.

For more details, please refer to the [Dubbo3 Service Resilience Design Document](../../../reference/proposals/heuristic-flow-control)
