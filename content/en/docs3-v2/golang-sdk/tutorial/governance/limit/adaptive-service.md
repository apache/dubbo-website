---
title: dubbogo 3.0 flexible service
keywords: dubbogo 3.0 flexible service
description: dubbogo 3.0 flexible service
---

# Flexible load balancing (flexible service)

Flexible service is a decentralized intelligent load balancing component, and it is also one of the major new features in Dubbo-go version 3.0. Flexible services are still in the early experimental stage, and this feature will continue to be optimized in subsequent versions, and we will work with the Dubbo community to explore a set of best practices suitable for microservice scenarios.

The traditional load balancing algorithm is implemented by algorithms such as random nodes and RoundRobin. Their limitation is that they do not know the load situation of the current service provider, and the algorithm always calls different service providers with as fair a probability as possible. In practice, fairness does not mean high performance, and cluster service performance is also related to multiple factors such as service load and task complexity. In order to solve the shortcomings of traditional load balancing algorithms, Dubbo-go introduced flexible services in version 3.0, realizing dynamic capacity evaluation and distribution functions.

Capacity assessment is the core of flexible services, which can dynamically assess the capacity level of the server. In the process of capacity evaluation, the two core indicators are TPS and response time. It is necessary to balance the relationship between system utilization and system performance, so that the whole is in the best state.

- TPS reflects system utilization from the perspective of service providers. Before the system pressure is saturated, the greater the number of requests, the higher the system utilization rate. However, if the request volume is further increased until the system is oversaturated, the problem of overload occurs, resulting in a downward trend in overall efficiency.
- Response time reflects system performance from the perspective of service callers. Before the system pressure is not saturated, the response time increases linearly with the number of requests, but when the amount of requests is further increased until the system is oversaturated, the response time and the number of requests increase exponentially.

![img](/imgs/docs3-v2/golang-sdk/samples/adaptive-service/adaptive.png)


Flexible services are collected during the call

In Dubbo-go version 3.0, service flexible load balancing is supported. In the microservice scenario, the client will collect the hardware resource consumption of the downstream server instance of the service during the invocation process, and select the most suitable downstream instance for invocation through capacity evaluation and screening strategies, thereby improving the overall system performance.

Service flexibility will continue to be optimized in subsequent iterations, seeking to explore best practices with the Dubbo community.

