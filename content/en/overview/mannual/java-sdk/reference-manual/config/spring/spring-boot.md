---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config/annotation/
    - /en/docs3-v2/java-sdk/reference-manual/config/annotation/
    - /en/overview/mannual/java-sdk/reference-manual/config/annotation/
description: Develop Dubbo applications using Annotation and Spring Boot
linkTitle: Spring Boot
title: Spring Boot
type: docs
weight: 3
---

For details about Spring Boot annotations and basic usage, please refer to [User Guide - Spring Boot](/en/overview/mannual/java-sdk/tasks/develop/springboot/). Below are the configuration details and starter list supported by Spring Boot.

## application.yaml

Below is the list of configuration components supported by the Dubbo framework, which can be specified in the Spring Boot configuration file.

### Configuration Example

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

## Starter List

### dubbo-spring-boot-starter
Here are some version mappings of the dubbo-spring-boot-starter that correspond to Spring Boot and JDK dependencies:

| Version | Compatible Spring Boot Range |
|-------|---------------|
| 3.3.x | [1.x ~ 3.x)   |
| 3.2.x | [1.x ~ 3.x)   |
| 3.1.x | [1.x ~ 2.x)   |
| 2.7.x | [1.x ~ 2.x)   |

### Other Component Starters

Here is the list of starters provided by the Dubbo official community (version 3.3.0+) for quick usage in Spring Boot applications:
* `dubbo-spring-boot-starter`, manages the core dubbo dependencies, identifies configuration items starting with `dubbo.` in application.properties or application.yml, and scans annotations like @DubboService.
* `dubbo-spring-boot-starter3`, manages the same core dubbo dependencies as dubbo-spring-boot-starter, supports Spring Boot version 3.2.
* `dubbo-nacos-spring-boot-starter`, manages nacos-client and other dependencies to introduce when using Nacos as the registry and configuration center.
* `dubbo-zookeeper-spring-boot-starter`, manages zookeeper, curator and other dependencies to introduce when using Zookeeper as the registry and configuration center (for Zookeeper server version 3.4 and below).
* `dubbo-zookeeper-curator5-spring-boot-starter`, manages zookeeper, curator5 and other dependencies to introduce when using Zookeeper as the registry and configuration center.
* `dubbo-sentinel-spring-boot-starter`, manages sentinel and other dependencies to introduce when using Sentinel for rate limiting and degradation.
* `dubbo-seata-spring-boot-starter`, manages seata and other dependencies to introduce when using Seata as a distributed transaction solution.
* `dubbo-observability-spring-boot-starter`, adding this dependency will automatically enable the built-in metrics collection of Dubbo, which can be used for subsequent monitoring systems like Prometheus and Grafana.
* `dubbo-tracing-brave-spring-boot-starter`, manages brave/zipkin, micrometer, and related dependencies, uses Brave/Zipkin as Tracer, and exports Trace information to Zipkin.
* `dubbo-tracing-otel-otlp-spring-boot-starter`, manages brave/zipkin, micrometer, and related dependencies, uses OpenTelemetry as Tracer, and exports Trace information to OTlp Collector.
* `dubbo-tracing-otel-zipkin-spring-boot-starter`, manages brave/zipkin, micrometer, and related dependencies, uses OpenTelemetry as Tracer, and exports Trace information to Zipkin.

{{% alert title="Note" color="info" %}}
* For the versions of third-party components compatible with each starter, please refer to the [Component Version Mapping Table](/en/overview/mannual/java-sdk/versions/).
* Each starter has corresponding application.yml configuration items; please refer to the above [Configuration Items List](./#Configuration%20Example) for detailed usage.
{{% /alert %}}


