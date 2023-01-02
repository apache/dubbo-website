---
type: docs
title: "Load Balancing"
linkTitle: "Load Balancing"
weight: 3
description: "Cluster load balancing strategy provided by Dubbo"
---

When cluster load balancing, Dubbo provides a variety of balancing strategies, the default is `random` random calls.

In terms of specific implementation, Dubbo provides client load balancing, that is, the Consumer uses the load balancing algorithm to determine which Provider instance to submit the request to.

You can expand the load balancing strategy by yourself, see: [Load Balance Extension](../../../reference-manual/spi/description/load-balance)

## load balancing strategy
Currently Dubbo has the following built-in load balancing algorithms, which users can directly configure and use:

| Algorithms | Features | Remarks |
| :-------------------------- | :-------------------- -- | :---------------------------------------------- |
| RandomLoadBalance | Weighted random | Default algorithm, same weight by default |
| RoundRobinLoadBalance | Weighted round-robin | Based on Nginx's smooth weighted round-robin algorithm, the default weight is the same, |
| LeastActiveLoadBalance | Least Active Priority + Weighted Random | Behind it is the idea that those who can do more work |
| ShortestResponseLoadBalance | Shortest Response First + Weighted Random | More focus on response speed |
| ConsistentHashLoadBalance | Consistent Hash | Definite input parameters, definite provider, suitable for stateful requests |



### Random

* **Weighted random**, set random probability by weight.
* The probability of collision on a section is high, but the greater the call volume, the more uniform the distribution, and the weight is also more uniform after using the probability, which is conducive to dynamically adjusting the provider weight.
* Disadvantages: There is a problem of accumulating requests from slow providers. For example: the second machine is very slow, but it is not hung up. When the request is transferred to the second machine, it is stuck there. Over time, all requests are stuck in the second machine. on stage.

### RoundRobin
* **Weighted polling**, set the polling ratio according to the weight after the convention, and call the node cyclically
* Disadvantage: There is also the problem of accumulating requests for slow providers.

During the weighted round-robin process, if the weight of a node is too large, there will be a problem of too concentrated calls within a certain period of time.
For example, ABC three nodes have the following weights: `{A: 3, B: 2, C: 1}`
Then according to the most primitive polling algorithm, the calling process will become: `A A A B B C`

In this regard, Dubbo has optimized it by referring to Nginx's smooth weighted round-robin algorithm. The calling process can be abstracted into the following table:

| Pre-round sum weight | Current round winner | Total weight | Post-round weight (winner minus total weight) |
| :------------------ | :------- | :------- | :---------- ----------------- |
| Starting round | \ | \ | `A(0), B(0), C(0)` |
| `A(3), B(2), C(1)` | A | 6 | `A(-3), B(2), C(1)` |
| `A(0), B(4), C(2)` | B | 6 | `A(0), B(-2), C(2)` |
| `A(3), B(0), C(3)` | A | 6 | `A(-3), B(0), C(3)` |
| `A(0), B(2), C(4)` | C | 6 | `A(0), B(2), C(-2)` |
| `A(3), B(4), C(-1)` | B | 6 | `A(3), B(-2), C(-1)` |
| `A(6), B(0), C(0)` | A | 6 | `A(0), B(0), C(0)` |

We found that after the total weight (3+2+1) rounds, the cycle returns to the starting point, the node traffic is smooth throughout the process, and even in a short period of time, the probability is distributed according to expectations.

If users have the requirement of weighted polling, they can use this algorithm with confidence.

### LeastActive
* **Weighted least active call priority**, the lower the active number, the higher the priority call, the same active number will be weighted randomly. The active number refers to the count difference before and after the call (for a specific provider: the number of requests sent - the number of responses returned), which indicates the amount of tasks accumulated by a specific provider. The lower the active number, the stronger the processing capability of the provider.
* Make the slow provider receive fewer requests, because the slower the provider, the greater the count difference before and after the call; relatively, the node with the stronger processing capacity can handle more requests.

###ShortestResponse
* **Weighted Shortest Response Priority**, in the latest sliding window, the shorter the response time, the higher the priority to call. The same response time is weighted randomly.
* Make providers with faster response times handle more requests.
* Disadvantage: It may cause traffic to be too concentrated on high-performance nodes.

Response time here = the average response time of a provider within the window time, and the default window time is 30s.


###ConsistentHash
* **Consistent Hash**, requests with the same parameters are always sent to the same provider.
* When a certain provider is down, the request originally sent to the provider will be spread to other providers based on the virtual node, and will not cause drastic changes.
* Algorithm see: [Consistent Hashing | WIKIPEDIA](http://en.wikipedia.org/wiki/Consistent_hashing)
* By default only the first parameter Hash, if you want to modify, please configure `<dubbo:parameter key="hash.arguments" value="0,1" />`
* 160 virtual nodes are used by default, if you want to modify, please configure `<dubbo:parameter key="hash.nodes" value="320" />`

## configuration

### Server service level

```xml
<dubbo:service interface="..." loadbalance="roundrobin" />
```

### Client service level

```xml
<dubbo:reference interface="..." loadbalance="roundrobin" />
```

### Server method level

```xml
<dubbo:service interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:service>
```

### Client method level

```xml
<dubbo:reference interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:reference>
```