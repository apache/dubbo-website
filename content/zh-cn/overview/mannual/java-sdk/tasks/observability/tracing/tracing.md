---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/observability/tracing/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/observability/tracing/
description: Dubbo 内置了全链路追踪能力，你可以通过引入 spring-boot-starter 或者相关依赖开启链路跟踪能力，通过将跟踪数据导出到一些主流实现如 Zipkin、Skywalking、Jaeger 等后端系统，可以实现全链路跟踪数据的分析与可视化展示。
hide_summary: true
linkTitle: 链路追踪
no_list: true
title: 全链路追踪使用与实现说明
type: docs
weight: 1
---

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

## 工作原理
### Tracing相关概念

- Span：基本工作单元。例如，发送 RPC 是一个新的 span，发送对 RPC 的响应也是如此。Span还有其他数据，例如description、带时间戳的事件、键值注释（标签）、导致它们的跨度的 ID 和进程 ID（通常是 IP 地址）。跨度可以启动和停止，并且它们会跟踪它们的时间信息。创建跨度后，您必须在将来的某个时间点停止它。

- Trace：一组形成树状结构的跨度。例如，如果您运行分布式大数据存储，则可能会通过请求形成跟踪PUT。

- Annotation/Event : 用于及时记录一个事件的存在。

- Tracing context：为了使分布式跟踪工作，跟踪上下文（跟踪标识符、跨度标识符等）必须通过进程（例如通过线程）和网络传播。

- Log correlation：部分跟踪上下文（例如跟踪标识符、跨度标识符）可以填充到给定应用程序的日志中。然后可以将所有日志收集到一个存储中，并通过跟踪 ID 对它们进行分组。这样就可以从所有按时间顺序排列的服务中获取单个业务操作（跟踪）的所有日志。

- Latency analysis tools：一种收集导出跨度并可视化整个跟踪的工具。允许轻松进行延迟分析。

- Tracer: 处理span生命周期的库（Dubbo 目前支持 OpenTelemetry 和 Brave）。它可以通过 Exporter 创建、启动、停止和报告 Spans 到外部系统（如 Zipkin、Jagger 等）。

- Exporter: 将产生的 Trace 信息通过 http 等接口上报到外部系统，比如上报到 Zipkin。

### SpringBoot Starters

对于 SpringBoot 用户，Dubbo 提供了 Tracing 相关的 starters，自动装配 Micrometer 相关的配置代码，且用户可自由选择 Tracer 和Exporter。

#### OpenTelemetry 作为 Tracer，将 Trace 信息 export 到 Zipkin

```yml
  <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-otel-zipkin-starter</artifactId>
    <version>${version}</version>
  </dependency>
```

#### OpenTelemetry 作为 Tracer，将 Trace 信息 export 到 OTlp Collector

```yml
  <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-otel-otlp-starter</artifactId>
    <version>${version}</version>
  </dependency>
```

#### Brave 作为 Tracer，将 Trace 信息 export 到 Zipkin

```yml
  <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-brave-zipkin-starter</artifactId>
    <version>${version}</version>
  </dependency>
```

#### 自由组装 Tracer 和 Exporter

如果用户基于 Micrometer 有自定义的需求，想将 Trace 信息上报至其他外部系统观测，可参照如下自由组装 Tracer 和 Exporter：

```yml
  <!-- 自动装配 -->
  <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-spring-boot-observability-starter</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- otel作为tracer -->
  <dependency>
      <groupId>io.micrometer</groupId>
      <artifactId>micrometer-tracing-bridge-otel</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- export到zipkin -->
  <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-exporter-zipkin</artifactId>
      <version>${version}</version>
  </dependency>
```

```yml
  <!-- 自动装配 -->
  <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-spring-boot-observability-starter</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- brave作为tracer  -->
  <dependency>
      <groupId>io.micrometer</groupId>
      <artifactId>micrometer-tracing-bridge-brave</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- export到zipkin -->
  <dependency>
      <groupId>io.zipkin.reporter2</groupId>
      <artifactId>zipkin-reporter-brave</artifactId>
      <version>${version}</version>
  </dependency>
```

后续还会补齐更多的 starters，如 Jagger、SkyWalking等。

### Dubbo Bootstrap API

对于像非 SpringBoot 的项目，可以使用 Dubbo API 使用Tracing。

详细案例可参考[代码地址](https://github.com/conghuhu/dubbo-samples/tree/master/4-governance/dubbo-samples-tracing/dubbo-sample-api-tracing-otel-zipkin)


