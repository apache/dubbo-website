---
type: docs
title: "Load Balance"
linkTitle: "Load Balance"
weight: 3
description: "Load Balance in Apache Dubbo 3.x"
---

Dubbo offers a number of balancing strategies for cluster load balancing, which defaults to `random`.

You can extend the load balancing strategy by yourself, see: [LoadBalance extension](../../v2.7/dev/impls/load-balance/)

## LoadBalance strategy

### Random LoadBalance

* **Ramdom**, set random probabilities by weight.

* The probability of collisions on one section is high, but the larger the amount of calls, the more uniform the distribution. And when use weight based on probability the distribution turns out to be uniform, which also helps to dynamically adjust the provider weights.

### RoundRobin LoadBalance

* **RoundRobin**, use the weight's common advisor to determine round robin ratio.

* Traffic flow to slower providers may cause requests piled up, e.g., if there's a provider processing requests in a very slow speed, but it's still alive, which means it can receive request as normal. According to RoundRobin policy, consumers will continuously send requests to this provider on predetermined pace, have no aware of the provider's bad status. Finally, we will get many requests stuck on this unhealthy provider.

### LeastActive LoadBalance

* **LeastActive**, a random mechanism based on actives, `actives` means the num of requests a consumer have sent but not return yet。

* Slower providers will receive fewer requests, cause slower provider have higher `actives`.

### ConsistentHash LoadBalance

* **ConsistentHash**, the provider always receive the same parameters of the request.

* When a provider fails, the original request to the provider, based on the virtual node algorithm, averages to other providers, does not cause drastic changes.

* Algorithm reference：http://en.wikipedia.org/wiki/Consistent_hashing

* By default only the first parameter Hash, if you want to modify, please configure `<dubbo:parameter key="hash.arguments" value="0,1" />`

* By default 160 virtual nodes, if you want to modify, please configure `<dubbo:parameter key="hash.nodes" value="320" />`

See the algorithm at http://en.wikipedia.org/wiki/Consistent_hashing

### ShortestResponse LoadBalance

* Give priority to the shorter response time of the current interval of time. If there are multiple invokers and the same weight, then randomly is called.

* Providers with faster response times can handle more requests.

* Disadvantages: It may cause traffic to be too concentrated on high-performance nodes.

* The response time is the average response time of providers in the interval of time. The interval of time is 30 seconds by default.

## Configuration

### Server Service Level and Client Service Level

```xml
<dubbo:service interface="..." loadbalance="roundrobin" />
```

### Server Method Level and Client Method Level

```xml
<dubbo:service interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:service>
```