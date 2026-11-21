---
title: Observing Dubbo-go Services in Dubbo Admin
linkTitle: Dubbo Admin integration
description: Show Dubbo-go metrics, traces and logs in Dubbo Admin's observability views
type: docs
weight: 4
---

Dubbo Admin's metric, trace and log views open Grafana dashboards backed by Prometheus, Jaeger and Loki or Elasticsearch. Admin uses the same dashboards for Dubbo Java and Dubbo-go, so a Dubbo-go application only needs to export data in the expected shape:

- Metrics: exposed by the Prometheus exporter and scraped by Prometheus;
- Traces: sent over OTLP to an OpenTelemetry Collector or Jaeger;
- Logs: carry `trace_id`, and are shipped to Loki or Elasticsearch by a log pipeline.

To view applications, instances and services in Admin, see [Viewing Dubbo-go Services in Dubbo Admin]({{< relref "../service-discovery/admin_compatibility.md" >}}).

## Field mapping

Admin correlates the metrics, traces and logs of one call on these fields:

| Meaning | Metric label | Trace attribute | Log field |
|---|---|---|---|
| Application | `application_name` | `service.name` (resource) | — |
| Service | `interface` | `rpc.service` | — |
| Method | `method` | `rpc.method` | — |
| Side | metric name prefix `dubbo_provider_` / `dubbo_consumer_` | span kind `server` / `client` | — |
| Instance | `ip` | — | — |
| Group, version | `group`, `version` | `dubbo.group`, `dubbo.version` | — |
| Trace | — | trace ID, span ID | `trace_id`, `span_id` |

`rpc.service` contains only the fully qualified interface name, the same as the metric's `interface`. Dubbo-go v3.3.2 and earlier write `rpc.service` as `group/interface:version`; the Collector configuration shipped with Admin normalizes it before correlating it with metrics.

Admin's log dashboards accept both Dubbo-go's `trace_id` and `span_id` and Dubbo Java's `traceId` and `spanId`.

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

### Metrics

The metrics master switch is off by default, so `metrics.WithEnabled()` is required. The exporter listens on port `9090` by default, which is also Prometheus's default port; change it when both run on one machine.

Prometheus must be able to scrape the exporter on every instance. The ServiceMonitor shipped with Admin only selects a port named `dubbo-qos` and does not discover Dubbo-go's exporter, so configure a scrape target for it. See the Admin document [Dubbo Java and Go metric compatibility](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-metric-compatibility.md).

For more options, see [Metrics]({{< relref "./rpc_metrics.md" >}}).

### Traces

The configuration above sends spans over OTLP HTTP to `127.0.0.1:4318`. This can point directly at Jaeger with OTLP ingestion enabled, or at the OpenTelemetry Collector in an Admin deployment. For more options, see [Tracing]({{< relref "./tracing.md" >}}).

### Logs

`WithTraceIntegration(true)` applies to logs written through `CtxLogger` with a span in the context. Business code logs like this:

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

For log collection and field mapping, see the Admin document [Log integration](https://github.com/apache/dubbo-admin/blob/develop/docs/observability-log-integration.md).

## Configuring Dubbo Admin

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

## Dashboard coverage

In Admin's application, instance and service metric dashboards, Dubbo-go supports the panels for requests, QPS, successes and failures, failure causes, and RT (average, max, min, P50 to P99). These panels need extra configuration or have no data yet:

| Panels | Notes |
|---|---|
| Latency heatmap | Requires `metrics.WithHistogramEnabled()` |
| Registry and metadata center panels | Require `metrics.WithRegistryEnabled()` and `metrics.WithMetadataEnabled()` |
| Instance registrations, instance registration time | No data yet with application-level discovery |
| Thread pool | Dubbo Java only |

Also:

- Failure cause panels such as timeout, network and codec show data once such a failure happens.
- The "as consumer" panels of a provider application are empty, and the same applies to the "as provider" panels of a consumer application.

## Verifying the setup

In Prometheus, check that these queries return data and that `interface` contains neither group nor version:

```promql
dubbo_application_info_total{application_name="admin-demo-server"}
sum by (application_name, interface, method, ip) (rate(dubbo_provider_requests_total{application_name="admin-demo-server"}[1m]))
sum by (application_name, interface, method, ip) (rate(dubbo_consumer_requests_total{application_name="admin-demo-client"}[1m]))
```

In Jaeger, the consumer and provider spans of one call belong to the same trace, and `rpc.service` equals the metric's `interface`:

```text
admin-demo-client | Greet | span.kind=client rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
admin-demo-server | Greet | span.kind=server rpc.system=apache_dubbo rpc.service=greet.GreetService rpc.method=Greet dubbo.group=gray dubbo.version=1.0.0
```

The `trace_id` in a business log finds the corresponding trace in Jaeger.

## FAQ

### 1. Admin's metric dashboards show no data

1. Check that `metrics.WithEnabled()` is called and that `http://<instance IP>:<port>/metrics` is reachable.
2. Check on Prometheus's Targets page that the address is UP.
3. Check that the Grafana dashboards use a datasource pointing at this Prometheus.

### 2. The RT panels are empty while the request panels have data

The RT queries filter with `>0`. A call that takes less than 1 ms is recorded with an RT of 0, so the panel looks empty. This is expected.

### 3. Logs cannot be found by Trace ID

Check that `WithTraceIntegration(true)` is set and that the logs are written through `CtxLogger` with the request's context. Logs without a context carry no `trace_id`.
