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

Dubbo-Go supports runtime metrics collection and integration with **Prometheus + Grafana** to build observability for microservices.

This example covers two monitoring modes:

* **Pull Mode**: Prometheus scrapes metrics from Dubbo-Go applications. Recommended for long-running services.
* **Push Mode**: Dubbo-Go applications push metrics to Pushgateway. Recommended only for short-lived jobs.

Example source code:

> [https://github.com/apache/dubbo-go-samples/tree/main/metrics](https://github.com/apache/dubbo-go-samples/tree/main/metrics)

## 1. Monitoring Architecture

### 1.1 Pull Mode (Recommended for production)

```
Dubbo-Go Application  --->  Prometheus  --->  Grafana
        (exposes /metrics or /prometheus endpoint)
```

Prometheus actively scrapes metrics from Dubbo-Go applications.

### 1.2 Push Mode (For short-lived jobs)

```
Dubbo-Go Application  --->  Pushgateway  --->  Prometheus  --->  Grafana
```

Applications push metrics to Pushgateway. Prometheus scrapes Pushgateway.

Pushgateway is designed for **short-lived jobs (batch / cron)** and is not recommended for long-running services.

## 2. Components Overview

| Component   | Port | Description                      |
| ----------- | ---- | -------------------------------- |
| Grafana     | 3000 | Metrics visualization dashboard  |
| Prometheus  | 9090 | Metrics storage and query engine |
| Pushgateway | 9091 | Receives pushed metrics          |
| go-server metrics endpoint | 9099 in this sample | Provider metrics in Pull mode |
| go-client metrics endpoint | 9097 in this sample | Consumer metrics in Pull mode |

If you use Dubbo-Go defaults instead of this sample, the default metrics endpoint is `http://localhost:9090/metrics`. This sample overrides the metrics path to `/prometheus`.

## 3. Quick Start

### 3.1 Start the Monitoring Stack

Navigate to:

```bash
cd metrics/prometheus_grafana
```

Start services:

```bash
docker-compose up -d
```

Access:

* Grafana: [http://localhost:3000](http://localhost:3000)
* Prometheus: [http://localhost:9090](http://localhost:9090)
* Pushgateway: [http://localhost:9091](http://localhost:9091)

### 3.2 Configure Environment Variables

Both client and server share the same configuration:

```bash
export ZK_ADDRESS="127.0.0.1:2181"

# Required for Push mode
export PUSHGATEWAY_URL="127.0.0.1:9091"
export JOB_NAME="dubbo-service"

# Optional
export PUSHGATEWAY_USER="username"
export PUSHGATEWAY_PASS="1234"
```

### 3.3 Start Dubbo-Go Server

```bash
go run ./go-server/cmd/main.go
```

### 3.4 Start Dubbo-Go Client

#### Default (Push Mode)

```bash
go run ./go-client/cmd/main.go
```

#### Pull Mode

```bash
go run ./go-client/cmd/main.go --push=false
go run ./go-server/cmd/main.go --push=false
```

### 3.5 Verify Metrics

#### Push Mode

Open:

```
http://localhost:9091/metrics
```

#### Pull Mode

`<app_port>` means the HTTP metrics port exposed by the Dubbo-Go application itself, not the Prometheus or Pushgateway port.

In this sample:

* Provider: `http://localhost:9099/prometheus`
* Consumer: `http://localhost:9097/prometheus`

These ports are defined in [`metrics/prometheus_grafana/prometheus_pull.yml`](https://github.com/apache/dubbo-go-samples/blob/main/metrics/prometheus_grafana/prometheus_pull.yml).

If you use your own Dubbo-Go application instead of this sample, replace the port with your application's metrics port.

## 4. Grafana Configuration

### 4.1 Add Prometheus Data Source

1. Open [http://localhost:3000](http://localhost:3000)
2. Default credentials: `admin / admin`
3. Navigate to:

```
Home → Connections → Data sources
```

4. Click **Add new data source**
5. Select **Prometheus**
6. Enter:

```
http://host.docker.internal:9090
```

> Note: `host.docker.internal` allows Docker containers to access the host network. Replace with your actual IP if necessary.

7. Click **Save & Test**

### 4.2 Import Dubbo Dashboard

1. Navigate to:

```
Home → Dashboards → New → Import
```

2. Import the dashboard with one of these methods:

* Upload [`grafana.json`](https://github.com/apache/dubbo-go-samples/blob/main/metrics/prometheus_grafana/grafana.json) from the sample directory
* Enter Grafana dashboard ID `19294` (`Dubbo Observability`) and click **Load**
* Or download the JSON from [Grafana Labs](https://grafana.com/grafana/dashboards/19294-dubbo-observability/) and upload it

3. The sample repository already includes the dashboard file at `metrics/prometheus_grafana/grafana.json`, so uploading that file is the most direct option.

4. Select the Prometheus data source

5. Click **Import**

### 4.3 View Dashboard

You will see:

* QPS
* Success rate
* Latency (P99)
* Consumer / Provider request statistics
* Error rate

Metrics update dynamically as the client continuously calls the server.

## 5. Pushgateway Zombie Metrics Problem

### 5.1 Problem Description

Pushgateway **does not automatically delete old metrics**.

If a job stops:

* Its metrics remain stored
* This may pollute monitoring data

### 5.2 Solution 1: Application-side Cleanup (Implemented)

Mechanism:

* Register `job_pushed_at_seconds`
* Periodically update timestamp
* Automatically call DELETE API on graceful shutdown

### 5.3 Solution 2: Production-grade Cleaner (Recommended)

Tool repository:

> [apache/dubbo-go-samples/tree/main/tools/pgw-cleaner](https://github.com/apache/dubbo-go-samples/tree/main/tools/pgw-cleaner)

Detailed documentation:

* [README.md](https://github.com/apache/dubbo-go-samples/blob/main/tools/pgw-cleaner/README.md)

This tool lives in the `apache/dubbo-go-samples` repository, not in the `apache/dubbo-go` core repository.

Purpose:

* Detect expired jobs
* Automatically clean zombie metrics

## 6. Troubleshooting

### 6.1 Grafana Shows "No Data"

Check:

* Prometheus data source connection is successful
* Prometheus → Status → Targets → pushgateway is **UP**
* Query:

```
dubbo_consumer_requests_succeed_total
```

returns results

### 6.2 host.docker.internal Not Reachable

Replace it with your actual host IP:

* Update `metrics/prometheus_grafana/prometheus_pull.yml`
* Update Grafana data source URL

## 7. Kubernetes Deployment

Recommended:

> kube-prometheus
> [https://github.com/prometheus-operator/kube-prometheus](https://github.com/prometheus-operator/kube-prometheus)

### 7.1 Create PodMonitor

Create `dubboPodMonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: dubbo-pod-monitor
  namespace: monitoring
spec:
  namespaceSelector:
    matchNames:
      - dubbo-system
  selector:
    matchLabels:
      app-type: dubbo
  podMetricsEndpoints:
    - port: metrics
      path: /prometheus
```

### 7.2 Optional: Add RBAC Permissions When RBAC Is Enabled

If your cluster enforces RBAC, grant Prometheus permission to read Pods in `dubbo-system`:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dubbo-system
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
  namespace: dubbo-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: pod-reader
subjects:
  - kind: ServiceAccount
    name: prometheus-k8s
    namespace: monitoring
```

If your Prometheus installation uses a different service account, replace the `subjects` section accordingly.

### 7.3 Deploy Application

```bash
kubectl apply -f Deployment.yaml
```

### 7.4 Verify

Visit:

```
http://<prometheus-nodeport>/targets
```

Ensure your pods show:

```
UP
```

## 8. Production Recommendations

| Scenario              | Recommended Mode  |
| --------------------- | ----------------- |
| Long-running services | Pull              |
| Short-lived jobs      | Push              |
| Kubernetes            | Pull + PodMonitor |
| Pushgateway usage     | Use pgw-cleaner   |

## 9. Summary

Dubbo-Go provides:

* Pull-based Prometheus integration
* Push-based Pushgateway integration
* Docker quick-start stack
* Kubernetes PodMonitor support
* Grafana dashboards
* Zombie metric cleanup support

With this setup, you can build a complete Dubbo-Go observability system.
