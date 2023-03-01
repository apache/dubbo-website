---
aliases:
    - /zh/docs/advanced/loadbalance/
description: Dubbo 提供的集群负载均衡策略
linkTitle: 负载均衡
title: 负载均衡
type: docs
weight: 3
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/loadbalance/)。
{{% /pageinfo %}}

在集群负载均衡时，Dubbo 提供了多种均衡策略，缺省为 `random` 随机调用。

具体实现上，Dubbo 提供的是客户端负载均衡，即由 Consumer 通过负载均衡算法得出需要将请求提交到哪个 Provider 实例。

可以自行扩展负载均衡策略，参见：[负载均衡扩展](../../references/spis/load-balance)

## 负载均衡策略
目前 Dubbo 内置了如下负载均衡算法，用户可直接配置使用：

| 算法                        | 特性                    | 备注                                            |
| :-------------------------- | :---------------------- | :---------------------------------------------- |
| RandomLoadBalance           | 加权随机                | 默认算法，默认权重相同                          |
| RoundRobinLoadBalance       | 加权轮询                | 借鉴于 Nginx 的平滑加权轮询算法，默认权重相同， |
| LeastActiveLoadBalance      | 最少活跃优先 + 加权随机 | 背后是能者多劳的思想                            |
| ShortestResponseLoadBalance | 最短响应优先 + 加权随机 | 更加关注响应速度                                |
| ConsistentHashLoadBalance   | 一致性 Hash             | 确定的入参，确定的提供者，适用于有状态请求      |



### Random

* **加权随机**，按权重设置随机概率。
* 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有利于动态调整提供者权重。
* 缺点：存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上。

### RoundRobin
* **加权轮询**，按公约后的权重设置轮询比率，循环调用节点
* 缺点：同样存在慢的提供者累积请求的问题。

加权轮询过程过程中，如果某节点权重过大，会存在某段时间内调用过于集中的问题。  
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

## 配置

### 服务端服务级别

```xml
<dubbo:service interface="..." loadbalance="roundrobin" />
```

### 客户端服务级别

```xml
<dubbo:reference interface="..." loadbalance="roundrobin" />
```

### 服务端方法级别

```xml
<dubbo:service interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:service>
```

### 客户端方法级别

```xml
<dubbo:reference interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:reference>
```
