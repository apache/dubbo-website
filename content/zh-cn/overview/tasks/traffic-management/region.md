---
aliases:
    - /zh/overview/tasks/traffic-management/region/
description: 在 Dubbo-Admin 动态配置同机房/区域优先
linkTitle: 同区域优先
title: 同机房/区域优先
type: docs
weight: 4
---



为了保证服务的整体高可用，我们经常会采用把服务部署在多个可用区(机房)的策略，通过这样的冗余/容灾部署模式，当一个区域出现故障的时候，我们仍可以保证服务整体的可用性。

当应用部署在多个不同机房/区域的时候，应用之间相互调用就会出现跨区域的情况，而跨区域调用会增加响应时间，影响用户体验。同机房/区域优先是指应用调用服务时，优先调用同机房/区域的服务提供者，避免了跨区域带来的网络延时，从而减少了调用的响应时间。

## 开始之前

* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

Detail 应用和 Comment 应用都有双区域部署，其中 Detail v1 与 Comment v1 部署在区域 Beijing，Detail v2 与 Comment v2 部署在区域 Hangzhou 区域。为了保证服务调用的响应速度，我们需要增加同区域优先的调用规则，确保 Beijing 区域内的 Detail v1 始终默认调用 Comment v1，Hangzhou 区域内的 Detail v2 始终调用 Comment v2。

![region1](/imgs/v3/tasks/region/region1.png)

当同区域内的服务出现故障或不可用时，则允许跨区域调用。

![region2](/imgs/v3/tasks/region/region2.png)


### 配置 `Detail` 访问同区域部署的 `Comment` 服务

正常登录商城系统后，首页默认展示商品详情信息，多次刷新页面，发现商品详情 (description) 与评论 (comment) 选项会出现多个不同版本的组合，结合上面 Detail 和 Comment 的部署结构，这说明服务调用并没有遵循同区域优先的原则。

![region3](/imgs/v3/tasks/region/region3.png)

因此，接下来我们需要添加同区域优先规则，保证：
* `hangzhou` 区域的 Detail 服务调用同区域的 Comment 服务，即 description v1 与 comment v1 始终组合展示
* `beijing` 区域的 Detail 服务调用同区域的 Comment 服务，即 description v2 与 comment v2 始终组合展示

#### 操作步骤
1. 登录 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】 > 【条件路由】。
3. 点击 "创建" 按钮，填入要启用同区域优先的服务如 `org.apache.dubbo.samples.CommentService` 与 `区域标识` 如 `region` 即可。

![Admin 同区域优先设置截图](/imgs/v3/tasks/region/region_admin.png)

同区域优先开启后，此时再尝试刷新商品详情页面，可以看到 description 与 comment 始终保持 v1 或 v2 的同步。

![region4](/imgs/v3/tasks/region/region4.png)

如果你将 `hangzhou` 区域部署的 Comment v2 版本全部下线，则 Detail v2 会自动的跨区域访问到 `beijing` 区域的 Comment v1。

#### 规则详解

**规则 key** ：`org.apache.dubbo.samples.CommentService`

**规则体**
```yaml
configVersion: v3.0
enabled: true
force: false
key: org.apache.dubbo.samples.CommentService
conditions:
  - '=> region = $region'
```

这里使用的是条件路由，`region` 为我们示例中的区域标识，会自动的识别当前发起调用的一方所在的区域值，当请求到达 `hangzhou` 区域部署的 Detail 后，从 Detail 发出的请求自动筛选 URL 地址中带有 `region=hangzhou` 标识的 Comment 地址，如果发现有可用的地址子集则将请求发出，如果没有匹配条件的地址，则随机发往任意可用区地址。

```yaml
conditions:
  - '=> region = $region'
```

`force: false` 也是关键，这允许在同区域无有效地址时，可以跨区域调用服务。

## 清理
为了不影响其他任务效果，通过 Admin 删除或者禁用刚刚配置的同区域流量规则。

## 其他事项

我们上面的示例并未纳入多区域之间注册中心的复杂性，如果每个区域部署有独立的注册中心，则多区域间的地址同步就是一个需要考虑的问题。对于这种场景，Dubbo 通过多注册&多订阅机制也提供了同区域优先的支持，具体可以参见[多注册&多订阅](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/multi-registry/)相关文档。
