---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/monitor/rpc_metrics/
    - /en/docs3-v2/golang-sdk/tutorial/governance/monitor/rpc_metrics/
description: "Dubbo-Go Metrics Monitoring: Prometheus Pull mode and Pushgateway Push mode with Grafana visualization"
title: Metrics Monitoring
type: docs
weight: 2
---

# Dubbo-Go Metrics Monitoring

Dubbo-Go can collect runtime metrics for RPC calls, metadata, registries, config centers, and other components. This guide uses <a href="https://github.com/apache/dubbo-go-samples/tree/main/observability/prometheus_grafana" target="_blank">dubbo-go-samples/observability/prometheus_grafana</a> to show both Prometheus Pull mode and Pushgateway mode.

> Note: some older descriptions may still mention `metrics/prometheus_grafana`. The current sample directory is `observability/prometheus_grafana`.

## 1. Monitoring Modes

### 1.1 Pull Mode

```text
Dubbo-Go application exposes /prometheus or /metrics
        |
        v
Prometheus scrapes the application
        |
        v
Grafana queries Prometheus and renders dashboards
```

Pull mode is the standard Prometheus model and is recommended for long-running Dubbo-Go providers and consumers. In this sample:

| Application | Metrics endpoint |
| --- | --- |
| go-server | `http://localhost:9099/prometheus` |
| go-client | `http://localhost:9097/prometheus` |

The Dubbo-Go default metrics endpoint is `http://localhost:9090/metrics`. This sample changes it with `metrics.WithPort(9099)`, `metrics.WithPort(9097)`, and `metrics.WithPath("/prometheus")`.

### 1.2 Pushgateway Mode

```text
Dubbo-Go application pushes metrics
        |
        v
Pushgateway stores the metrics temporarily
        |
        v
Prometheus scrapes Pushgateway
        |
        v
Grafana queries Prometheus and renders dashboards
```

Pushgateway is better suited to short-lived jobs such as batch or cron jobs. Prefer Pull mode for long-running services. If you use Pushgateway, configure cleanup so stale metrics do not remain after a job exits.

## 2. Prepare the Sample

Clone the samples repository and enter the sample directory:

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/observability/prometheus_grafana
```

The directory contains:

| File or directory | Description |
| --- | --- |
| `docker-compose.yml` | Starts ZooKeeper, Prometheus, Pushgateway, and Grafana |
| `prometheus_pull.yml` | Prometheus configuration for Pull mode |
| `prometheus_push.yml` | Prometheus configuration for Pushgateway mode |
| `go-server/cmd/main.go` | Provider sample, RPC port `20000`, metrics port `9099` |
| `go-client/cmd/main.go` | Consumer sample, continuously calls the provider, metrics port `9097` |
| `grafana.json` | Dubbo Grafana dashboard JSON |

Start the Docker stack:

```bash
docker compose up -d
```

If your environment still uses Docker Compose v1, run:

```bash
docker-compose up -d
```

After startup, visit:

| Component | URL |
| --- | --- |
| Grafana | `http://localhost:3000` |
| Prometheus | `http://localhost:9090` |
| Pushgateway | `http://localhost:9091` |
| ZooKeeper | `127.0.0.1:2181` |

## 3. Pull Mode Workflow

`docker-compose.yml` mounts `prometheus_pull.yml` by default, so the stack is ready for Pull mode after startup.

1. Set the registry address:

```bash
export ZK_ADDRESS="127.0.0.1:2181"
```

For Windows PowerShell:

```powershell
$env:ZK_ADDRESS="127.0.0.1:2181"
```

2. Start the provider:

```bash
go run ./go-server/cmd/main.go --push=false
```

3. Open another terminal, enter the same directory, and start the consumer:

```bash
cd dubbo-go-samples/observability/prometheus_grafana
export ZK_ADDRESS="127.0.0.1:2181"
go run ./go-client/cmd/main.go --push=false
```

4. Visit the metrics endpoints exposed by the applications:

```bash
curl http://localhost:9099/prometheus
curl http://localhost:9097/prometheus
```

The output includes metrics such as `dubbo_provider_`, `dubbo_consumer_`, and `dubbo_application_`. For example:

```text
dubbo_provider_requests_total
dubbo_consumer_requests_succeed_total
```

5. Open `http://localhost:9090/targets` and verify that `dubbo-provider` and `dubbo-consumer` are `UP`.

## 4. Pushgateway Mode Workflow

In Pushgateway mode, Prometheus scrapes Pushgateway instead of scraping the Dubbo-Go applications directly.

1. Change the Prometheus volume in `docker-compose.yml` from the Pull configuration to the Pushgateway configuration:

```yaml
volumes:
  - ./prometheus_push.yml:/etc/prometheus/prometheus.yml
```

2. Restart the monitoring stack:

```bash
docker compose down
docker compose up -d
```

3. Set environment variables:

```bash
export ZK_ADDRESS="127.0.0.1:2181"
export PUSHGATEWAY_URL="127.0.0.1:9091"
export JOB_NAME="dubbo-service"

# Set these only when Pushgateway uses Basic Auth
export PUSHGATEWAY_USER="username"
export PUSHGATEWAY_PASS="1234"
```

4. Start the provider and consumer:

```bash
go run ./go-server/cmd/main.go
```

In another terminal:

```bash
cd dubbo-go-samples/observability/prometheus_grafana
export ZK_ADDRESS="127.0.0.1:2181"
export PUSHGATEWAY_URL="127.0.0.1:9091"
export JOB_NAME="dubbo-service"
go run ./go-client/cmd/main.go
```

5. Visit the Pushgateway metrics endpoint:

```bash
curl http://localhost:9091/metrics
```

6. Open `http://localhost:9090/targets` and verify that the `pushgateway` target is `UP`.

The sample registers `job_pushed_at_seconds` and calls the Pushgateway DELETE API on graceful shutdown. If the process is killed forcefully, cleanup may not run. For production, use <a href="https://github.com/apache/dubbo-go-samples/tree/main/tools/pgw-cleaner" target="_blank">pgw-cleaner</a> or another cleanup process.

## 5. Prometheus Configuration

### 5.1 Pull Configuration

`prometheus_pull.yml` scrapes `/prometheus` from both the provider and consumer:

```yaml
global:
  evaluation_interval: 15s
  scrape_interval: 15s
scrape_configs:
  - job_name: dubbo-provider
    scrape_interval: 15s
    scrape_timeout: 5s
    metrics_path: /prometheus
    static_configs:
      - targets: ['host.docker.internal:9099']
  - job_name: dubbo-consumer
    scrape_interval: 15s
    scrape_timeout: 5s
    metrics_path: /prometheus
    static_configs:
      - targets: ['host.docker.internal:9097']
```

`host.docker.internal` lets the Prometheus container reach Dubbo-Go processes running on the host. If Prometheus and the applications run in the same Docker network, replace it with the container name. On Linux, if this hostname is unavailable, use the host IP or add a `host-gateway` mapping in Docker Compose.

### 5.2 Pushgateway Configuration

`prometheus_push.yml` scrapes only Pushgateway:

```yaml
global:
  evaluation_interval: 15s
  scrape_interval: 15s
scrape_configs:
  - job_name: 'pushgateway'
    static_configs:
      - targets: ['host.docker.internal:9091']
    honor_labels: true
```

`honor_labels: true` keeps labels such as `job` and `instance` that were pushed by the application, which helps Grafana display data by service dimension.

## 6. Import the Grafana Dashboard

1. Open `http://localhost:3000`. The default credentials are `admin` / `admin`.
2. Go to `Home -> Connections -> Data sources` and click `Add new data source`.
3. Select `Prometheus` and set the URL to `http://host.docker.internal:9090`. If Grafana cannot reach this address, use the actual host IP or another address reachable from the Grafana container.
4. Click `Save & test`.
5. Go to `Home -> Dashboards -> New -> Import`.
6. Upload `grafana.json` from the sample directory, or paste the file content into the import box. You can also import Grafana dashboard ID `19294` for `Dubbo Observability`.
7. Select the Prometheus data source and click `Import`.

Once the consumer starts calling the provider, the dashboard panels for QPS, success rate, P99 latency, consumer/provider request counts, and error rate will keep updating.

## 7. Troubleshooting

### 7.1 Port Conflicts

If `3000`, `9090`, `9091`, or `2181` is already in use, update the port mappings in `docker-compose.yml`. If `9099` or `9097` is already in use, update `metrics.WithPort(...)` in `go-server/cmd/main.go` or `go-client/cmd/main.go`, and update the targets in `prometheus_pull.yml` accordingly.

### 7.2 Prometheus Targets Are DOWN

First verify the endpoints from the host:

```bash
curl http://localhost:9099/prometheus
curl http://localhost:9097/prometheus
curl http://localhost:9091/metrics
```

If the host can access them but the Prometheus container cannot, the issue is usually Docker networking. Replace `host.docker.internal` with the real host IP, or add this to the Prometheus service on Linux:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### 7.3 Grafana Shows No Data

Confirm that the Prometheus data source passes `Save & test`; check `http://localhost:9090/targets` for `UP` targets; then query `dubbo_consumer_requests_succeed_total` or `dubbo_provider_requests_total` in Prometheus. If the query is empty, make sure the client is continuously calling the server and wait for one scrape interval.

### 7.4 Pushgateway Has Stale Jobs

Pushgateway does not automatically remove old metrics. Graceful shutdown of the sample process triggers cleanup; production deployments should use `pgw-cleaner` or call the Pushgateway DELETE API for expired jobs.

### 7.5 Should I Visit `/metrics` or `/prometheus`?

Dubbo-Go defaults to port `9090` and path `/metrics`. This sample explicitly uses `/prometheus`; the server listens on `9099`, and the client listens on `9097`. Always use the actual values configured by `metrics.WithPort(...)` and `metrics.WithPath(...)` in your application.

## 8. Production Recommendations

| Scenario | Recommended setup |
| --- | --- |
| Long-running providers/consumers | Pull mode |
| Short-lived jobs | Pushgateway mode |
| Kubernetes | Pull mode + PodMonitor |
| Pushgateway usage | Cleanup process or DELETE API |

In Kubernetes, use Prometheus Operator's PodMonitor to scrape the application metrics port, and set `path` to the application's actual `/prometheus` or `/metrics` path.
