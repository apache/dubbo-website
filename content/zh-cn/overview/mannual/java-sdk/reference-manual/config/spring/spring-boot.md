---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/annotation/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/annotation/
description: 以 Annotation、Spring Boot 开发 Dubbo 应用
linkTitle: Spring Boot
title: Spring Boot
type: docs
weight: 3
---

关于 Spring Boot 的注解、基本使用方法等请参考 [使用教程 - Spring Boot](/zh-cn/overview/mannual/java-sdk/tasks/develop/springboot/)。以下是 spring boot 支持的配置详情与 starter 列表。

## application.yaml

以下是 Dubbo 框架支持的配置组件列表，可以在 Spring Boot 配置文件中指定所需配置。

### 配置示例

```yaml
dubbo:
  application:
      name: dubbo-springboot-demo-provider
      logger: slf4j
  protocol:
    name: dubbo
    port: 50052
  registry:
    address: nacos://${nacos.address:127.0.0.1}:8848?username=nacos&password=nacos
```

### dubbo
* [**dubbo.application** - `org.apache.dubbo.config.ApplicationConfig`](../../properties#dubboapplication)
* [**dubbo.config-center** - `org.apache.dubbo.config.ConfigCenterConfig`](../../properties#dubboconfig-center)
* [**dubbo.consumer** - `org.apache.dubbo.config.ConsumerConfig`](../../properties#dubboconsumer)
* [**dubbo.metadata-report** - `org.apache.dubbo.config.MetadataReportConfig`](../../properties#dubbometadata-report)
* [**dubbo.protocol** - `org.apache.dubbo.config.ProtocolConfig`](../../properties#dubboprotocol)
* [**dubbo.provider** - `org.apache.dubbo.config.ProviderConfig`](../../properties#dubboprovider)
* [**dubbo.registry** - `org.apache.dubbo.config.RegistryConfig`](../../properties#dubboregistry)
* [**dubbo.metrics** - `org.apache.dubbo.config.MetricsConfig`](../../properties#dubbometrics)
* [**dubbo.tracing** - `org.apache.dubbo.config.TracingConfig`](../../properties#dubbotracing)
* [**dubbo.ssl** - `org.apache.dubbo.config.SslConfig`](../../properties#dubbossl)
* ~~[**dubbo.monitor** - `org.apache.dubbo.config.MonitorConfig`](../../properties#dubbomonitor)~~
* ~~[**dubbo.module** - `org.apache.dubbo.config.ModuleConfig`](../../properties#dubbomodule)~~

### dubbo.metrics
* [**dubbo.metrics.aggregation** - `org.apache.dubbo.config.nested.AggregationConfig`](../../properties#dubbometricsaggregation)
* [**dubbo.metrics.histogram** - `org.apache.dubbo.config.nested.HistogramConfig`](../../properties#dubbometricshistogram)
* [**dubbo.metrics.prometheus** - `org.apache.dubbo.config.nested.PrometheusConfig`](../../properties#dubbometricsprometheus)
* [**dubbo.metrics.prometheus.exporter** - `org.apache.dubbo.config.nested.PrometheusConfig$Exporter`](../../properties#dubbometricsprometheusexporter)
* [**dubbo.metrics.prometheus.pushgateway** - `org.apache.dubbo.config.nested.PrometheusConfig$Pushgateway`](../../properties#dubbometricsprometheuspushgateway)

### dubbo.tracing
* [**dubbo.tracing.baggage.correlation** - `org.apache.dubbo.config.nested.BaggageConfig$Correlation`](../../properties#dubbotracingbaggage.correlation)
* [**dubbo.tracing.tracing-exporter.otlp-config** - `org.apache.dubbo.config.nested.ExporterConfig$OtlpConfig`](../../properties#dubbotracingtracing-exporterotlp-config)
* [**dubbo.tracing.tracing-exporter.zipkin-config** - `org.apache.dubbo.config.nested.ExporterConfig$ZipkinConfig`](../../properties#dubbotracingtracing-exporterzipkin-config)
* [**dubbo.tracing.baggage** - `org.apache.dubbo.config.nested.BaggageConfig`](../../properties#dubbotracingbaggage)
* [**dubbo.tracing.propagation** - `org.apache.dubbo.config.nested.PropagationConfig`](../../properties#dubbotracingpropagation)
* [**dubbo.tracing.sampling** - `org.apache.dubbo.config.nested.SamplingConfig`](../../properties#dubbotracingsampling)
* [**dubbo.tracing.tracing-exporter** - `org.apache.dubbo.config.nested.ExporterConfig`](../../properties#dubbotracingtracing-exporter)

## starter列表

### dubbo-spring-boot-starter
以下是一些 dubbo-spring-boot-starter 版本对应的 SpringBoot、JDK 依赖：

| 版本    | 兼容 Spring Boot 范围 |
|-------|---------------|
| 3.3.x | [1.x ~ 3.x)   |
| 3.2.x | [1.x ~ 3.x)   |
| 3.1.x | [1.x ~ 2.x)   |
| 2.7.x | [1.x ~ 2.x)   |

### 其他组件starter

以下是 Dubbo 官方社区提供的 starter 列表（3.3.0+ 版本），方便在 Spring Boot 应用中快速使用：
* `dubbo-spring-boot-starter`，管理 dubbo 核心依赖，用于识别 application.properties 或 application.yml 中 `dubbo.` 开头的配置项，扫描 @DubboService 等注解。
* `dubbo-spring-boot-starter3`，管理 dubbo 核心依赖，与 dubbo-spring-boot-starter 相同，支持 spring boot 3.2 版本。
* `dubbo-nacos-spring-boot-starter`，管理 nacos-client 等依赖，使用 Nacos 作为注册中心、配置中心时引入。
* `dubbo-zookeeper-spring-boot-starter`，管理 zookeeper、curator 等依赖，使用 Zookeeper 作为注册中心、配置中心时引入（Zookeeper server 3.4 及以下版本使用）。
* `dubbo-zookeeper-curator5-spring-boot-starter`，管理 zookeeper、curator5 等依赖，使用 Zookeeper 作为注册中心、配置中心时引入。
* `dubbo-sentinel-spring-boot-starter`，管理 sentinel 等依赖，使用 Sentinel 进行限流降级时引入。
* `dubbo-seata-spring-boot-starter`，管理 seata 等依赖，使用 Seata 作为分布式事务解决方案时引入。
* `dubbo-observability-spring-boot-starter`，加入该依赖将自动开启 Dubbo 内置的 metrics 采集，可用于后续的 Prometheus、Grafana 等监控系统。
* `dubbo-tracing-brave-spring-boot-starter`，管理 brave/zipkin、micrometer 等相关相关依赖，使用 Brave/Zipkin 作为 Tracer，将 Trace 信息 export 到 Zipkin。
* `dubbo-tracing-otel-otlp-spring-boot-starter`，管理 brave/zipkin、micrometer 等相关相关依赖，使用 OpenTelemetry 作为 Tracer，将 Trace 信息 export 到 OTlp Collector。
* `dubbo-tracing-otel-zipkin-spring-boot-starter`，管理 brave/zipkin、micrometer 等相关相关依赖，使用 OpenTelemetry 作为 Tracer，将 Trace 信息 export 到 Zipkin。

{{% alert title="注意" color="info" %}}
* 关于每个 starter 适配的第三方组件版本，请查看 [组件版本映射表](/zh-cn/overview/mannual/java-sdk/versions/#版本说明)。
* 每个 starter 都有对应的 application.yml 配置项，请跟随上文 [配置项列表](./#配置示例) 了解使用细节。
{{% /alert %}}
