---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: Dubbo 提供的集群负载均衡策略
linkTitle: 负载均衡策略
title: 负载均衡
type: docs
weight: 2
---
Dubbo 提供了 client-based 服务发现与负载均衡机制，可自动检测后端服务实例变化且在不同实例间均匀的分发流量，支持 Nacos、Zookeeper、Kubernetes Service 等多种注册中心接入。

## 负载均衡
Dubbo 内置了如下负载均衡算法，结合上文提到的自动服务发现机制，消费端会自动使用 `Weighted Random LoadBalance 加权随机负载均衡策略` 选址调用。

如果要调整负载均衡算法，以下是 Dubbo 框架内置的负载均衡策略：

| 算法                        | 特性                    | 备注                                            | 配置值                                             |
| :-------------------------- | :---------------------- | :---------------------------------------------- | :---------------------------------------------- |
| Weighted Random LoadBalance           | 加权随机                | 默认算法，默认权重相同              | random (默认) |
| RoundRobin LoadBalance       | 加权轮询                | 借鉴于 Nginx 的平滑加权轮询算法，默认权重相同， | roundrobin |
| LeastActive LoadBalance      | 最少活跃优先 + 加权随机 | 背后是能者多劳的思想                           | leastactive |
| Shortest-Response LoadBalance | 最短响应优先 + 加权随机 | 更加关注响应速度                             | shortestresponse |
| ConsistentHash LoadBalance   | 一致性哈希             | 确定的入参，确定的提供者，适用于有状态请求        | consistenthash |
| P2C LoadBalance   | Power of Two Choice    | 随机选择两个节点后，继续选择“连接数”较小的那个节点。         | p2c |
| Adaptive LoadBalance   | 自适应负载均衡       | 在 P2C 算法基础上，选择二者中 load 最小的那个节点         | adaptive |

### 使用场景
- 高可用性：部署服务的多个实例以确保即使一个或多个实例失败服务保持可用，负载均衡功能可用于在这些实例之间分配传入的请求确保以负载均衡方式使用每个实例的方式，还能最大限度地降低服务停机的风险。

- 流量管理：限制指向特定服务实例的流量，以防止过载或确保公平的资源分配，负载均衡特性提供了 Round Robin、Weighted Round Robin、Random、Least Active Load Balancing 等多种负载均衡策略，可以用来实现流量控制。

- 服务划分：将一个服务划分成多个逻辑组件，每个逻辑组件可以部署在不同的实例上，使用负载平衡以确保每个分区平衡的方式在这些实例之间分配请求，同时在实例发生故障的情况下提供故障转移功能。

- 性能优化：负载平衡可用于优化服务的性能，通过跨多个实例分发请求可以利用可用的计算资源来缩短响应时间并减少延迟。
 
### 使用方式

> 只需要调整 `loadbalance` 相应取值即可，每种负载均衡策略取值请参见文档最上方表格。

Dubbo 框架支持为单个服务、服务的单个方法指定独立的负载均衡策略
#### 服务端服务级别

```xml
<dubbo:service interface="..." loadbalance="roundrobin" />
```

#### 客户端服务级别

```xml
<dubbo:reference interface="..." loadbalance="roundrobin" />
```

#### 服务端方法级别

```xml
<dubbo:service interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:service>
```

#### 客户端方法级别

```xml
<dubbo:reference interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:reference>
```

### 一致性哈希配置

默认采用第一个参数作为哈希 key，如果需要切换参数，可以指定 `hash.arguments` 属性

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<DemoService>();
// ... init
Map<String, String> parameters = new HashMap<String, String>();
parameters.put("hash.arguments", "1");
parameters.put("sayHello.hash.arguments", "0,1");
referenceConfig.setParameters(parameters);
referenceConfig.setLoadBalance("consistenthash");
referenceConfig.get();
```

