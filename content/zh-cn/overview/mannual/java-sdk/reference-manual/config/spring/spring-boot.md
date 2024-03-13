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

`application.properties(application.yaml)` 支持的配置项与 [配置参考手册](../properties) 中描述的基本是一一对应的。

### dubbo
* [**dubbo.application** - `org.apache.dubbo.config.ApplicationConfig`](../../properties#dubboapplication)
* [**dubbo.config-center** - `org.apache.dubbo.config.ConfigCenterConfig`](../../properties#dubboconfig-center)
* [**dubbo.consumer** - `org.apache.dubbo.config.ConsumerConfig`](../../properties#dubboconsumer)
* [**dubbo.metadata-report** - `org.apache.dubbo.config.MetadataReportConfig`](../../properties#dubbometadata-report)
* [**dubbo.protocol** - `org.apache.dubbo.config.ProtocolConfig`](../../properties#dubboprotocol)
* [**dubbo.provider** - `org.apache.dubbo.config.ProviderConfig`](../../properties#dubboprovider)
* [**dubbo.registry** - `org.apache.dubbo.config.RegistryConfig`](../../properties#dubboregistry)
* [**dubbo.ssl** - `org.apache.dubbo.config.SslConfig`](../../properties#dubbossl)
* ~~[**dubbo.monitor** - `org.apache.dubbo.config.MonitorConfig`](../../properties#dubbomonitor)~~
* ~~[**dubbo.module** - `org.apache.dubbo.config.ModuleConfig`](../../properties#dubbomodule)~~

### dubbo.metrics
* [**dubbo.metrics** - `org.apache.dubbo.config.MetricsConfig`](../../properties#dubbometrics)
* [**dubbo.metrics.aggregation** - `org.apache.dubbo.config.nested.AggregationConfig`](../../properties#dubbometricsaggregation)
* [**dubbo.metrics.histogram** - `org.apache.dubbo.config.nested.HistogramConfig`](../../properties#dubbometricshistogram)
* [**dubbo.metrics.prometheus** - `org.apache.dubbo.config.nested.PrometheusConfig`](../../properties#dubbometricsprometheus)
* [**dubbo.metrics.prometheus.exporter** - `org.apache.dubbo.config.nested.PrometheusConfig$Exporter`](../../properties#dubbometricsprometheusexporter)
* [**dubbo.metrics.prometheus.pushgateway** - `org.apache.dubbo.config.nested.PrometheusConfig$Pushgateway`](../../properties#dubbometricsprometheuspushgateway)

### dubbo.tracing
* [**dubbo.tracing** - `org.apache.dubbo.config.TracingConfig`](../../properties#dubbotracing)
* [**dubbo.tracing.baggage.correlation** - `org.apache.dubbo.config.nested.BaggageConfig$Correlation`](../../properties#dubbotracingbaggage.correlation)
* [**dubbo.tracing.tracing-exporter.otlp-config** - `org.apache.dubbo.config.nested.ExporterConfig$OtlpConfig`](../../properties#dubbotracingtracing-exporterotlp-config)
* [**dubbo.tracing.tracing-exporter.zipkin-config** - `org.apache.dubbo.config.nested.ExporterConfig$ZipkinConfig`](../../properties#dubbotracingtracing-exporterzipkin-config)
* [**dubbo.tracing.baggage** - `org.apache.dubbo.config.nested.BaggageConfig`](../../properties#dubbotracingbaggage)
* [**dubbo.tracing.propagation** - `org.apache.dubbo.config.nested.PropagationConfig`](../../properties#dubbotracingpropagation)
* [**dubbo.tracing.sampling** - `org.apache.dubbo.config.nested.SamplingConfig`](../../properties#dubbotracingsampling)
* [**dubbo.tracing.tracing-exporter** - `org.apache.dubbo.config.nested.ExporterConfig`](../../properties#dubbotracingtracing-exporter)



## starters

starter 列表、版本、对应的组件版本