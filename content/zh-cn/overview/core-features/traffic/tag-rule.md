---
aliases:
    - /zh/overview/core-features/traffic/tag-rule/
description: ""
linkTitle: 标签路由
title: 标签路由规则
type: docs
weight: 2
---



标签路由通过将某一个服务的实例划分到不同的分组，约束具有特定标签的流量只能在指定分组中流转，不同分组为不同的流量场景服务，从而达到实现流量隔离的目的，可以作为蓝绿发布、灰度发布等场景能力的基础。目前有两种方式可以对实例打标，分别是`动态规则打标`和`静态规则打标`。`动态规则打标` 可以在运行时动态的圈住一组机器实例，而 `静态规则打标` 则需要实例重启后才能生效，其中，动态规则相较于静态规则优先级更高，而当两种规则同时存在且出现冲突时，将以动态规则为准。

本文要讲的就是标签路由规则就是 `动态规则打标`。

标签路由是一套严格隔离的流量体系，对于同一个应用而言，一旦打了标签则这部分地址子集就被隔离出来，只有带有对应标签的请求流量可以访问这个地址子集，这部分地址不再接收没有标签或者具有不同标签的流量。

举个例子，如果我们将一个应用进行打标，打标后划分为 tag-a、tag-b、无 tag 三个地址子集，则访问这个应用的流量，要么路由到 tag-a (当请求上下文 dubbo.tag=tag-a)，要么路由到 tag-b (dubbo.tag=tag-b)，或者路由到无 tag 的地址子集 (dubbo.tag 未设置)，不会出现混调的情况。

标签路由的作用域是提供者应用，消费者应用无需配置标签路由规则。一个提供者应用内的所有服务只能有一条分组规则，不会有服务 A 使用一条路由规则、服务 B 使用另一条路由规则的情况出现。以下条件路由示例，在 `shop-detail` 应用中圈出了一个隔离环境 `gray`，`gray` 环境包含所有带有 `env=gray` 标识的机器实例。

```yaml
configVersion: v3.0
force: true
enabled: true
key: shop-detail
tags:
  - name: gray
    match:
      - key: env
        value:
          exact: gray
```
## TagRule
标签路由规则主体。定义路由规则生效的目标应用、标签分类规则以及一些特定场景下的行为。

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| configVersion | string | The version of the tag rule definition, currently available version is `v3.0` | Yes |
| key | string | The identifier of the target application that this rule is about to control| Yes |
| enabled | bool | Whether enable this rule or not, set `enabled:false` to disable this rule. | Yes |
| tags | Tag[] | The tag definition of this rule. | Yes |
| force | bool | The behaviour when the instance subset is empty after routing. `true` means return no provider exception while `false` means fallback to subset without any tags. | No |
| runtime | bool | Whether run routing rule for every rpc invocation or use routing cache if available. | No |

## Tag
标签定义，根据 `match` 条件筛选出一部分地址子集。

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | The name of the tag used to match the `dubbo.tag` value in the request context. | Yes |
| match | MatchCondition | A set of criterion to be met for instances to be classified as member of this tag.  | No |

## MatchCondition
定义实例过滤条件，根据 Dubbo URL 地址中的特定参数进行过滤。

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| key | string | The name of the key in the Dubbo url address. | Yes |
| value | StringMatch (oneof) | The matching condition for the value in the Dubbo url address. | Yes |
