---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/observability/tracing/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/observability/tracing/
description: 链路追踪
hide_summary: true
linkTitle: 链路追踪
no_list: true
title: 链路追踪
type: docs
weight: 2
---

## 概述
Dubbo 内置了全链路追踪能力，你可以通过引入 spring-boot-starter 或者相关依赖开启链路跟踪能力，通过将跟踪数据导出到一些主流实现如 Zipkin、Skywalking、Jaeger 等后端系统，可以实现全链路跟踪数据的分析与可视化展示。

Dubbo 目前借助 Micrometer Observation 完成 Tracing 的所有埋点工作，依赖 Micrometer 提供的各种 Bridge 适配，我们可以实现将 Tracing 导入各种后端系统，具体工作原理如下。

![micrometer-bridge](/imgs/docs3-v2/java-sdk/observability/micrometer-bridge.png)

## 使用方式

以 Dubbo Spring Boot 应用为例，通过加入如下依赖即可开启链路追踪，并使用 zipkin exporter bridge 将链路追踪数据导入 Zipkin 后端系统。

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-otel-zipkin-starter</artifactId>
    <version>3.2.1-SNAPSHOT</version>
</dependency>
```

更多完整示例请参见：
* [使用 Zipkin 实现 Dubbo 全链路追踪](/zh-cn/overview/tasks/observability/tracing/zipkin/)
* [使用 Skywalking 实现 Dubbo 全链路追踪](/zh-cn/overview/tasks/observability/tracing/skywalking/)

## 关联日志

Dubbo Tracing 还实现了与日志系统的自动关联，即将 tracing-id、span-id 等信息自动置入日志 MDC 上下文，你只需要设置日志输出格式中包含类似 `%X{traceId:-},%X{spanId:-}]`，即可实现业务日志与 tracing 系统的自动关联，具体可参见 [Tracing 日志上下文配置示例](https://github.com/apache/dubbo-samples/blob/master/4-governance/dubbo-samples-tracing/dubbo-samples-spring-boot-tracing-otel-otlp/provider/src/main/resources/application.yml)。

