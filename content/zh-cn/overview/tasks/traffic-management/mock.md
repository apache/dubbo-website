---
aliases:
    - /zh/overview/tasks/traffic-management/mock/
description: ""
linkTitle: 服务降级
title: 在大促之前对弱依赖调用进行服务降级
type: docs
weight: 8
---



由于微服务系统的分布式特性，一个服务往往需要依赖非常多的外部服务来实现某一项功能，因此，一个服务的稳定性不但取决于其自身，同时还取决于所有外部依赖的稳定性。我们可以根据这些依赖的重要程度将它们划分为强依赖和弱依赖：强依赖是指那些无论如何都要保证稳定性的服务，如果它们不可用则当前服务也就不可用；弱依赖项指当它们不可用之后当前服务仍能正常工作的依赖项，弱依赖不可用只是影响功能的部分完整性。

服务降级的核心目标就是针对这些弱依赖项。在弱依赖不可用或调用失败时，通过返回降级结果尽可能的维持功能完整性；另外，我们有时也会主动的屏蔽一些非关键弱依赖项的调用，比如在大促流量洪峰之前，通过预先设置一些有效的降级策略来短路部分依赖调用，来有效的提升流量高峰时期系统的整体效率和稳定性。

## 开始之前

* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

正常情况下，商品详情页会展示来自顾客的商品评论信息。

![mock1.png](/imgs/v3/tasks/mock/mock1.png)

评论信息的缺失在很多时候并不会影响用户浏览和购买商品，因此，我们定义评论信息属于商品详情页面的弱依赖。接下来，我们就模拟在大促前夕常用的一个策略，通过服务降级提前关闭商品详情页对于评论服务的调用（返回一些本地预先准备好的历史评论数据），来降低集群整体负载水位并提高响应速度。

![mock0.png](/imgs/v3/tasks/mock/mock0.png)

### 通过降级规则短路 Comment 评论服务调用

评论数据由 Comment 应用的 `org.apache.dubbo.samples.CommentService` 服务提供，接下来我们就为 `CommentService` 配置降级规则。

#### 操作步骤
1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【流量管控】>【服务降级】
3. 点击 "创建"，输入服务 `org.apache.dubbo.samples.CommentService` 和降级规则。

![Admin 服务降级规则配置截图](/imgs/v3/tasks/mock/mock_admin.png)

等待降级规则推送完成之后，刷新商品详情页面，发现商品评论信息已经变为我们预先设置的 "Mock Comment"，因为商品详情页的 Comment 服务调用已经在本地短路，并没有真正的发送到后端服务提供者机器上。

![mock2.png](/imgs/v3/tasks/mock/mock2.png)

再次刷新页面

#### 规则详解

**规则 key** ：`org.apache.dubbo.samples.CommentService`

**规则体**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: consumer
    parameters:
      mock: force:return Mock Comment
```

## 清理
为了不影响其他任务效果，通过 Admin 删除或者禁用刚刚配置的降级规则。

## 其他事项

服务降级功能也可以用于开发测试环境，由于微服务分布式的特点，不同的服务或应用之间都有相互依赖关系，因此，一个服务或应用很难不依赖其他服务而独立部署工作。但测试环境下并不是所有服务都是随时就绪的状态，这对于微服务强调的服务独立演进是一个很大的障碍，通过服务降级这个功能，我们可以模拟或短路应用对其他服务的依赖，从而可以让应用按照自己预期的行为 Mock 外部服务调用的返回结果。具体可参见 [Dubbo Admin 服务 Mock](../.././../reference/admin/mock/) 特性的使用方式。

Dubbo 的降级规则用来设置发生降级时的行为和返回值，而对于何时应该执行限流降级动作，即限流降级时机的判断并没有过多涉猎，这一点 Dubbo 通过集成更专业的限流降级产品如 Sentinel 进行了补全，可以配合 Dubbo 降级规则一起使用，具体可参见 [限流降级](/zh-cn/overview/core-features/traffic/circuit-breaking/) 文档。
