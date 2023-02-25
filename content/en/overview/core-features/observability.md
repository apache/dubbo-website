---
type: docs
title: "观测服务"
linkTitle: "观测服务"
weight: 60
description: ""
feature:
  title: Observability
  description: >
    Multi-dimensional observable indicators (Metrics, Tracing, Accesslog) help to understand the service running status, Admin console, Grafana, etc. help realize the visual display of data indicators.
---

Dubbo 内部维护了多个纬度的可观测指标，并且支持多种方式的可视化监测。可观测性指标从总体上来说分为三个度量纬度：

* **Admin。** Admin 控制台可视化展示了集群中的应用、服务、实例及依赖关系，支持流量治理规则下发，同时还提供如服务测试、mock、文档管理等提升研发测试效率的工具。

* **Metrics。** Dubbo 统计了一系列的流量指标如 QPS、RT、成功请求数、失败请求数等，还包括一系列的内部组件状态如线程池数、服务健康状态等。

* **Tracing。** Dubbo 与业界主流的链路追踪工作做了适配，包括 Skywalking、Zipkin、Jaeger 都支持 Dubbo 服务的链路追踪。

* **Logging。** Dubbo 支持多种日志框架适配。以 Java 体系为例，支持包括 Slf4j、Log4j2、Log4j、Logback、Jcl 等，用户可以基于业务需要选择合适的框架；同时 Dubbo 还支持 Access Log 记录请求踪迹。

## Admin
Admin 控制台可视化展示了集群中的应用、服务、实例及依赖关系，支持流量治理规则下发，同时还提供如服务测试、mock、文档管理等提升研发测试效率的工具

![Admin 效果图](/imgs/v3/feature/observability/admin.jpg)

* [Admin 部署与效果演示](#)

## Metrics
Dubbo 运行时统计了包括 qps、rt、调用总数、成功数、失败数，失败原因统计等在内的核心服务指标，同时，为了更好的监测服务运行状态，Dubbo 还提供了对核心组件状态的监控，如线程池数量、服务健康状态等。

可以通过 Grafana 可视化的查看 Metrics 指标

![Grafana 效果图](/imgs/v3/feature/observability/grafana.png)

* [使用 Grafana 可视化展示 Metrics 指标](#)
* [如何从 Prometheus 查询特定 Metrics 指标](#)

## Tracing
全链路追踪对于监测分布式系统运行状态具有非常重要的价值，Dubbo 通过 Filter 拦截器实现了请求运行时的埋点跟踪，通过将跟踪数据导出到一些主流实现如 Zipkin、Skywalking、Jaeger 等，可以实现全链路跟踪数据的分析与可视化展示。

![Tracing 效果图](/imgs/v3/feature/observability/tracing.png)

只需要简单的一行配置即可切换链路跟踪的后端实现，并且，你可以随时通过 Dubbo Admin 等治理平台动态调整 Dubbo 的链路追踪采样率，对于问题排查都非常有价值。

* [基于 Skywalking 实现全链路追踪](#)
* [基于 Zipkin 实现全链路追踪](#)

## Logging
访问日志可以帮助分析系统的流量情况，在有些场景下，开启访问日志对于排查问题也非常有帮助。

* [开启 Access Log](#)
* [你还在运行态开启 Access Log](#)