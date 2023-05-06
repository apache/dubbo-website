---
description: 自适应限流
linkTitle: 自适应限流
title: 自适应限流
type: docs
weight: 28
---

自适应限流的设计与实现思路请参考 [Dubbo 自适应限流功能](../../../../../reference/proposals/heuristic-flow-control/)。

## 使用方式

设置方法与静态的最大并发值设置类似，只需在服务端设置 flowcontrol 参数即可，可选值有以下两种：
* heuristicSmoothingFlowControl。当服务端收到一个请求时，首先判断CPU的使用率是否超过50%。如果没有超过50%，则接受这个请求进行处理。如果超过50%，说明当前的负载较高，便从 HeuristicSmoothingFlowControl 算法中获得当前的 maxConcurrency 值。如果当前正在处理的请求数量超过了 maxConcurrency，则拒绝该请求。
* autoConcurrencyLimier。与 HeuristicSmoothingFlowControl 的最大区别是，AutoConcurrencyLimier 是基于窗口的，每当窗口内积累了一定量的采样数据时，才利用窗口内的数据来更新得到 maxConcurrency，其次，利用exploreRatio来对剩余的容量进行探索。

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

