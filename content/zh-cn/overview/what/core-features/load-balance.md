---
aliases:
    - /zh/overview/core-features/load-balance/
    - /zh-cn/overview/core-features/load-balance/
description: 负载均衡
linkTitle: 负载均衡
title: 负载均衡
type: docs
weight: 3
---



在集群负载均衡时，Dubbo 提供了多种均衡策略，缺省为 `weighted random` 基于权重的随机负载均衡策略。

具体实现上，Dubbo 提供的是客户端负载均衡，即由 Consumer 通过负载均衡算法得出需要将请求提交到哪个 Provider 实例。

## 负载均衡策略
目前 Dubbo 内置了如下负载均衡算法，可通过调整配置项启用。

| 算法                        | 特性                    | 备注                                            |
| :-------------------------- | :---------------------- | :---------------------------------------------- |
| Weighted Random LoadBalance           | 加权随机                | 默认算法，默认权重相同              |
| RoundRobin LoadBalance       | 加权轮询                | 借鉴于 Nginx 的平滑加权轮询算法，默认权重相同， |
| LeastActive LoadBalance      | 最少活跃优先 + 加权随机 | 背后是能者多劳的思想                           |
| Shortest-Response LoadBalance | 最短响应优先 + 加权随机 | 更加关注响应速度                             |
| ConsistentHash LoadBalance   | 一致性哈希             | 确定的入参，确定的提供者，适用于有状态请求        |
| P2C LoadBalance   | Power of Two Choice    | 随机选择两个节点后，继续选择“连接数”较小的那个节点。         |
| Adaptive LoadBalance   | 自适应负载均衡       | 在 P2C 算法基础上，选择二者中 load 最小的那个节点         |

### Weighted Random

* **加权随机**，按权重设置随机概率。
* 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有利于动态调整提供者权重。
* 缺点：存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上。

### RoundRobin
* **加权轮询**，按公约后的权重设置轮询比率，循环调用节点
* 缺点：同样存在慢的提供者累积请求的问题。

加权轮询过程中，如果某节点权重过大，会存在某段时间内调用过于集中的问题。
例如 ABC 三节点有如下权重：`{A: 3, B: 2, C: 1}`
那么按照最原始的轮询算法，调用过程将变成：`A A A B B C`

对此，Dubbo 借鉴 Nginx 的平滑加权轮询算法，对此做了优化，调用过程可抽象成下表:

| 轮前加和权重        | 本轮胜者 | 合计权重 | 轮后权重（胜者减去合计权重） |
| :------------------ | :------- | :------- | :--------------------------- |
| 起始轮              | \        | \        | `A(0), B(0), C(0)`           |
| `A(3), B(2), C(1)`  | A        | 6        | `A(-3), B(2), C(1)`          |
| `A(0), B(4), C(2)`  | B        | 6        | `A(0), B(-2), C(2)`          |
| `A(3), B(0), C(3)`  | A        | 6        | `A(-3), B(0), C(3)`          |
| `A(0), B(2), C(4)`  | C        | 6        | `A(0), B(2), C(-2)`          |
| `A(3), B(4), C(-1)` | B        | 6        | `A(3), B(-2), C(-1)`         |
| `A(6), B(0), C(0)`  | A        | 6        | `A(0), B(0), C(0)`           |

我们发现经过合计权重（3+2+1）轮次后，循环又回到了起点，整个过程中节点流量是平滑的，且哪怕在很短的时间周期内，概率都是按期望分布的。

如果用户有加权轮询的需求，可放心使用该算法。

### LeastActive
* **加权最少活跃调用优先**，活跃数越低，越优先调用，相同活跃数的进行加权随机。活跃数指调用前后计数差（针对特定提供者：请求发送数 - 响应返回数），表示特定提供者的任务堆积量，活跃数越低，代表该提供者处理能力越强。
* 使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大；相对的，处理能力越强的节点，处理更多的请求。

### ShortestResponse
* **加权最短响应优先**，在最近一个滑动窗口中，响应时间越短，越优先调用。相同响应时间的进行加权随机。
* 使得响应时间越快的提供者，处理更多的请求。
* 缺点：可能会造成流量过于集中于高性能节点的问题。

这里的响应时间 = 某个提供者在窗口时间内的平均响应时间，窗口时间默认是 30s。


### ConsistentHash
* **一致性 Hash**，相同参数的请求总是发到同一提供者。
* 当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起剧烈变动。
* 算法参见：[Consistent Hashing | WIKIPEDIA](http://en.wikipedia.org/wiki/Consistent_hashing)
* 缺省只对第一个参数 Hash，如果要修改，请配置 `<dubbo:parameter key="hash.arguments" value="0,1" />`
* 缺省用 160 份虚拟节点，如果要修改，请配置 `<dubbo:parameter key="hash.nodes" value="320" />`

### P2C Load Balance
Power of Two Choice 算法简单但是经典，主要思路如下：

1. 对于每次调用，从可用的provider列表中做两次随机选择，选出两个节点providerA和providerB。
2. 比较providerA和providerB两个节点，选择其“当前正在处理的连接数”较小的那个节点。

以下是 [Dubbo P2C 算法实现提案](../../reference/proposals/heuristic-flow-control/#p2c算法)

### Adaptive Load Balance
Adaptive 即自适应负载均衡，是一种能根据后端实例负载自动调整流量分布的算法实现，它总是尝试将请求转发到负载最小的节点。

以下是 [Dubbo Adaptive 算法实现提案](../../reference/proposals/heuristic-flow-control/#adaptive算法)

## 配置方式
Dubbo 支持在服务提供者一侧配置默认的负载均衡策略，这样所有的消费者都将默认使用提供者指定的负载均衡策略，消费者可以自己配置要使用的负载均衡策略，如果都没有任何配置，
则默认使用随机负载均衡策略。

同一个应用内支持配置不同的服务使用不同的负载均衡策略，支持为同一服务的不同方法配置不同的负载均衡策略。

具体配置方式参加以下多语言实现

* [Java](../../mannual/java-sdk/advanced-features-and-usage/performance/loadbalance/#使用方式)
* [Golang](../../mannual/golang-sdk/)

## 自定义扩展
负载均衡策略支持自定义扩展实现，具体请参见 [Dubbo 可扩展性](../extensibility)
