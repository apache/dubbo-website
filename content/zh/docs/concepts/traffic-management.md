---
type: docs
title: "服务流量管理"
linkTitle: "流量管理"
weight: 3
description: "通过 Dubbo 定义的路由规则，实现对流量分布的控制"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/advanced-features-and-usage/service/routing/)。
{{% /pageinfo %}}

### 流量管理

流量管理的本质是将请求根据制定好的路由规则分发到应用服务上，如下图所示：

![What is traffic control](/imgs/v3/concepts/what-is-traffic-control.png)

其中：
+ 路由规则可以有多个，不同的路由规则之间存在优先级。如：Router(1) -> Router(2) -> …… -> Router(n)
+ 一个路由规则可以路由到多个不同的应用服务。如：Router(2) 既可以路由到 Service(1) 也可以路由到 Service(2)
+ 多个不同的路由规则可以路由到同一个应用服务。如：Router(1) 和 Router(2) 都可以路由到 Service(2)
+ 路由规则也可以不路由到任何应用服务。如：Router(m) 没有路由到任何一个 Service 上，所有命中 Router(m) 的请求都会因为没有对应的应用服务处理而导致报错
+ 应用服务可以是单个的实例，也可以是一个应用集群。

### Dubbo 流量管理介绍

Dubbo 提供了支持 mesh 方式的流量管理策略，可以很容易实现 [A/B测试](../../examples/routing/ab-testing-deployment/)、[金丝雀发布](../../examples/routing/canary-deployment/)、[蓝绿发布](../../examples/routing/blue-green-deployment/) 等能力。

Dubbo 将整个流量管理分成 [VirtualService](../../references/routers/virtualservice/) 和 [DestinationRule](../../references/routers/destination-rule/) 两部分。当 Consumer 接收到一个请求时，会根据 [VirtualService](../../references/routers/virtualservice/) 中定义的 [DubboRoute](../../references/routers/virtualservice/#dubboroute) 和 [DubboRouteDetail](../../references/routers/virtualservice/#dubboroutedetail) 匹配到对应的 [DubboDestination](../../references/routers/virtualservice/#dubbodestination) 中的 subnet，最后根据 [DestinationRule](../../references/routers/destination-rule/) 中配置的 [subnet](../../references/routers/destination-rule/#subset) 信息中的 labels 找到对应需要具体路由的 Provider 集群。其中：

+ [VirtualService](../../references/routers/virtualservice/) 主要处理入站流量分流的规则，支持服务级别和方法级别的分流。
+ [DubboRoute](../../references/routers/virtualservice/#dubboroute) 主要解决服务级别的分流问题。同时，还提供的重试机制、超时、故障注入、镜像流量等能力。
+ [DubboRouteDetail](../../references/routers/virtualservice/#dubboroutedetail) 主要解决某个服务中方法级别的分流问题。支持方法名、方法参数、参数个数、参数类型、header 等各种维度的分流能力。同时也支持方法级的重试机制、超时、故障注入、镜像流量等能力。
+ [DubboDestination](../../references/routers/virtualservice/#dubbodestination) 用来描述路由流量的目标地址，支持 host、port、subnet 等方式。
+ [DestinationRule](../../references/routers/destination-rule/) 主要处理目标地址规则，可以通过 hosts、subnet 等方式关联到 Provider 集群。同时可以通过 [trafficPolicy](../../references/routers/destination-rule/#trafficpolicy) 来实现负载均衡。



这种设计理念很好的解决流量分流和目标地址之间的耦合问题。不仅将配置规则进行了简化有效避免配置冗余的问题，还支持 [VirtualService](../../references/routers/virtualservice/) 和 [DestinationRule](../../references/routers/destination-rule/) 的任意组合，可以非常灵活的支持各种业务使用场景。
