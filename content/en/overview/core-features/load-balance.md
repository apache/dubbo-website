---
description: Load Balancing
linkTitle: Load Balancing
title: Load Balancing
type: docs
weight: 20
---

During cluster load balancing, Dubbo provides multiple balancing strategies, with the default being the `weighted random` strategy, which is a weight-based random load balancing strategy.

In terms of implementation, Dubbo provides client-side load balancing, meaning the Consumer determines which Provider instance to send the request to using a load balancing algorithm.

## Load Balancing Strategies
Currently, Dubbo has built-in the following load balancing algorithms, which can be enabled through configuration adjustments.

| Algorithm                        | Characteristics          | Remarks                                                         |
| :------------------------------- | :----------------------- | :-------------------------------------------------------------- |
| Weighted Random LoadBalance      | Weighted Random          | Default algorithm, default weights are the same.                |
| RoundRobin LoadBalance           | Weighted Round Robin     | Inspired by Nginx's smooth weighted round-robin algorithm.      |
| LeastActive LoadBalance          | Least Active + Weighted Random | The principle of "the more capable, the more work".          |
| Shortest-Response LoadBalance    | Shortest Response + Weighted Random | Focuses more on response speed.                       |
| ConsistentHash LoadBalance       | Consistent Hashing       | Deterministic parameters lead to a deterministic provider, suitable for stateful requests.|
| P2C LoadBalance                  | Power of Two Choice      | After randomly selecting two nodes, choose the one with fewer "connections".|
| Adaptive LoadBalance             | Adaptive Load Balancing  | Based on P2C algorithm, chooses the node with the least load. |

### Weighted Random
* **Weighted Random**: The probability of random selection is set according to the weight.
* There's a high collision probability on a cross-section, but as the call volume grows, the distribution becomes more even. After probability-based weighting, it's also fairly even, which facilitates dynamic adjustment of provider weights.
* Downside: There's the problem of slow providers accumulating requests.

### RoundRobin
* **Weighted Round Robin**: Calls nodes in a circular manner based on proportionate weights.
* Downside: There's the problem of slow providers accumulating requests.

For the weighted round robin, if a node's weight is too large, there's the problem of concentrated calls in a short time span.

### LeastActive
* **Weighted Least Active**: The provider with the fewest active calls is preferred. The fewer the active calls, the stronger the provider's processing ability.
* This ensures slower providers receive fewer requests, as slower providers will have a larger difference between requests sent and responses received.

### ShortestResponse
* **Weighted Shortest Response**: Providers with faster response times handle more requests.
* Downside: This might lead to traffic concentrating too much on high-performance nodes.

### ConsistentHash
* **Consistent Hashing**: Requests with the same parameters are always sent to the same provider.
* When a provider fails, the requests originally directed to that provider are spread across other providers based on virtual nodes, without causing major disruption.
* For details, refer to: [Consistent Hashing | WIKIPEDIA](http://en.wikipedia.org/wiki/Consistent_hashing)

### P2C Load Balance
The Power of Two Choice algorithm is simple but classic.

### Adaptive Load Balance
Adaptive, as the name suggests, is a self-adapting load balancing mechanism that always tries to forward requests to the least loaded node.

## Configuration
Dubbo allows providers to configure a default load balancing strategy so that all consumers will use the strategy specified by the provider by default. Consumers can also specify their own load balancing strategies. If neither side has any configuration, the random load balancing strategy is used by default.

Each application can configure different services to use different load balancing strategies and can even specify different strategies for different methods of the same service.

For configuration details, refer to the implementations in different languages:
* [Java](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/loadbalance/)
* [Golang](/zh-cn/overview/mannual/golang-sdk/)

## Custom Extensions
Load balancing strategies support custom extension implementations. For details, please see [Dubbo's Extensibility](/en/overview/core-features/extensibility/).