---
aliases:
    - /zh/overview/tasks/observability/tracing/otlp/
description: ""
linkTitle: OTlp
no_list: true
title: OTlp
type: docs
weight: 1
---

## 概述

这个案例展示了在 Dubbo 项目中以 OpenTelemetry 作为 Tracer，将 Trace 信息上报到 Otlp Collector，再由 collector 转发至 Zipkin、Jagger。[代码地址](https://github.com/conghuhu/dubbo-samples/tree/master/4-governance/dubbo-samples-tracing/dubbo-samples-spring-boot-tracing-otel-otlp)

有三部分组成：

- dubbo-samples-spring-boot-tracing-otel-oltp-interface
- dubbo-samples-spring-boot-tracing-otel-oltp-provider
- dubbo-samples-spring-boot-tracing-otel-oltp-consumer

## 案例架构图

![案例架构图](/imgs/v3/tasks/observability/tracing/otlp/demo_arch.png)

## 快速开始

### 安装 & 启动 Otlp Collector

按照 [OpenTelemetry Collector Quick Start](https://OpenTelemetry.io/docs/collector/getting-started/) 去启动 otlp collector.

### 启动 Provider

直接运行`org.apache.dubbo.springboot.demo.provider.ProviderApplication` directly from IDE.

### 启动 Consumer

Start `org.apache.dubbo.springboot.demo.consumer.ConsumerApplication` directly from IDE.

### 查看 Trace 信息

在浏览器中打开zipkin看板 `http://localhost:9411/zipkin/` :

![zipkin.png](/imgs/v3/tasks/observability/tracing/otlp/zipkin_search.png)

![zipkin.png](/imgs/v3/tasks/observability/tracing/otlp/zipkin_detail.png)

在浏览器中打开Jaeger看板 `http://localhost:16686/search` :

![jaeger_search.png](/imgs/v3/tasks/observability/tracing/otlp/jaeger_search.png)

![jaeger_detail.png](/imgs/v3/tasks/observability/tracing/otlp/jaeger_detail.png)

## 如何在SpringBoot项目中使用

### 1. 在你的项目中添加依赖

对于 SpringBoot 项目，你可以使用`dubbo-spring-boot-tracing-otel-otlp-starter` ：

```xml

<!-- OpenTelemetry as Tracer, Otlp as exporter -->
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-otel-otlp-starter</artifactId>
</dependency>
```

### 2. 配置

#### application.yml

```yaml
dubbo:
  tracing:
    enabled: true # default is false
    sampling:
      probability: 0.5 # sampling rate, default is 0.1
    propagation:
      type: W3C # W3C/B3 default is W3C
    tracing-exporter:
      otlp-config:
        endpoint: http://localhost:4317
        timeout: 10s # default is 10s
        compression-method: none # none/gzip The method used to compress payloads, default is "none"
        headers: # customized added headers, default is empty
          auth: admin

# tracing info output to logging
logging:
  level:
    root: info
  pattern:
    console: '[%d{dd/MM/yy HH:mm:ss:SSS z}] %t %5p %c{2} [%X{traceId:-}, %X{spanId:-}]: %m%n'
```

## 如何基于Dubbo API使用

### 1. 在你的项目中添加依赖

```xml
    <!-- 必选，dubbo-tracing核心依赖 -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-tracing</artifactId>
    </dependency>
    <!-- Opentelemetry as Tracer -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-tracing-bridge-otel</artifactId>
    </dependency>
    <!-- OTlp as exporter -->
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-exporter-otlp</artifactId>
    </dependency>
```

### 2. 配置

```java
TracingConfig tracingConfig = new TracingConfig();
// 开启dubbo tracing
tracingConfig.setEnabled(true);
// 设置采样率
tracingConfig.setSampling(new SamplingConfig(1.0f));
// 设置Propagation，默认为W3C，可选W3C/B3
tracingConfig.setPropagation(new PropagationConfig("W3C"));
// 设置trace上报
ExporterConfig exporterConfig = new ExporterConfig();
// 设置将trace上报到Zipkin
exporterConfig.setZipkin(new ExporterConfig.OtlpConfig("http://localhost:4317", Duration.ofSeconds(10), "none"));
tracingConfig.setExporter(exporterConfig);
```
