---
title: Observing Dubbo-go Services in Dubbo Admin
linkTitle: Dubbo Admin integration
description: The metrics, trace and log fields Dubbo-go needs to export to appear in Dubbo Admin's metric, trace and log views, and which dashboard panels are supported
type: docs
weight: 4
---

Dubbo Admin's metric, trace and log views do not collect data themselves. They open Grafana dashboards backed by Prometheus, Jaeger and Loki or Elasticsearch. A Dubbo-go application only needs to export data in the expected shape:

- Metrics: exposed by the Prometheus exporter and scraped by Prometheus;
- Traces: sent over OTLP to an OpenTelemetry Collector or Jaeger;
- Logs: carry `trace_id`, and are shipped to Loki or Elasticsearch by a log pipeline.

Admin uses the same dashboards and queries for Dubbo Java and Dubbo-go, matched on the fields in the table below.

The steps below were verified with Nacos, Prometheus 2.55, Jaeger 1.57, the Dubbo Admin `develop` branch ([65bce33](https://github.com/apache/dubbo-admin/commit/65bce33)) and the Dubbo-go `develop` branch ([ba67101](https://github.com/apache/dubbo-go/commit/ba671017)).

## Field mapping

| Meaning | Metric label | Trace attribute | Log field |
|---|---|---|---|
| Application | `application_name` | `service.name` (resource) | — |
| Service | `interface` | `rpc.service` | — |
| Method | `method` | `rpc.method` | — |
| Side | metric name prefix `dubbo_provider_` / `dubbo_consumer_` | span kind `server` / `client` | — |
| Instance | `ip` | — | — |
| Group, version | `group`, `version` | `dubbo.group`, `dubbo.version` | — |
| Trace | — | trace ID, span ID | `trace_id`, `span_id` |

`rpc.service` contains only the fully qualified interface name, the same as the metric's `interface`; group and version are separate attributes. Dubbo-go v3.3.2 and earlier write `rpc.service` as `group/interface:version`; this is fixed on the `develop` branch ([#3724](https://github.com/apache/dubbo-go/pull/3724), [#3743](https://github.com/apache/dubbo-go/pull/3743)). For older versions, the Collector configuration shipped with Admin normalizes the value before correlating it with metrics; see the Admin document [Trace to metric correlation](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-trace-to-metric.md).

The log fields keep Dubbo-go's existing `trace_id` and `span_id`. Admin's log dashboards also accept Dubbo Java's `traceId` and `spanId`.

## Configuring Dubbo-go

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

**Metrics**: the metrics master switch is off by default, so `metrics.WithEnabled()` is required. The exporter listens on port `9090` by default, which is also Prometheus's own default port; change it when both run on one machine. Prometheus must be able to scrape this address on every instance. The ServiceMonitor shipped with Admin only selects a port named `dubbo-qos` and does not discover Dubbo-go's exporter, so configure a scrape target for it; see the Admin document [Dubbo Java and Go metric compatibility](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-metric-compatibility.md).

**Traces**: the configuration above sends spans over OTLP HTTP to `127.0.0.1:4318`. This can point directly at Jaeger with OTLP ingestion enabled, or at the OpenTelemetry Collector in an Admin deployment. For more options, see [Tracing]({{< relref "./tracing.md" >}}).

**Logs**: `WithTraceIntegration(true)` only applies to logs written through `CtxLogger` with a span in the context. Business code logs like this:

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

Output (the `time` and `line` fields are omitted):

```json
{"level":"INFO","msg":"greet name=call","trace_id":"52734da07177b8661c4797a2dd22d2be","span_id":"9d3830897d0bea04","trace_flags":"01"}
```

The framework's own logs do not carry `trace_id`. For log collection and field mapping, see the Admin document [Log integration](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-log-integration.md).

## Configuring Admin

Set the Prometheus, Grafana and Jaeger addresses and the Grafana URL of each dashboard in the Admin configuration:

```yaml
observability:
  grafana: http://127.0.0.1:3000
  prometheus: http://127.0.0.1:9090/
  jaeger: http://127.0.0.1:16686   # used for Trace ID search on log pages
console:
  metricDashboards:
    application: http://127.0.0.1:3000/d/a0b114ca-edf7-4dfe-ac2c-34a4fc545fed?kiosk=1&theme=light
    instance: http://127.0.0.1:3000/d/dcf5defe-d198-4704-9edf-6520838880e9?kiosk=1&theme=light
    service: http://127.0.0.1:3000/d/ec689613-b4a1-45b1-b8bd-9d557059f970?kiosk=1&theme=light
```

The dashboard definitions and Collector configuration are in [release/kubernetes/monitoring](https://github.com/apache/dubbo-admin/tree/develop/release/kubernetes/monitoring) in the Admin repository. For all options, see [dubbo-admin.yaml](https://github.com/apache/dubbo-admin/blob/develop/app/dubbo-admin/dubbo-admin.yaml).

## Metric dashboard coverage

Admin's application, instance and service metric dashboards contain 254 queries. With the application above connected, each query was run in Prometheus with the application name, IP, interface and method filled in:

| Panels | Result |
|---|---|
| Requests, QPS, successes, business failures | Data shown |
| Average, max and min RT, P50 to P99, last RT | Data shown |
| Failures by cause: timeout, service unavailable, network, codec, unknown | Dubbo-go exports all of them; data appears once such a failure happens |
| Latency heatmap | Requires `metrics.WithHistogramEnabled()` |
| Instance registrations, instance registration time | No data. Dubbo-go does not currently record instance registration metrics with application-level discovery; see [#3847](https://github.com/apache/dubbo-go/pull/3847) for the fix |
| Thread pool | Dubbo Java only |

Notes:

- The "as consumer" panels of a provider application are empty, and the same applies the other way round for a consumer application.
- The RT queries filter with `>0`. A call that takes less than 1 ms is recorded with an RT of 0, so the panel looks empty.
- The registry and metadata center panels also need `metrics.WithRegistryEnabled()` and `metrics.WithMetadataEnabled()`.

## Trace and log views

In Jaeger, the consumer and provider spans of one call belong to the same trace, with these attributes:

```text
admin-demo-client | Greet | span.kind=client rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
admin-demo-server | Greet | span.kind=server rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
```

The `trace_id` in the provider log finds this trace in Jaeger, and its `span_id` matches the provider span. When the Admin log page searches by Trace ID, it calls the API below, which returns Dubbo-go traces:

```shell
curl -b cookie.txt "http://127.0.0.1:8888/api/v1/trace/start-time?traceId=7d8c108ce7e7c3189948de7b35022038"
# {"code":"Success","data":{"traceId":"7d8c108ce7e7c3189948de7b35022038","startTime":1795275323428}}
```

Span names are currently just the method name, such as `Greet`. This does not affect Admin, which correlates on `rpc.service` and `rpc.method`.

## Checklist

After connecting the application, check in Prometheus and Jaeger:

```promql
dubbo_application_info_total{application_name="admin-demo-server"}
sum by (application_name, interface, method, ip) (rate(dubbo_provider_requests_total{application_name="admin-demo-server"}[1m]))
sum by (application_name, interface, method, ip) (rate(dubbo_consumer_requests_total{application_name="admin-demo-client"}[1m]))
```

- All three queries return data, and `interface` contains neither group nor version.
- Jaeger lists the service under the application name, and the span's `rpc.service` equals the metric's `interface`.
- Business logs carry `trace_id`, and the trace can be found in Jaeger.

To view the application's instances, services and methods in Admin, see [Viewing Dubbo-go Services in Dubbo Admin]({{< relref "../service-discovery/admin_compatibility.md" >}}).
