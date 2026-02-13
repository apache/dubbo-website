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

Dubbo-Go supports runtime metrics collection and integration with **Prometheus + Grafana** to enable full observability for microservices.

This example supports two monitoring modes:

* ✅ **Pull Mode (Recommended for production)**
* ✅ **Push Mode (Based on Prometheus Pushgateway)**

Example source code:

> [https://github.com/apache/dubbo-go-samples/tree/main/metrics](https://github.com/apache/dubbo-go-samples/tree/main/metrics)

---

# 1. Monitoring Architecture

## 1️⃣ Pull Mode (Recommended)

```
Dubbo-Go Application  --->  Prometheus  --->  Grafana
        (exposes /metrics or /prometheus endpoint)
```

Prometheus actively scrapes metrics from Dubbo-Go applications.

---

## 2️⃣ Push Mode (For short-lived jobs)

```
Dubbo-Go Application  --->  Pushgateway  --->  Prometheus  --->  Grafana
```

Applications push metrics to Pushgateway. Prometheus scrapes Pushgateway.

⚠️ Note:

Pushgateway is designed for **short-lived jobs (batch / cron)**.
It is not recommended for long-running services.

---

# 2. Components Overview

| Component   | Port | Description                      |
| ----------- | ---- | -------------------------------- |
| Grafana     | 3000 | Metrics visualization dashboard  |
| Prometheus  | 9090 | Metrics storage and query engine |
| Pushgateway | 9091 | Receives pushed metrics          |
| go-server   | —    | Dubbo-Go Provider example        |
| go-client   | —    | Dubbo-Go Consumer example        |

---

# 3. Quick Start (Recommended)

---

## Step 1: Start the Monitoring Stack

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

---

## Step 2: Configure Environment Variables

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

---

## Step 3: Start Dubbo-Go Server

```bash
go run ./go-server/cmd/main.go
```

---

## Step 4: Start Dubbo-Go Client

### Default (Push Mode)

```bash
go run ./go-client/cmd/main.go
```

### Pull Mode

```bash
go run ./go-client/cmd/main.go --push=false
go run ./go-server/cmd/main.go --push=false
```

---

## Step 5: Verify Metrics

### Push Mode

Open:

```
http://localhost:9091/metrics
```

### Pull Mode

Open:

```
http://localhost:<app_port>/prometheus
```

---

# 4. Grafana Configuration

---

## 4.1 Add Prometheus Data Source

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

---

## 4.2 Import Dubbo Dashboard

1. Navigate to:

```
Home → Dashboards → New → Import
```

2. Upload `grafana.json`
   OR paste the JSON content

3. Select the Prometheus data source

4. Click **Import**

---

## 4.3 View Dashboard

You will see:

* QPS
* Success rate
* Latency (P99)
* Consumer / Provider request statistics
* Error rate

Metrics update dynamically as the client continuously calls the server.

---

# 5. Pushgateway Zombie Metrics Problem

## Problem Description

Pushgateway **does not automatically delete old metrics**.

If a job stops:

* Its metrics remain stored
* This may pollute monitoring data

---

## Solution 1: Application-side Cleanup (Implemented)

Mechanism:

* Register `job_pushed_at_seconds`
* Periodically update timestamp
* Automatically call DELETE API on graceful shutdown

---

## Solution 2: Production-grade Cleaner (Recommended)

Tool:

```
tools/pgw-cleaner
```

Purpose:

* Detect expired jobs
* Automatically clean zombie metrics

---

# 6. Troubleshooting

---

## Grafana shows "No Data"

Check:

* Prometheus data source connection is successful
* Prometheus → Status → Targets → pushgateway is **UP**
* Query:

```
dubbo_consumer_requests_succeed_total
```

returns results

---

## host.docker.internal not reachable

Replace it with your actual host IP:

* Update `prometheus_pull.yml`
* Update Grafana data source URL

---

# 7. Kubernetes Deployment

Recommended:

> kube-prometheus
> [https://github.com/prometheus-operator/kube-prometheus](https://github.com/prometheus-operator/kube-prometheus)

---

## Step 1: Create PodMonitor

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

---

## Step 2: Deploy Application

```bash
kubectl apply -f Deployment.yaml
```

---

## Step 3: Verify

Visit:

```
http://<prometheus-nodeport>/targets
```

Ensure your pods show:

```
UP
```

---

# 8. Production Recommendations

| Scenario              | Recommended Mode  |
| --------------------- | ----------------- |
| Long-running services | Pull              |
| Short-lived jobs      | Push              |
| Kubernetes            | Pull + PodMonitor |
| Pushgateway usage     | Use pgw-cleaner   |

---

# 9. Summary

Dubbo-Go provides:

* Pull-based Prometheus integration
* Push-based Pushgateway integration
* Docker quick-start stack
* Kubernetes PodMonitor support
* Grafana dashboards
* Zombie metric cleanup support

With this setup, you can build a complete Dubbo-Go observability system.
