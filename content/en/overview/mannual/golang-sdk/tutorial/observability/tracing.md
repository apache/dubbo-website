---
description: End-to-End Tracing
title: Link Tracing
linkTitle: End-to-End Tracing
type: docs
weight: 3
---

Dubbo-go supports end-to-end tracing based on the [OpenTelemetry](https://opentelemetry.io/) standard. When tracing is enabled, Dubbo-go automatically creates spans during RPC calls and exports them to different backend systems through the configured exporter.

The following exporters are supported:

- `stdout`: Prints spans to the process standard output as JSON; suitable for local development and debugging.
- `jaeger`: Exports spans to [Jaeger](https://www.jaegertracing.io/).
- `zipkin`: Exports spans to [Zipkin](https://zipkin.io/).
- `otlp-http`: Exports spans to OpenTelemetry Collector or other backends over OTLP/HTTP.
- `otlp-grpc`: Exports spans to OpenTelemetry Collector or other backends over OTLP/gRPC.

Runnable examples for the stdout, jaeger, and otlp-http exporters are available under [dubbo-go-samples/otel/tracing](https://github.com/apache/dubbo-go-samples/tree/main/otel/tracing). The sections below explain how to run each of them.

## Usage

- Tracing is currently supported only when the Dubbo application is created through `dubbo.NewInstance`, i.e. the microservice application mode described in the quick start. The lightweight RPC API does not support tracing yet.
- The blank import `dubbo.apache.org/dubbo-go/v3/imports` must be added to register the exporter implementations.
- Tracing is configured with `dubbo.WithTracing(...)`; `trace.WithXXX` options control the exporter, endpoint, propagator, and sampling policy.

Here is a minimal configuration:

```go
package main

import (
	"dubbo.apache.org/dubbo-go/v3"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/otel/trace"
)

func main() {
	ins, err := dubbo.NewInstance(
		dubbo.WithTracing(
			trace.WithEnabled(),        // enable tracing
			trace.WithStdoutExporter(), // use the stdout exporter
			trace.WithW3cPropagator(),  // use W3C trace context propagation
			trace.WithAlwaysMode(),     // sample all requests for local verification
		),
	)
	if err != nil {
		panic(err)
	}
	_ = ins
}
```

If no options are passed to `dubbo.WithTracing()`, the default configuration below is used:

```yaml
# default tracing config
enable: false
exporter: stdout
endpoint: ""
propagator: w3c
sample-mode: ratio
sample-ratio: 0.5
insecure: false
```

Note that `enable` defaults to `false`. You must call `trace.WithEnabled()` (or set `tracing.enable: true` in YAML) to actually turn tracing on.

## Common dubbo.WithTracing options

- `enable`: whether tracing is enabled; defaults to `false`.
  - `trace.WithEnabled()` enables tracing.
- `exporter`: the span exporter type; supports `stdout`, `jaeger`, `zipkin`, `otlp-http`, and `otlp-grpc`.
  - `trace.WithStdoutExporter()`
  - `trace.WithJaegerExporter()`
  - `trace.WithZipkinExporter()`
  - `trace.WithOtlpHttpExporter()`
  - `trace.WithOtlpGrpcExporter()`
  - Alternatively, use `trace.WithExporter("jaeger")` to set the exporter from a string.
- `endpoint`: the backend address of the exporter.
  - For Jaeger/Zipkin it is usually a full HTTP URL, for example Jaeger's `http://localhost:14268/api/traces`.
  - For OTLP exporters use `host:port`, for example `127.0.0.1:4318`.
  - Configure it with `trace.WithEndpoint("...")`.
- `insecure`: whether a non-TLS connection is allowed; defaults to `false`.
  - Set `trace.WithInsecure()` when the OTLP HTTP exporter reports over plain HTTP.
- `propagator`: the context propagator; supports `w3c` and `b3`.
  - `trace.WithW3cPropagator()`: W3C Trace Context; recommended by default.
  - `trace.WithB3Propagator()`: B3 format; usually used together with Zipkin.
- `sample-mode`: the sampling mode; supports `always`, `never`, and `ratio`. These modes are mutually exclusive.
  - `trace.WithAlwaysMode()` samples all requests.
  - `trace.WithNeverMode()` samples nothing.
  - `trace.WithRatioMode()` samples by ratio.
- `sample-ratio`: the sampling ratio, effective only in ratio mode; valid range is `[0, 1]`.
  - `trace.WithRatio(0.5)` samples 50% of requests.

> Sample-mode options are applied in order and the last one wins. Do not mix `WithAlwaysMode` and `WithRatioMode` in the same configuration, or the earlier option may be overwritten.

## Running the stdout exporter

The stdout exporter requires no external components, which makes it ideal for verifying that tracing works locally or for inspecting trace data in a development environment.

### Get the example

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/otel/tracing/stdout
```

Example layout:

- `go-server/cmd/main.go`: the server, which listens on port 20000 over the Triple protocol.
- `go-client/cmd/main.go`: the client, which connects directly to `127.0.0.1:20000` and calls `Greet` once.
- The example uses direct connection, so no registry is needed.

### Configure the stdout exporter

Both the server and the client configure the stdout exporter in `dubbo.NewInstance`:

```go
dubbo.WithTracing(
	trace.WithEnabled(),        // enable tracing
	trace.WithStdoutExporter(), // use the stdout exporter
	trace.WithW3cPropagator(),  // W3C trace context propagation
	trace.WithAlwaysMode(),     // sample all requests
)
```

`WithAlwaysMode` samples every request so a span is produced each time. With the default ratio mode (0.5), only about half of the requests are sampled.

### Run and verify

Start the server in the first terminal:

```bash
go run ./go-server/cmd/main.go
```

Start the client in the second terminal:

```bash
go run ./go-client/cmd/main.go
```

After a successful call, the client prints a log similar to `Greet response: hello world`. The server console then shows the exporter startup logs and the span JSON:

```text
INFO tracing/tracing.go:53 tracing enabled, exporter: stdout
INFO tracing/tracing.go:54 tracing enabled, sampler: always_on
```

The span is printed as JSON with the following key fields:

```json
{
  "Name": "Greet",
  "SpanContext": {
    "TraceID": "dee1fcd3eafbcb73338aa719a9d4d4ad",
    "SpanID": "23a21f8330154882"
  },
  "Parent": {
    "TraceID": "00000000000000000000000000000000",
    "SpanID": "0000000000000000",
    "Remote": true
  },
  "StartTime": "2024-01-24T09:31:51.7352636+08:00",
  "EndTime": "2024-01-24T09:31:51.7352636+08:00",
  "Attributes": [
    {
      "Key": "rpc.system",
      "Value": { "Type": "STRING", "Value": "apache_dubbo" }
    },
    {
      "Key": "rpc.service",
      "Value": { "Type": "STRING", "Value": "greet.GreetService" }
    },
    {
      "Key": "rpc.method",
      "Value": { "Type": "STRING", "Value": "Greet" }
    }
  ],
  "Status": {
    "Code": "Ok"
  },
  "Resource": [
    {
      "Key": "service.name",
      "Value": { "Type": "STRING", "Value": "dubbo_otel_tracing_server" }
    }
  ]
}
```

Every client invocation produces a similar span on the server. See the [stdout example README](https://github.com/apache/dubbo-go-samples/blob/main/otel/tracing/stdout/README.md) for the complete output.

## Running the Jaeger exporter

### Start Jaeger

The example starts Jaeger all-in-one with Docker:

```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

`16686` is the Jaeger UI port and `14268` is the Jaeger collector HTTP port used by the example exporter.

### Get and run the example

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/otel/tracing/jaeger
```

Start the server in the first terminal:

```bash
go run ./go-server/cmd/main.go
```

Start the client in the second terminal:

```bash
go run ./go-client/cmd/main.go
```

The exporter-related configuration in the example is:

```go
dubbo.WithTracing(
	trace.WithEnabled(),
	trace.WithJaegerExporter(),
	trace.WithEndpoint("http://localhost:14268/api/traces"),
	trace.WithW3cPropagator(),
	trace.WithAlwaysMode(),
)
```

If Jaeger runs on another host or uses a different port, update the address in `WithEndpoint` accordingly.

### View the trace results

Open `http://localhost:16686` in a browser:

1. Select `dubbo_otel_jaeger_server` or `dubbo_otel_jaeger_client` from the Service dropdown.
2. Click Find Traces.
3. Click a trace to inspect the client and server span timeline.

The client example calls `TracerProvider.Shutdown` after the invocation so pending spans are flushed to Jaeger before the process exits.

## Running the OTLP HTTP exporter

The `otel/tracing/otlp_http_exporter` example covers the dubbo, triple, and jsonrpc protocols. It starts a mock OTLP receiver (listening on `127.0.0.1:4318`) inside the server process to verify that spans produced by the three protocols are exported correctly.

### Get and run the example

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/otel/tracing/otlp_http_exporter
```

Start the server in the first terminal:

```bash
go run ./go-server/cmd/main.go
```

Start the client in the second terminal:

```bash
go run ./go-client/cmd/main.go
```

The client calls the server over triple (port 20000), dubbo (port 20001), and jsonrpc (port 20002). When all six spans (three client spans plus three server spans) are exported successfully, the server prints:

```text
server count: 3, client count: 3
```

The example panics on timeout or on a span-count mismatch.

The exporter-related configuration in the example is:

```go
dubbo.WithTracing(
	trace.WithEnabled(),
	trace.WithOtlpHttpExporter(),
	trace.WithEndpoint("127.0.0.1:4318"),
	trace.WithInsecure(), // the mock receiver uses plain HTTP
	trace.WithW3cPropagator(),
	trace.WithAlwaysMode(),
)
```

In a real environment, point `endpoint` at an OpenTelemetry Collector or an OTLP-compatible backend, for example `collector.example.com:4318`. Keep `WithInsecure` when reporting over plain HTTP, and remove it when the backend uses TLS.

## How to view trace results

- **stdout exporter**: Spans are printed as JSON on the application standard output. Inspect `TraceID`, `SpanID`, `Parent`, and `Attributes`; `Attributes` contains Dubbo RPC information such as `rpc.system`, `rpc.service`, and `rpc.method`.
- **Jaeger exporter**: Query by service name in the Jaeger UI to see the full trace timeline.
- **OTLP HTTP/gRPC exporter**: Spans are sent to a Collector, which forwards them to backends such as Jaeger, Zipkin, or Grafana Tempo; query the traces in that backend's UI.

With tracing enabled, the client and server on the call chain share the same TraceID automatically. When troubleshooting, first use the stdout exporter to confirm spans are generated, then switch to a remote backend to verify network and endpoint configuration.

## FAQ

### 1. Tracing is enabled but no spans are visible

Possible causes:

- `trace.WithEnabled()` is missing. `enable` defaults to `false`, so `dubbo.WithTracing()` alone does not turn tracing on.
- The blank import `dubbo.apache.org/dubbo-go/v3/imports` is missing, so the exporter implementation is not registered.
- The default ratio mode (sampling ratio 0.5) skips some requests. For local debugging use `trace.WithAlwaysMode()`, or set the ratio to `trace.WithRatio(1.0)`.

### 2. The Jaeger UI shows no data / the endpoint is wrong

- Verify that the endpoint matches the Jaeger instance. The example uses `http://localhost:14268/api/traces`.
- Verify that the Docker port mappings for `16686` (UI) and `14268` (collector HTTP) are correct.
- Restart the application after changing the endpoint, and check the application logs for `failed to create ... exporter` or connection errors.
- The service name selected in the Jaeger UI must match `dubbo.WithName(...)`, for example `dubbo_otel_jaeger_server` or `dubbo_otel_jaeger_client`.

### 3. OTLP HTTP export fails

- Set the OTLP HTTP endpoint as `host:port`, for example `127.0.0.1:4318`; do not prefix it with `http://` and do not append the `/v1/traces` path.
- Set `trace.WithInsecure()` when the backend uses plain HTTP; otherwise the exporter establishes an HTTPS connection and TLS/handshake may fail.
- Start the Collector or backend before starting the Dubbo application.

### 4. Client and server spans are not linked into one trace

- Tracing must be enabled on both the client and the server.
- Both sides must use the same propagator: either both use `trace.WithW3cPropagator()` or both use `trace.WithB3Propagator()`. Mixing W3C on one side and B3 on the other prevents the context from being propagated.

### 5. Very few traces are visible in ratio mode

`sample-ratio` defaults to 0.5, and the sampling decision is propagated along the call chain. Use `trace.WithAlwaysMode()` while debugging, and switch back to ratio mode when you need to control cost.
