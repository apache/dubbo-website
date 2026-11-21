---
title: 在 Dubbo Admin 中观测 Dubbo-go 服务
linkTitle: 接入 Dubbo Admin
description: Dubbo-go 需要导出哪些指标、链路和日志字段，才能在 Dubbo Admin 的指标、链路和日志入口中展示，以及各面板的支持情况
type: docs
weight: 4
---

Dubbo Admin 的指标、链路和日志入口本身不采集数据，它们打开的是 Grafana 面板，数据分别来自 Prometheus、Jaeger 和 Loki/Elasticsearch。Dubbo-go 应用只需要按约定导出数据：

- 指标：通过 Prometheus exporter 暴露，由 Prometheus 抓取；
- 链路：通过 OTLP 上报到 OpenTelemetry Collector 或 Jaeger；
- 日志：在日志中输出 `trace_id`，由日志采集链路写入 Loki 或 Elasticsearch。

Admin 对 Dubbo Java 和 Dubbo-go 使用同一套面板和查询，两者靠下表中的字段对齐。

以下内容基于 Dubbo Admin `develop` 分支（[65bce33](https://github.com/apache/dubbo-admin/commit/65bce33)）和 Dubbo-go `develop` 分支（[ba67101](https://github.com/apache/dubbo-go/commit/ba671017)），使用 Nacos、Prometheus 2.55 和 Jaeger 1.57 验证。

## 字段约定

| 含义 | 指标 label | 链路属性 | 日志字段 |
|---|---|---|---|
| 应用 | `application_name` | `service.name`（resource） | — |
| 服务 | `interface` | `rpc.service` | — |
| 方法 | `method` | `rpc.method` | — |
| 调用侧 | 指标名前缀 `dubbo_provider_` / `dubbo_consumer_` | span kind `server` / `client` | — |
| 实例 | `ip` | — | — |
| 分组、版本 | `group`、`version` | `dubbo.group`、`dubbo.version` | — |
| 链路 | — | trace ID、span ID | `trace_id`、`span_id` |

`rpc.service` 只包含接口全限定名，与指标的 `interface` 一致；group 和 version 放在单独的属性中。Dubbo-go v3.3.2 及更早版本会把 `rpc.service` 写成 `group/interface:version`，在 `develop` 分支中已修复（[#3724](https://github.com/apache/dubbo-go/pull/3724)、[#3743](https://github.com/apache/dubbo-go/pull/3743)）。使用旧版本时，Admin 自带的 Collector 配置会把它规范化后再关联指标，见 Admin 文档 [Trace to metric correlation](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-trace-to-metric.md)。

日志字段沿用 Dubbo-go 已有的 `trace_id`、`span_id`，Admin 的日志面板同时兼容 Dubbo Java 的 `traceId`、`spanId`。

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

**指标**：指标总开关默认关闭，必须调用 `metrics.WithEnabled()`。exporter 默认监听 `9090` 端口，与 Prometheus 自身的默认端口相同，在同一台机器上运行时需要改端口。Prometheus 需要能抓取到每个实例的这个地址；Admin 发布包中的 ServiceMonitor 只选择名为 `dubbo-qos` 的端口，不会自动发现 Dubbo-go 的 exporter，需要为它单独配置抓取目标，见 Admin 文档 [Dubbo Java and Go metric compatibility](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-metric-compatibility.md)。

**链路**：上述配置把 span 通过 OTLP HTTP 上报到 `127.0.0.1:4318`，可以直接指向 Jaeger（需开启 OTLP 接收），也可以指向 Admin 部署中的 OpenTelemetry Collector。更多参数见[链路追踪]({{< relref "./tracing.md" >}})。

**日志**：`WithTraceIntegration(true)` 只对通过 `CtxLogger` 输出、且 context 中带有 span 的日志生效。业务代码需要这样打日志：

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

框架自身的日志不带 `trace_id`。日志的采集与字段映射见 Admin 文档 [Log integration](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-log-integration.md)。

## 配置 Admin

在 Admin 配置中填写 Prometheus、Grafana 和 Jaeger 的地址，以及各类面板的 Grafana URL：

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

面板定义和 Collector 配置位于 Admin 仓库的 [release/kubernetes/monitoring](https://github.com/apache/dubbo-admin/tree/develop/release/kubernetes/monitoring)，完整配置项见 [dubbo-admin.yaml](https://github.com/apache/dubbo-admin/blob/develop/app/dubbo-admin/dubbo-admin.yaml)。

## 指标面板支持情况

Admin 的应用、实例、服务三个指标面板共 254 条查询。将上述应用接入后，用应用名、IP、接口名和方法名代入每条查询，在 Prometheus 中执行的结果如下：

| 面板 | 说明 |
|---|---|
| 请求量、QPS、成功数、业务失败数 | 有数据 |
| 平均、最大、最小 RT，P50 至 P99，最近一次 RT | 有数据 |
| 超时、服务不可用、网络、序列化、未知原因等失败分类 | Dubbo-go 均有对应指标，发生该类失败后才有数据 |
| 响应时延热点图 | 需要 `metrics.WithHistogramEnabled()` |
| 注册实例次数、实例注册时长 | 暂无数据。应用级服务发现下 Dubbo-go 目前不记录实例注册指标，修复见 [#3847](https://github.com/apache/dubbo-go/pull/3847) |
| 线程池 | 仅 Dubbo Java 提供 |

几点说明：

- provider 应用的「作为消费者」面板没有数据是正常的，consumer 应用同理。
- RT 类面板的查询带有 `>0` 条件。耗时不到 1 毫秒的调用 RT 记为 0，面板会显示为空。
- 注册中心和元数据中心相关面板需要额外开启 `metrics.WithRegistryEnabled()`、`metrics.WithMetadataEnabled()`。

## 链路与日志入口

在 Jaeger 中，同一次调用的 consumer 和 provider span 属于同一个 trace，属性如下：

```text
admin-demo-client | Greet | span.kind=client rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
admin-demo-server | Greet | span.kind=server rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
```

provider 日志中的 `trace_id` 可以在 Jaeger 中查到这个 trace，`span_id` 与 provider span 一致。Admin 日志页面按 Trace ID 查询时调用的是下面的接口，Dubbo-go 的 trace 能正常返回：

```shell
curl -b cookie.txt "http://127.0.0.1:8888/api/v1/trace/start-time?traceId=7d8c108ce7e7c3189948de7b35022038"
# {"code":"Success","data":{"traceId":"7d8c108ce7e7c3189948de7b35022038","startTime":1795275323428}}
```

span 名称目前只有方法名（如 `Greet`），不影响 Admin 按 `rpc.service`、`rpc.method` 做关联。

## 检查清单

接入后在 Prometheus 和 Jaeger 中确认：

```promql
dubbo_application_info_total{application_name="admin-demo-server"}
sum by (application_name, interface, method, ip) (rate(dubbo_provider_requests_total{application_name="admin-demo-server"}[1m]))
sum by (application_name, interface, method, ip) (rate(dubbo_consumer_requests_total{application_name="admin-demo-client"}[1m]))
```

- 三条查询都有结果，且 `interface` 不含 group 和 version。
- Jaeger 中能按应用名查到服务，span 的 `rpc.service` 与指标的 `interface` 相同。
- 业务日志中带有 `trace_id`，且能在 Jaeger 中查到对应 trace。

在 Admin 中查看应用、实例和服务的方法见[在 Dubbo Admin 中查看 Dubbo-go 服务]({{< relref "../service-discovery/admin_compatibility.md" >}})。
