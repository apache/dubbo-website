---
aliases:
    - /en/overview/core-features/load-balance/
    - /en/overview/core-features/load-balance/
description: Load Balancing
linkTitle: Load Balancing
title: Load Balancing
type: docs
weight: 3
---



When it comes to cluster load balancing, Dubbo provides multiple balancing strategies, with the default being `weighted random`, a weighted random load balancing strategy.

In terms of implementation, Dubbo provides client-side load balancing, meaning the Consumer determines which Provider instance to submit the request to using a load balancing algorithm.

## Load Balancing Strategies
Currently, Dubbo has the following built-in load balancing algorithms, which can be enabled by adjusting configuration items.

| Algorithm                        | Features                    | Remarks                                            |
| :-------------------------- | :---------------------- | :---------------------------------------------- |
| Weighted Random LoadBalance           | Weighted Random                | Default algorithm, default weights are equal              |
| RoundRobin LoadBalance       | Weighted Round Robin                | Inspired by Nginx's smooth weighted round-robin algorithm, default weights are equal, |
| LeastActive LoadBalance      | Least Active First + Weighted Random | Based on the idea of rewarding the more capable                           |
| Shortest-Response LoadBalance | Shortest Response First + Weighted Random | Focuses more on response speed                             |
| ConsistentHash LoadBalance   | Consistent Hash             | Deterministic input, deterministic provider, suitable for stateful requests        |
| P2C LoadBalance   | Power of Two Choice    | Randomly selects two nodes, then chooses the one with the smaller "number of connections".         |
| Adaptive LoadBalance   | Adaptive Load Balancing       | Based on the P2C algorithm, selects the node with the smallest load among the two         |

### Weighted Random

* **Weighted Random**, sets random probability based on weight.
* High collision probability in a single section, but the larger the number of calls, the more evenly distributed it becomes. Using weights probabilistically also becomes more even, which is beneficial for dynamically adjusting provider weights.
* Disadvantage: There is an issue of slow providers accumulating requests. For example, the second machine is very slow but not down. When a request is routed to the second machine, it gets stuck there. Over time, all requests get stuck on the second machine.

### RoundRobin
* **Weighted Round Robin**, sets the round-robin ratio based on the agreed weight, and cycles through the nodes.
* Disadvantage: Similarly, there is an issue of slow providers accumulating requests.

During weighted round-robin, if a node's weight is too large, there can be an issue of calls being overly concentrated in a certain period.
For example, if the weights of nodes A, B, and C are as follows: `{A: 3, B: 2, C: 1}`
Then according to the most primitive round-robin algorithm, the call process will become: `A A A B B C`

To address this, Dubbo has optimized this by borrowing from Nginx's smooth weighted round-robin algorithm. The call process can be abstracted into the following table:

| Pre-round Sum Weights        | Winner of This Round | Total Weight | Post-round Weights (Winner's weight minus total weight) |
| :------------------ | :------- | :------- | :--------------------------- |
| Initial Round              | \        | \        | `A(0), B(0), C(0)`           |
| `A(3), B(2), C(1)`  | A        | 6        | `A(-3), B(2), C(1)`          |
| `A(0), B(4), C(2)`  | B        | 6        | `A(0), B(-2), C(2)`          |
| `A(3), B(0), C(3)`  | A        | 6        | `A(-3), B(0), C(3)`          |
| `A(0), B(2), C(4)`  | C        | 6        | `A(0), B(2), C(-2)`          |
| `A(3), B(4), C(-1)` | B        | 6        | `A(3), B(-2), C(-1)`         |
| `A(6), B(0), C(0)`  | A        | 6        | `A(0), B(0), C(0)`           |

We found that after a total of weighted rounds (3+2+1), the cycle returns to the starting point. Throughout the process, the node traffic is smooth, and even within a very short time period, the probability is distributed as expected.

If users have a need for weighted round-robin, they can use this algorithm with confidence.

### LeastActive
* **Weighted Least Active Call First**, the lower the active count, the higher the priority of the call. For the same active count, weighted random is used. The active count refers to the difference in count before and after the call (for a specific provider: request sent count - response returned count), indicating the task backlog of a specific provider. The lower the active count, the stronger the processing capability of the provider.
* Slower providers receive fewer requests because the count difference before and after the call for slower providers will be larger; conversely, nodes with stronger processing capabilities handle more requests.

### ShortestResponse
* **Weighted Shortest Response First**, in the most recent sliding window, the shorter the response time, the higher the priority of the call. For the same response time, weighted random is used.
* Providers with faster response times handle more requests.
* Disadvantage: It may cause traffic to be overly concentrated on high-performance nodes.

The response time here = the average response time of a provider within the window time, with the default window time being 30s.

### ConsistentHash
* **Consistent Hash**, requests with the same parameters are always sent to the same provider.
* When a provider goes down, the requests originally sent to that provider are distributed to other providers based on virtual nodes, without causing drastic changes.
* For the algorithm, see: [Consistent Hashing | WIKIPEDIA](http://en.wikipedia.org/wiki/Consistent_hashing)
* By default, only the first parameter is hashed. To modify, configure `<dubbo:parameter key="hash.arguments" value="0,1" />`
* By default, 160 virtual nodes are used. To modify, configure `<dubbo:parameter key="hash.nodes" value="320" />`

### P2C Load Balance
The Power of Two Choice algorithm is simple yet classic, with the main idea as follows:

1. For each call, make two random selections from the list of available providers, selecting two nodes: providerA and providerB.
2. Compare providerA and providerB, and choose the node with the smaller "current number of connections being processed."

Here is the [Dubbo P2C Algorithm Implementation Proposal](../../reference/proposals/heuristic-flow-control/)

### Adaptive Load Balance
Adaptive load balancing is an algorithm that automatically adjusts traffic distribution based on the load of backend instances. It always tries to forward requests to the node with the least load.

Here is the [Dubbo Adaptive Algorithm Implementation Proposal](../../reference/proposals/heuristic-flow-control/)

## Configuration Method
Dubbo supports configuring the default load balancing strategy on the provider side, so all consumers will use the provider-specified load balancing strategy by default. Consumers can configure the load balancing strategy they want to use. If neither is configured, the default random load balancing strategy is used.

Within the same application, different services can be configured to use different load balancing strategies, and different methods of the same service can be configured to use different load balancing strategies.

For specific configuration methods, refer to the following multi-language implementations:

* [Java](../../mannual/java-sdk/advanced-features-and-usage/performance/loadbalance/)
* [Golang](../../mannual/golang-sdk/)

## Custom Extension
Load balancing strategies support custom extension implementations. For details, see [Dubbo Extensibility](../extensibility)
