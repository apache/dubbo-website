---
description: End-to-End Tracing
title: Link Tracing
linkTitle: End-to-End Tracing
type: docs
weight: 3
---

Dubbo-go supports end-to-end tracing based on the [OpenTelemetry](https://opentelemetry.io/) standard, while also supporting export to different tracing backend systems through the following exporters.

- [Stdout exporter](./stdout)
- [Jaeger exporter](./jaeger)
- [Zipkin exporter](./zipkin)
- [OTLP-HTTP exporter](./otlp-http)
- [OTLP-gRPC exporter](./otlp-grpc)

## Usage

Please note that tracing functionality is only enabled when creating the Dubbo application via `dubbo.NewInstance`, which is the [microservice application mode]() mentioned in our quick start. The [lightweight RPC API]() does not currently support enabling tracing.

## Example Explanation
You can view the <a href="https://github.com/apache/dubbo-go-samples/tree/main/otel" target="_blank">full example source code here</a>.

Enable tracing using `dubbo.WithTracing()`, and you can control tracing behavior with multiple parameters:

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
          trace.WithRatio(0.5), // sample ratio, only active when using ratio mode
        ),
    )
}

```

If you do not specify any option parameters in the `dubbo.WithTracing()` call, the default behavior will be used:

```yaml
# default tracing config
enable: false
exporter: stdout
endpoint: ""
propagator: w3c
sample-mode: ratio
sample-ratio: 0.5
```

## TracingOptions Explained

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
- propagator: context propagator type, supports w3c, b3; more details you can see [here](https://opentelemetry.io/docs/concepts/context-propagation/)
  - `trace.WithW3cPropagator()`
  - `trace.WithB3Propagator()` zipkin exporter defaults to using this
- sample-mode: sample mode, support ratio, always, never
  - `trace.WithAlwaysMode()`
  - `trace.WithNeverMode()`
  - `trace.WithRatioMode()`
- sample-ratio: sample ratio, only used when sample-mode is ratio, range between 0 and 1
  - `trace.WithRatio(float64)`

