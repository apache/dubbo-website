---
description: 全链路追踪
title: 链路追踪
linkTitle: 全链路追踪
type: docs
weight: 3
---

Dubbo-go 支持基于 [OpenTelemetry](https://opentelemetry.io/) 标准的全链路追踪埋点，同时支持通过以下 exporter 导出到不同的 tracing 后端系统。

- [Stdout exporter](./stdout)
- [Jaeger exporter](./jaeger)
- [Zipkin exporter](./zipkin)
- [OTLP-HTTP exporter](./otlp-http)
- [OTLP-gRPC exporter](./otlp-grpc)

## 使用方式

请注意，仅支持通过 `dubbo.NewInstance` 方式创建 dubbo 应用时开启 tracing 功能，也就是我们快速开始中提到的 [微服务应用模式]()，对于 [轻量 RPC API]() 暂时不支持开启 tracing。

## 示例详解
可在此查看  <a href="https://github.com/apache/dubbo-go-samples/tree/main/otel" target="_blank">完整示例源码地址</a>。

使用 `dubbo.WithTracing()` 开启 tracing，可以通过多个参数控制 tracing 行为：

```go
package main

import (
  "dubbo.apache.org/dubbo-go/v3"
  _ "dubbo.apache.org/dubbo-go/v3/imports"
  "dubbo.apache.org/dubbo-go/v3/otel/trace"
)

func main() {
    instance, err := dubbo.NewInstance(
        dubbo.WithTracing(
          // add tracing options here
          trace.WithEnabled(), // enable tracing feature
          trace.WithStdoutExporter(),
          trace.WithW3cPropagator(),
          trace.WithAlwaysMode(),
          trace.WithRatioMode(), // use ratio mode
          trace.WithRatio(0.5), // sample ratio, only active when use ratio mode
        ),
    )
}

```

如果你在 `dubbo.WithTracing()` 调用中不指定任何 option 参数，则会使用默认行为：

```yaml
# default tracing config
enable: false
exporter: stdout
endpoint: ""
propagator: w3c
sample-mode: ratio
sample-ratio: 0.5
```

## TracingOptions详解

- enable: enable tracing or not
  - `trace.WithEnabled()` means enable tracing
- exporter: tracing exporter backends, support stdout, jaeger, zipkin, otlp-http, otlp-grpc
  - `trace.WithStdoutExporter()`
  - `trace.WithJaegerExporter()`
  - `trace.WithZipkinExporter()`
  - `trace.WithOtlpHttpExporter()`
  - `trace.WithOtlpGrpcExporter()`
- endpoint: exporter backend endpoint, for example, jaeger exporter's endpoint is `http://localhost:14268/api/traces`
  - `trace.WithEndpoint(string)`
- propagator: context propagator type, support w3c, b3, more details you can see [here](https://opentelemetry.io/docs/concepts/context-propagation/)
  - `trace.WithW3cPropagator()`
  - `trace.WithB3Propagator()` zipkin exporter default use this
- sample-mode: sample mode, support ratio, always, never
  - `trace.WithAlwaysMode()`
  - `trace.WithNeverMode()`
  - `trace.WithRatioMode()`
- sample-ratio: sample ratio, only used when sample-mode is ratio, range between 0 and 1
  - `trace.WithRatio(float64)`


