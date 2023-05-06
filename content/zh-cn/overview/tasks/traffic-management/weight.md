---
aliases:
    - /zh/overview/tasks/traffic-management/weight/
description: ""
linkTitle: 权重比例
title: 基于权重值的比例流量转发
type: docs
weight: 7
---



Dubbo 提供了基于权重的负载均衡算法，可以实现按比例的流量分布：权重高的提供者机器收到更多的请求流量，而权重低的机器收到相对更少的流量。

以基于权重的流量调度算法为基础，通过规则动态调整单个或一组机器的权重，可以在运行态改变请求流量的分布，实现动态的按比例的流量路由，这对于一些典型场景非常有用。
* 当某一组机器负载过高，通过动态调低权重可有效减少新请求流入，改善整体成功率的同时给高负载机器提供喘息之机。
* 刚刚发布的新版本服务，先通过赋予新版本低权重控制少量比例的流量进入，待验证运行稳定后恢复正常权重，并完全替换老版本。
* 服务多区域部署或非对等部署时，通过高、低权重的设置，控制不同部署区域的流量比例。

## 开始之前

* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

示例项目中，我们发布了 Order 服务 v2 版本，并在 v2 版本中优化了下单体验：用户订单创建完成后，显示订单收货地址信息。

![weight2.png](/imgs/v3/tasks/weight/weight2.png)

现在如果你体验疯狂下单 (不停的点击 "Buy Now")，会发现 v1 与 v2 总体上是 50% 概率出现，说明两者目前具有相同的默认权重。但我们为了保证商城系统整体稳定性，接下来会先控制引导 20% 流量到 v2 版本，80% 流量依然访问 v1 版本。

![weight1.png](/imgs/v3/tasks/weight/weight1.png)

### 实现 Order 服务 80% v1 、20% v2 的流量分布
在调整权重前，首先我们要知道 Dubbo 实例的权重 (weight) 都是绝对值，每个实例的默认权重 (weight) 是 100。举个例子，如果一个服务部署有两个实例：实例 A 权重值为 100，实例 B 权重值为 200，则 A 和 B 收到的流量分布为 1:2。

接下来，我们就开始调整订单服务访问 v1 和 v2 的流量比例，订单创建服务由 `org.apache.dubbo.samples.OrderService` 接口提供，接下来通过动态规则调整新版本 `OrderService` 实例的权重值。

#### 操作步骤
1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】>【动态配置】
3. 点击 "创建"，输入要调整的 `org.apache.dubbo.samples.OrderService` 、目标实例匹配条件和权重值。

![Admin 权重比例设置截图](/imgs/v3/tasks/weight/weight_admin.png)

再次疯狂点击 "Buy Now" 尝试多次创建订单，现在大概只有 20% 的机会看到 v2 版本的订单详情信息

在确定 v2 版本的 Order 服务稳定运行后，进一步的增加 v2 权重，直到所有老版本服务都被新版本替换掉，这样就完成了一次稳定的服务版本升级。

#### 规则详解

**规则 key** ：`org.apache.dubbo.samples.UserService`

**规则体**

```yaml
configVersion: v3.0
scope: service
key: org.apache.dubbo.samples.OrderService
configs:
  - side: provider
    match:
      param:
        - key: orderVersion
          value:
            exact: v2
    parameters:
      weight: 25
```

以下匹配条件表示权重规则对所有带有 `orderVersion=v2` 标签的实例生效（Order 服务的所有 v2 版本都已经带有这个标签）。

```yaml
match:
  param:
    - key: orderVersion
      value:
        exact: v2
```

`weight: 25` 是因为 v1 版本的默认权重是 `100`，这样 v2 和 v1 版本接收到的流量就变成了 25:100 即 1:4 的比例。

```yaml
parameters:
  weight: 25
```

## 清理
为了不影响其他任务效果，通过 Admin 删除或者禁用刚刚配置的权重规则。

## 其他事项
`weight=0`