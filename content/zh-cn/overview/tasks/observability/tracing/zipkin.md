---
aliases:
    - /zh/overview/tasks/observability/tracing/zipkin/
description: ""
linkTitle: Zipkin
no_list: true
title: Zipkin
type: docs
weight: 10
---

这个示例演示了 Dubbo 集成 Zipkin 全链路追踪的基础示例，此示例共包含三部分内容：
* dubbo-samples-spring-boot3-tracing-provider
* dubbo-samples-spring-boot3-tracing-consumer
* dubbo-samples-spring-boot3-tracing-interface


## 快速开始

### 安装 & 启动 Zipkin

参考 [Zipkin's quick start](https://zipkin.io/pages/quickstart.html) 安装 Zipkin。

这里我们使用 Docker 来掩饰如何快速的启动 Zipkin 服务。

```bash
docker run -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

紧接着，你可以通过如下链接确认 Zipkin 正常工作 `[http://localhost:9411](http://localhost:9411)`

![zipkin_home](/imgs/v3/tasks/observability/tracing/zipkin_home.png)

### 安装 & 启动 Nacos

跟随 [Nacos's quick start](https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html) 快速安装并启动 Nacos。

### 启动示例 Provider

在 IDE 中直接运行 `org.apache.dubbo.springboot.demo.provider.ProviderApplication`。

### 启动示例 Consumer

在 IDE 中直接运行 `org.apache.dubbo.springboot.demo.consumer.ConsumerApplication`。

### 检查监控效果

在浏览器中打开 `[http://localhost:9411/zipkin/](http://localhost:9411/zipkin/)` 查看效果。

![zipkin.png](/imgs/v3/tasks/observability/tracing/zipkin.png)

## 如何在项目中使用 Dubbo Tracing

### 1. 添加 Micrometer Observation 依赖

首先需要添加 `dubbo-metrics-api`  依赖将 Micrometer 和 Dubbo Metrics 引入项目中：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metrics-api</artifactId>
</dependency>
```

通过集成 [Micrometer Observations](https://micrometer.io/) Dubbo 可以在只被拦截一次的情况下，导出多种不同类型的监控指标如 Metrics、Tracer、其他一些信号等，这具体取决于你对 `ObservationHandlers` 的配置。 可以参考以下链接 [documentation under docs/observation](https://micrometer.io) 了解更多内容。

### 2. 配置 Micrometer Tracing Bridge

为了启用 Dubbo 全链路追踪统计，需要为 Micrometer Tracing 和实际的 Tracer（本示例中的 Zipkin）间配置 `bridge`。

> 注意：Tracer 是一个管控 span 生命周期的二进制包，比如 span 的 创建、终止、采样、上报等。

Micrometer Tracing 支持 [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-java) and [Brave](https://github.com/openzipkin/brave) 格式的 Tracer。Dubbo 推荐使 OpenTelemetry 作为标准的 tracing 协议，`bridge`  的具体配置如下:

```xml
<!-- OpenTelemetry Tracer -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
```

### 3. 添加 Micrometer Tracing Exporter

添加 Tracer 后，需要继续配置 exporter（也称为 reporter）。exporter 负责导出完成 span 并将其发送到后端 reporter 系统。Micrometer Tracer 原生支持 Tanzu Observability by Wavefront 和 Zipkin。以 Zipkin 为例：

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-zipkin</artifactId>
</dependency>
```

你可以在此阅读更多关于 Tracing 的配置信息 [this documentation, under docs/tracing](https://micrometer.io/).

### 4. 配置 ObservationRegistry

```java
@Configuration
public class ObservationConfiguration {

    // reuse the applicationModel in your system
    @Bean
    ApplicationModel applicationModel(ObservationRegistry observationRegistry) {
        ApplicationModel applicationModel = ApplicationModel.defaultModel();
        applicationModel.getBeanFactory().registerBean(observationRegistry);
        return applicationModel;
    }

    // zipkin endpoint url
    @Bean
    SpanExporter spanExporter() {
        return new ZipkinSpanExporterBuilder().setEndpoint("http://localhost:9411/api/v2/spans").build();
    }
}
```

### 5. 定制 Observation Filters

To customize the tags present in metrics (low cardinality tags) and in spans (low and high cardinality tags) you should
create your own versions of `DubboServerObservationConvention` (server side) and `DubboClientObservationConvention` (
client side) and register them in the `ApplicationModel`'s `BeanFactory`. To reuse the existing ones
check `DefaultDubboServerObservationConvention` (server side) and `DefaultDubboClientObservationConvention` (client
side).



## Extension

### 其他 Micrometer Tracing Bridge

```xml
<!-- Brave Tracer -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
```



### 其他 Micrometer Tracing Exporter

Tanzu Observability by Wavefront

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-reporter-wavefront</artifactId>
</dependency>
```

OpenZipkin Zipkin with Brave

```xml
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

An OpenZipkin URL sender dependency to send out spans to Zipkin via a URLConnectionSender

```xml
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-sender-urlconnection</artifactId>
</dependency>
```