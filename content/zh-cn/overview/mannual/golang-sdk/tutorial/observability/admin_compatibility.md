---
title: 在 Dubbo Admin 中观测 Dubbo-go 服务
linkTitle: 接入 Dubbo Admin
description: 让 Dubbo-go 的指标、链路和日志在 Dubbo Admin 的观测入口中展示
type: docs
weight: 4
---

Dubbo Admin 的指标、链路和日志入口打开的是 Grafana 面板，数据分别来自 Prometheus、Jaeger 和 Loki/Elasticsearch。Admin 对 Dubbo Java 和 Dubbo-go 使用同一套面板，Dubbo-go 应用只需要按约定导出数据：

- 指标：通过 Prometheus exporter 暴露，由 Prometheus 抓取；
- 链路：通过 OTLP 上报到 OpenTelemetry Collector 或 Jaeger；
- 日志：在日志中输出 `trace_id`，由日志采集链路写入 Loki 或 Elasticsearch。

在 Admin 中查看应用、实例和服务，见[在 Dubbo Admin 中查看 Dubbo-go 服务]({{< relref "../service-discovery/admin_compatibility.md" >}})。

## 字段约定

Admin 通过下列字段把同一次调用的指标、链路和日志关联起来：

| 含义 | 指标 label | 链路属性 | 日志字段 |
|---|---|---|---|
| 应用 | `application_name` | `service.name`（resource） | — |
| 服务 | `interface` | `rpc.service` | — |
| 方法 | `method` | `rpc.method` | — |
| 调用侧 | 指标名前缀 `dubbo_provider_` / `dubbo_consumer_` | span kind `server` / `client` | — |
| 实例 | `ip` | — | — |
| 分组、版本 | `group`、`version` | `dubbo.group`、`dubbo.version` | — |
| 链路 | — | trace ID、span ID | `trace_id`、`span_id` |

`rpc.service` 只包含接口全限定名，与指标的 `interface` 相同。Dubbo-go v3.3.2 及更早版本会把 `rpc.service` 写成 `group/interface:version`，Admin 自带的 Collector 配置会先把它规范化再关联指标。

Admin 的日志面板同时识别 Dubbo-go 的 `trace_id`、`span_id` 和 Dubbo Java 的 `traceId`、`spanId`。

## 配置 Dubbo-go

```go
import (
	"dubbo.apache.org/dubbo-go/v3"
	dubbolog "dubbo.apache.org/dubbo-go/v3/logger"
	"dubbo.apache.org/dubbo-go/v3/metrics"
	"dubbo.apache.org/dubbo-go/v3/otel/trace"
)

ins, err := dubbo.NewInstance(
	dubbo.WithName("admin-demo-server"),
	// ... registry, protocol
	dubbo.WithMetrics(
		metrics.WithEnabled(),
		metrics.WithPrometheus(),
		metrics.WithPrometheusExporterEnabled(),
		metrics.WithPort(9099),
		metrics.WithPath("/metrics"),
	),
	dubbo.WithTracing(
		trace.WithEnabled(),
		trace.WithOtlpHttpExporter(),
		trace.WithW3cPropagator(),
		trace.WithAlwaysMode(),
		trace.WithEndpoint("127.0.0.1:4318"),
		trace.WithInsecure(),
	),
	dubbo.WithLogger(
		dubbolog.WithZap(),
		dubbolog.WithFormat("json"),
		dubbolog.WithTraceIntegration(true),
	),
)
```

### 指标

指标总开关默认关闭，必须调用 `metrics.WithEnabled()`。exporter 默认监听 `9090` 端口，与 Prometheus 的默认端口相同，两者部署在同一台机器上时需要改端口。

Prometheus 需要能抓取每个实例的 exporter 地址。Admin 发布包中的 ServiceMonitor 只选择名为 `dubbo-qos` 的端口，不会自动发现 Dubbo-go 的 exporter，需要为它单独配置抓取目标。详见 Admin 文档 [Dubbo Java and Go metric compatibility](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-metric-compatibility.md)。

更多参数见[指标监控]({{< relref "./rpc_metrics.md" >}})。

### 链路

上述配置通过 OTLP HTTP 把 span 上报到 `127.0.0.1:4318`，可以直接指向开启了 OTLP 接收的 Jaeger，也可以指向 Admin 部署中的 OpenTelemetry Collector。更多参数见[链路追踪]({{< relref "./tracing.md" >}})。

### 日志

`WithTraceIntegration(true)` 对通过 `CtxLogger` 输出、且 context 中带有 span 的日志生效。业务代码中这样打日志：

```go
import (
	dubbolog "dubbo.apache.org/dubbo-go/v3/logger"
	"github.com/dubbogo/gost/log/logger"
)

func (s *GreetServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	if l, ok := logger.GetLogger().(dubbolog.CtxLogger); ok {
		l.CtxInfof(ctx, "greet name=%s", req.Name)
	}
	// ...
}
```

输出（省略了 `time` 和 `line` 字段）：

```json
{"level":"INFO","msg":"greet name=call","trace_id":"52734da07177b8661c4797a2dd22d2be","span_id":"9d3830897d0bea04","trace_flags":"01"}
```

日志的采集与字段映射见 Admin 文档 [Log integration](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-log-integration.md)。

## 配置 Dubbo Admin

在 Admin 配置中填写 Prometheus、Grafana 和 Jaeger 的地址，以及各面板的 Grafana URL：

```yaml
observability:
  grafana: http://127.0.0.1:3000
  prometheus: http://127.0.0.1:9090/
  jaeger: http://127.0.0.1:16686   # 日志页面按 Trace ID 查询时使用
console:
  metricDashboards:
    application: http://127.0.0.1:3000/d/a0b114ca-edf7-4dfe-ac2c-34a4fc545fed?kiosk=1&theme=light
    instance: http://127.0.0.1:3000/d/dcf5defe-d198-4704-9edf-6520838880e9?kiosk=1&theme=light
    service: http://127.0.0.1:3000/d/ec689613-b4a1-45b1-b8bd-9d557059f970?kiosk=1&theme=light
```

面板定义和 Collector 配置位于 Admin 仓库的 [release/kubernetes/monitoring](https://github.com/apache/dubbo-admin/tree/develop/release/kubernetes/monitoring) 目录，完整配置项见 [dubbo-admin.yaml](https://github.com/apache/dubbo-admin/blob/develop/app/dubbo-admin/dubbo-admin.yaml)。

## 面板支持情况

Admin 的应用、实例、服务三个指标面板中，Dubbo-go 支持请求量、QPS、成功和失败数、各类失败原因、RT（平均、最大、最小、P50 至 P99）等面板。以下面板需要额外配置，或暂时没有数据：

| 面板 | 说明 |
|---|---|
| 响应时延热点图 | 需要开启 `metrics.WithHistogramEnabled()` |
| 注册中心、元数据中心相关面板 | 需要开启 `metrics.WithRegistryEnabled()`、`metrics.WithMetadataEnabled()` |
| 注册实例次数、实例注册时长 | 使用应用级服务发现时暂无数据 |
| 线程池 | 仅 Dubbo Java 提供 |

此外：

- 超时、网络、序列化等失败原因面板在发生对应失败后才有数据。
- provider 应用的「作为消费者」面板没有数据，consumer 应用的「作为生产者」面板同理。

## 验证接入

在 Prometheus 中确认以下查询有结果，且 `interface` 不包含 group 和 version：

```promql
dubbo_application_info_total{application_name="admin-demo-server"}
sum by (application_name, interface, method, ip) (rate(dubbo_provider_requests_total{application_name="admin-demo-server"}[1m]))
sum by (application_name, interface, method, ip) (rate(dubbo_consumer_requests_total{application_name="admin-demo-client"}[1m]))
```

在 Jaeger 中，同一次调用的 consumer span 和 provider span 属于同一个 trace，`rpc.service` 与指标的 `interface` 相同：

```text
admin-demo-client | Greet | span.kind=client rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
admin-demo-server | Greet | span.kind=server rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
```

业务日志中的 `trace_id` 可以在 Jaeger 中查到对应的 trace。

## 常见问题

### 1. Admin 的指标面板没有数据

1. 确认调用了 `metrics.WithEnabled()`，并能访问 `http://<实例 IP>:<端口>/metrics`。
2. 在 Prometheus 的 Targets 页面确认该地址状态为 UP。
3. 确认 Grafana 面板使用的数据源指向这个 Prometheus。

### 2. RT 面板为空，但请求量面板有数据

RT 面板的查询带有 `>0` 条件。耗时不到 1 毫秒的调用 RT 记为 0，面板会显示为空，属于正常现象。

### 3. 按 Trace ID 查不到日志

确认开启了 `WithTraceIntegration(true)`，并且日志是通过 `CtxLogger` 带着请求的 context 输出的。没有 context 的日志不带 `trace_id`。

