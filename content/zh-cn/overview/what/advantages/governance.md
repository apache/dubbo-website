---
aliases:
    - /zh/overview/what/advantages/governance/
description: 服务治理
linkTitle: 服务治理
title: 服务治理
type: docs
weight: 3
---




## 流量管控

在地址发现和负载均衡机制之外，Dubbo 丰富的流量管控规则可以控制服务间的流量走向和 API 调用，基于这些规则可以实现在运行期动态的调整服务行为如超时时间、重试次数、限流参数等，通过控制流量分布可以实现 A/B 测试、金丝雀发布、多版本按比例流量分配、条件匹配路由、黑白名单等，提高系统稳定性。

#### Dubbo 流量管控能解决哪些问题
场景一：搭建多套独立的逻辑测试环境。

场景二：搭建一套完全隔离的线上灰度环境用来部署新版本服务。

![gray1](/imgs/v3/tasks/gray/gray1.png)

场景三：金丝雀发布

![weight1.png](/imgs/v3/tasks/weight/weight1.png)

场景四：同区域优先。当应用部署在多个不同机房/区域的时候，优先调用同机房/区域的服务提供者，避免了跨区域带来的网络延时，从而减少了调用的响应时间。

![region1](/imgs/v3/tasks/region/region1.png)

除了以上几个典型场景，我们还可以基于 Dubbo 支持的流量管控规则实现微服务场景中更丰富的流量管控，如：

* 动态调整超时时间
* 服务重试
* 访问日志
* 同区域优先
* 灰度环境隔离
* 参数路由
* 按权重比例分流
* 金丝雀发布
* 服务降级
* 实例临时拉黑
* 指定机器导流

可以在 [流量管理任务](../../../tasks/traffic-management/) 中了解以上实践场景细节。背后的规则定义与工作原理请参见 [Dubbo 流量管控规则设计与定义](../../../core-features/traffic/)。。

## 微服务生态
围绕 Dubbo 我们构建了完善的微服务治理生态，对于绝大多数服务治理需求，通过简单几行配置即可开启。对于官方尚未适配的组件或者用户内部系统，也可以通过 Dubbo 扩展机制轻松适配。

![governance](/imgs/v3/what/governance.png)

## 可视化控制台
Dubbo Admin 是 Dubbo 官方提供的可视化 Web 交互控制台，基于 Admin 你可以实时监测集群流量、服务部署状态、排查诊断问题。

## 安全体系
Dubbo 支持基于 TLS 的 HTTP、HTTP/2、TCP 数据传输通道，并且提供认证、鉴权策略，让开发者实现更细粒度的资源访问控制。

## 服务网格
基于 Dubbo 开发的服务可以透明的接入 Istio 等服务网格体系，Dubbo 支持基于 Envoy 的流量拦截方式，也支持更加轻量的 Proxyless Mesh 部署模式。
