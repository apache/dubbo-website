---
description: 自适应限流
linkTitle: 自适应限流
title: 自适应限流
type: docs
weight: 28
---
## 功能说明
自适应限流的设计与实现思路请参考 [Dubbo 自适应限流功能](../../../../../reference/proposals/heuristic-flow-control/)。自适应限流能够确保分布式系统稳定性和可靠性，例如在服务提供商资源有限且多变的场景下。

## 使用场景
- 服务降级预防：当服务提供者因资源耗尽而性能下降时，使用自适应限流暂时减少其接受的请求数直至恢复正常。

- 峰值流量处理：当服务流量突然激增时，自适应流量限制可以通过动态减少接受的请求数量来帮助防止服务过载。

- 不可预测流量处理：服务提供商可能会遇到不可预测的流量，第三方应用程序使用服务时可能会偶尔产生流量，自适应流量限制可以根据当前系统负载调整允许的最大并发请求数并防止过载。

## 使用方式

设置方法与静态的最大并发值设置类似，只需在服务端设置 flowcontrol 参数即可，可选值有以下两种：
* heuristicSmoothingFlowControl。当服务端收到一个请求时，首先判断CPU的使用率是否超过50%。如果没有超过50%，则接受这个请求进行处理。如果超过50%，说明当前的负载较高，便从 HeuristicSmoothingFlowControl 算法中获得当前的 maxConcurrency 值。如果当前正在处理的请求数量超过了 maxConcurrency，则拒绝该请求。
* autoConcurrencyLimiter。与 HeuristicSmoothingFlowControl 的最大区别是，AutoConcurrencyLimiter 是基于窗口的，每当窗口内积累了一定量的采样数据时，才利用窗口内的数据来更新得到 maxConcurrency，其次，利用exploreRatio来对剩余的容量进行探索。

> 在确保服务端存在多个节点，并且消费端开启重试策略的前提下，限流功能才能更好的发挥作用。

### 示例一：使用 heuristicSmoothingFlowControl 自适应限流算法

```properties
dubbo.provider.flowcontrol=heuristicSmoothingFlowControl
```

```xml
<dubbo:provider flowcontrol="heuristicSmoothingFlowControl" />
```

### 示例二：使用 autoConcurrencyLimiter 自适应限流算法
```properties
dubbo.provider.flowcontrol=autoConcurrencyLimiter
```

```xml
<dubbo:provider flowcontrol="autoConcurrencyLimiter" />
```

### 示例三：设置服务粒度的 heuristicSmoothingFlowControl 自适应限流

```xml
<dubbo:service interface="com.foo.BarService" flowcontrol="heuristicSmoothingFlowControl" />
```

