---
type: docs
title: "可观测性"
linkTitle: "可观测性"
weight: 50
---

可观测性分为三个维度度量、链路追踪以及日志，Dubbo从这三个方面为开发者提供了全面的可观测性解决方案。

Metrics：Dubbo集成了prometheus监控系统，在指标数据上Dubbo支持多维度的RT指标数据，包括Max、Min、Avg、P99、P95等维度，支持多维度的请求量指标数据，包括QPS、调用成功的请求量、调用失败的请求量等。除此之外，Dubbo还能够通过SPI扩展来完成集成其他监控系统。

Tracing：Dubbo提供了链路追踪所需的必备数据，为Dubbo集成各类链路追踪系统提供了便捷，以辅助用户完成更加强大的链路追踪能力。目前流行的skywalking、zipkin、jaeger都支持Dubbo服务的链路追踪。

Logging：Dubbo支持多种的日志框架的适配。包括常见的slf4j、log4j2、log4j、jcl等。用户可以在这些框架中自由切换。