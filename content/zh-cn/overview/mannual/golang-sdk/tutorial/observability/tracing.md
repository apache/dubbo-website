---
description: 全链路追踪
title: 链路追踪
linkTitle: 全链路追踪
type: docs
weight: 3
---

Dubbo-go 基于 [OpenTelemetry](https://opentelemetry.io/) 标准提供全链路追踪能力。开启 tracing 后，Dubbo-go 会在 RPC 调用过程中自动创建 Span，并通过配置的 exporter 将 Span 导出到不同的后端系统。

当前支持的 exporter 包括：

- `stdout`：以 JSON 形式把 Span 打印到进程标准输出，适合本地开发与调试。
- `jaeger`：上报到 [Jaeger](https://www.jaegertracing.io/)。
- `zipkin`：上报到 [Zipkin](https://zipkin.io/)。
- `otlp-http`：通过 OTLP/HTTP 上报到 OpenTelemetry Collector 等后端。
- `otlp-grpc`：通过 OTLP/gRPC 上报到 OpenTelemetry Collector 等后端。

其中 stdout、jaeger、otlp-http 在 [dubbo-go-samples/otel/tracing](https://github.com/apache/dubbo-go-samples/tree/main/otel/tracing) 下有可直接运行的示例，下文分别介绍其运行方式。

## 使用方式

- 目前仅支持通过 `dubbo.NewInstance` 创建 dubbo 应用（即快速开始中介绍的微服务应用模式）时开启 tracing；轻量 RPC API 暂不支持。
- 使用 tracing 前需要导入 `dubbo.apache.org/dubbo-go/v3/imports` 空包，用于注册各 exporter 的实现。
- 通过 `dubbo.WithTracing(...)` 配置 tracing，内部使用 `trace.WithXXX` 子选项控制 exporter、endpoint、传播器和采样策略。

下面是一段最简配置：

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
			trace.WithEnabled(),        // 开启 tracing
			trace.WithStdoutExporter(), // 使用 stdout exporter
			trace.WithW3cPropagator(),  // 使用 W3C trace context 传播
			trace.WithAlwaysMode(),     // 全量采样，便于本地验证
		),
	)
	if err != nil {
		panic(err)
	}
	_ = ins
}
```

`dubbo.WithTracing()` 不传任何参数时，使用默认配置：

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

注意默认 `enable: false`，必须通过 `trace.WithEnabled()`（或 YAML 配置 `tracing.enable: true`）真正开启功能。

## dubbo.WithTracing 常用参数

- `enable`：是否开启 tracing，默认 `false`。
  - `trace.WithEnabled()`：开启 tracing。
- `exporter`：Span exporter 类型，支持 `stdout`、`jaeger`、`zipkin`、`otlp-http`、`otlp-grpc`。
  - `trace.WithStdoutExporter()`
  - `trace.WithJaegerExporter()`
  - `trace.WithZipkinExporter()`
  - `trace.WithOtlpHttpExporter()`
  - `trace.WithOtlpGrpcExporter()`
  - 也可以使用 `trace.WithExporter("jaeger")` 按字符串设置。
- `endpoint`：exporter 后端地址。
  - Jaeger/Zipkin 一般为完整 HTTP 地址，例如 Jaeger 为 `http://localhost:14268/api/traces`。
  - OTLP exporter 一般填写 `host:port`，例如 `127.0.0.1:4318`。
  - 使用 `trace.WithEndpoint("...")` 配置。
- `insecure`：是否允许非 TLS 连接，默认 `false`。
  - OTLP HTTP 使用纯 HTTP 上报时需要设置 `trace.WithInsecure()`。
- `propagator`：上下文传播器，支持 `w3c` 和 `b3`。
  - `trace.WithW3cPropagator()`：W3C Trace Context，推荐默认使用。
  - `trace.WithB3Propagator()`：B3 格式，通常与 Zipkin 搭配使用。
- `sample-mode`：采样模式，支持 `always`、`never`、`ratio`，三者互斥。
  - `trace.WithAlwaysMode()`：全量采样。
  - `trace.WithNeverMode()`：不采样。
  - `trace.WithRatioMode()`：按比例采样。
- `sample-ratio`：采样比例，仅在 ratio 模式下生效，取值范围 `[0, 1]`。
  - `trace.WithRatio(0.5)`：采样 50%。

> 多个 sample-mode 选项按调用顺序覆盖，后设置的最后生效；不要在同一个配置里混用 `WithAlwaysMode` 和 `WithRatioMode`，否则前面的设置可能被覆盖。

## Stdout exporter 运行方式

stdout exporter 不需要启动任何外部组件，适合在本地快速验证 tracing 是否正常工作，或在开发环境直接查看调用链数据。

### 获取示例

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/otel/tracing/stdout
```

示例目录说明：

- `go-server/cmd/main.go`：服务端，Triple 协议监听 20000 端口。
- `go-client/cmd/main.go`：客户端，直连 `127.0.0.1:20000` 并调用一次 `Greet`。
- 示例使用直连方式，运行前不需要启动注册中心。

### 配置 stdout exporter

服务端与客户端均在 `dubbo.NewInstance` 中配置 stdout exporter：

```go
dubbo.WithTracing(
	trace.WithEnabled(),        // 开启 tracing
	trace.WithStdoutExporter(), // 使用 stdout exporter
	trace.WithW3cPropagator(),  // W3C trace context 传播
	trace.WithAlwaysMode(),     // 全量采样
)
```

这里使用 `WithAlwaysMode` 全量采样，保证每次调用都能产生 Span；如果使用默认的 ratio 模式（0.5），大约只有一半请求会被采样。

### 启动并验证

在第一个终端启动服务端：

```bash
go run ./go-server/cmd/main.go
```

在第二个终端启动客户端：

```bash
go run ./go-client/cmd/main.go
```

客户端调用成功后，终端会输出类似 `Greet response: hello world` 的日志。随后在服务端控制台可以看到 exporter 启动日志和本次调用的 Span JSON：

```text
INFO tracing/tracing.go:53 tracing enabled, exporter: stdout
INFO tracing/tracing.go:54 tracing enabled, sampler: always_on
```

Span 以 JSON 形式打印，关键字段如下：

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

每次客户端调用都会在服务端输出一段类似的 Span。完整输出示例可参考 [stdout 示例 README](https://github.com/apache/dubbo-go-samples/blob/main/otel/tracing/stdout/README_zh.md)。

## Jaeger exporter 运行方式

### 启动 Jaeger

示例使用 Docker 启动 Jaeger all-in-one：

```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

其中 `16686` 是 Jaeger UI 端口，`14268` 是 Jaeger collector HTTP 端口（示例 exporter 使用该端口上报）。

### 获取并运行示例

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/otel/tracing/jaeger
```

第一个终端启动服务端：

```bash
go run ./go-server/cmd/main.go
```

第二个终端启动客户端：

```bash
go run ./go-client/cmd/main.go
```

示例中 exporter 相关配置如下：

```go
dubbo.WithTracing(
	trace.WithEnabled(),
	trace.WithJaegerExporter(),
	trace.WithEndpoint("http://localhost:14268/api/traces"),
	trace.WithW3cPropagator(),
	trace.WithAlwaysMode(),
)
```

如果 Jaeger 不在本机或修改了端口，需要同步修改 `WithEndpoint` 中的地址。

### 查看 trace 结果

打开浏览器访问 `http://localhost:16686`：

1. 在 Service 下拉框中选择 `dubbo_otel_jaeger_server` 或 `dubbo_otel_jaeger_client`。
2. 点击 Find Traces。
3. 点击某条 trace 即可查看客户端、服务端的 Span 时间线。

客户端示例在调用结束后会调用 `TracerProvider.Shutdown`，确保 Span 在进程退出前被刷新到 Jaeger。

## OTLP HTTP exporter 运行方式

`otel/tracing/otlp_http_exporter` 示例覆盖 dubbo、triple、jsonrpc 三种协议，并在服务端进程内启动一个 mock OTLP receiver（监听 `127.0.0.1:4318`），用于校验三种协议产生的 Span 是否正确上报。

### 获取并运行示例

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/otel/tracing/otlp_http_exporter
```

第一个终端启动服务端：

```bash
go run ./go-server/cmd/main.go
```

第二个终端启动客户端：

```bash
go run ./go-client/cmd/main.go
```

客户端会分别通过 triple（20000 端口）、dubbo（20001 端口）和 jsonrpc（20002 端口）调用服务端。如果 6 个 Span（3 个客户端 Span + 3 个服务端 Span）都成功上报，服务端终端会输出：

```text
server count: 3, client count: 3
```

如果超时或数量不匹配，示例会直接 panic。

示例中 exporter 相关配置如下：

```go
dubbo.WithTracing(
	trace.WithEnabled(),
	trace.WithOtlpHttpExporter(),
	trace.WithEndpoint("127.0.0.1:4318"),
	trace.WithInsecure(), // mock receiver 使用纯 HTTP
	trace.WithW3cPropagator(),
	trace.WithAlwaysMode(),
)
```

在真实环境中，把 endpoint 改为 OpenTelemetry Collector 或兼容 OTLP 的观测后端即可，例如 `collector.example.com:4318`。纯 HTTP 上报时保留 `WithInsecure`；如果后端启用了 TLS，则去掉该选项。

## 如何查看 trace 结果

- **stdout exporter**：Span 以 JSON 打印在应用标准输出中。关注 `TraceID`、`SpanID`、`Parent` 和 `Attributes`，其中 `Attributes` 会携带 `rpc.system`、`rpc.service`、`rpc.method` 等 Dubbo RPC 信息。
- **Jaeger exporter**：在 Jaeger UI 中按服务名查询，可看到完整调用链时间线。
- **OTLP HTTP/gRPC exporter**：Span 上报到 Collector 后，由 Collector 转发到 Jaeger、Zipkin、Grafana Tempo 等后端，在这些后端的 UI 中查询。

开启 tracing 后，调用链上服务端和客户端会自动共享 TraceID。排查时可以先用 stdout exporter 确认 Span 能正常生成，再切换到远程后端验证网络与 endpoint 配置。

## 常见问题

### 1. 开启了 tracing 却看不到 Span

可能原因：

- 忘记调用 `trace.WithEnabled()`。`enable` 默认是 `false`，只传入 `dubbo.WithTracing()` 不会开启功能。
- 没有导入 `dubbo.apache.org/dubbo-go/v3/imports`，导致 exporter 实现未注册。
- 使用默认 ratio 模式（采样率 0.5），部分请求没有被采样。本地调试建议改用 `trace.WithAlwaysMode()`，或把采样率调成 `trace.WithRatio(1.0)`。

### 2. Jaeger 页面没有数据 / endpoint 配错

- 确认 endpoint 与 Jaeger 实例一致。示例默认使用 `http://localhost:14268/api/traces`。
- 确认 Docker 端口映射正常，`16686`（UI）和 `14268`（collector HTTP）都已暴露。
- 修改 endpoint 后需要重启应用；同时观察应用日志中是否有 `failed to create ... exporter` 或连接失败错误。
- Jaeger UI 中查询的服务名要与应用 `dubbo.WithName(...)` 配置一致，例如 `dubbo_otel_jaeger_server`、`dubbo_otel_jaeger_client`。

### 3. OTLP HTTP 上报失败

- OTLP HTTP endpoint 填 `host:port`，例如 `127.0.0.1:4318`，不要带 `http://` 前缀，也不要追加 `/v1/traces` 路径。
- 后端是纯 HTTP 时必须设置 `trace.WithInsecure()`；否则 exporter 会按 HTTPS 建立连接，导致 TLS/握手失败。
- 先启动 Collector 或后端，再启动 dubbo 应用。

### 4. 客户端与服务端的 Span 没有串联成一条 trace

- 客户端和服务端都需要开启 tracing。
- 两端 propagator 需要一致：都使用 `trace.WithW3cPropagator()`，或都使用 `trace.WithB3Propagator()`，避免一边用 W3C、另一边用 B3 导致上下文无法传递。

### 5. 使用 ratio 模式时看到的 trace 很少

`sample-ratio` 默认是 0.5，且采样决策会沿调用链传递。调试阶段建议使用 `trace.WithAlwaysMode()`；需要控制成本时再切回 ratio 模式并调整比例。
