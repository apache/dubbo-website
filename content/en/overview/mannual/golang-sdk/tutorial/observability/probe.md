---
aliases:
  - /en/docs3-v2/golang-sdk/tutorial/governance/monitor/probe/
  - /en/docs3-v3/golang-sdk/tutorial/governance/monitor/probe/
description: "Dubbo-Go Kubernetes Probe (liveness / readiness / startup) user manual"
title: Kubernetes Lifecycle Probe
type: docs
weight: 3
---

# Dubbo-Go Kubernetes Lifecycle Probe

Dubbo-Go provides a built-in **Kubernetes HTTP Probe service** that supports:

* ✅ `liveness`
* ✅ `readiness`
* ✅ `startup`

The probe service runs on an independent HTTP port and supports:

* Custom health check logic
* Optional alignment with Dubbo internal lifecycle state
* Controlled restart risk management

For a complete runnable example, see:

> [https://github.com/apache/dubbo-go-samples/tree/main/metrics](https://github.com/apache/dubbo-go-samples/tree/main/metrics)

---

# 1. Design Goals

| Goal                | Description                                              |
| ------------------- | -------------------------------------------------------- |
| Extensibility       | Supports custom health check callbacks                   |
| Risk Control        | Liveness does not bind complex internal logic by default |
| Lifecycle Alignment | Readiness and startup can align with Dubbo lifecycle     |
| Independent Port    | Isolated from business service port                      |

---

# 2. Default Behavior

When Probe is enabled, it exposes endpoints on:

```
Port: 22222
```

The following paths are available:

| Endpoint     | Description               |
| ------------ | ------------------------- |
| GET /live    | Process liveness check    |
| GET /ready   | Service readiness check   |
| GET /startup | Application startup check |

---

## Response Rules

| Condition       | HTTP Status Code |
| --------------- | ---------------- |
| All checks pass | 200              |
| Any check fails | 503              |

---

# 3. Configuration

Dubbo-Go supports both **New API (recommended)** and **Old API (YAML)** configuration styles.

---

# 1️⃣ New API Configuration (Recommended)

```go
ins, err := dubbo.NewInstance(
  dubbo.WithMetrics(
    metrics.WithProbeEnabled(),
    metrics.WithProbePort(22222),
    metrics.WithProbeLivenessPath("/live"),
    metrics.WithProbeReadinessPath("/ready"),
    metrics.WithProbeStartupPath("/startup"),
    metrics.WithProbeUseInternalState(true),
  ),
)
```

---

## Available Options

| Option                          | Description                           |
| ------------------------------- | ------------------------------------- |
| WithProbeEnabled()              | Enable Probe                          |
| WithProbePort(int)              | Set Probe HTTP port                   |
| WithProbeLivenessPath(string)   | Set liveness path                     |
| WithProbeReadinessPath(string)  | Set readiness path                    |
| WithProbeStartupPath(string)    | Set startup path                      |
| WithProbeUseInternalState(bool) | Enable internal lifecycle state check |

---

# 2️⃣ Old API YAML Configuration

```yaml
metrics:
  probe:
    enabled: true
    port: "22222"
    liveness-path: "/live"
    readiness-path: "/ready"
    startup-path: "/startup"
    use-internal-state: true
```

---

## Configuration Fields

| Field              | Description                                |
| ------------------ | ------------------------------------------ |
| enabled            | Enable probe service                       |
| port               | HTTP port                                  |
| liveness-path      | Liveness endpoint path                     |
| readiness-path     | Readiness endpoint path                    |
| startup-path       | Startup endpoint path                      |
| use-internal-state | Whether to enable internal lifecycle state |

---

# 4. Internal Lifecycle State (UseInternalState)

When:

```yaml
use-internal-state: true
```

Probe attaches Dubbo internal lifecycle checks.

---

## Internal State Mechanism

| Probe Type | Depends On                             |
| ---------- | -------------------------------------- |
| readiness  | `probe.SetReady(true/false)`           |
| startup    | `probe.SetStartupComplete(true/false)` |

---

## Default Behavior

* When `Server.Serve()` executes successfully:

  * ready = true
  * startup = true

* During graceful shutdown:

  * ready = false

---

## When Set to false

If:

```yaml
use-internal-state: false
```

The probe result is **fully determined by user-registered callbacks**.

---

# 5. Custom Health Checks (Recommended)

You can extend probe logic by registering callbacks.

```go
import "dubbo.apache.org/dubbo-go/v3/metrics/probe"

// Liveness example
probe.RegisterLiveness("db", func(ctx context.Context) error {
    // check database connectivity
    return nil
})

// Readiness example
probe.RegisterReadiness("cache", func(ctx context.Context) error {
    // check downstream dependency
    return nil
})

// Startup example
probe.RegisterStartup("warmup", func(ctx context.Context) error {
    // check warmup completion
    return nil
})
```

---

## Execution Logic

* All registered checks will be executed.
* If any check returns an error,
* The probe returns HTTP 503.

---

# 6. Semantic Recommendations

## Liveness

Recommended usage:

* Detect process crashes
* Detect fatal core dependency failure

⚠️ Failure will trigger Pod restart.

---

## Readiness

May bind to:

* Service registry state
* Database
* Redis
* Downstream RPC
* Local cache

Controls whether traffic is routed to the Pod.

---

## Startup

Suitable for:

* Cold start handling
* Warm-up logic
* Data loading
* Model initialization

Prevents premature restart during slow initialization.

---

# 7. Kubernetes Configuration Example

```yaml
livenessProbe:
  httpGet:
    path: /live
    port: 22222
  initialDelaySeconds: 5
  periodSeconds: 5

readinessProbe:
  httpGet:
    path: /ready
    port: 22222
  initialDelaySeconds: 5
  periodSeconds: 5

startupProbe:
  httpGet:
    path: /startup
    port: 22222
  failureThreshold: 30
  periodSeconds: 10
```

---

# 8. Example Usage

Example path:

```
metrics/probe/
```

---

## Run Locally

```bash
go run ./metrics/probe/go-server/cmd/main.go
```

---

## Monitor Probe Status in Real Time

```bash
watch -n 1 '
for p in live ready startup; do
  url="http://127.0.0.1:22222/$p"

  body=$(curl -sS --max-time 2 "$url" 2>&1)
  code=$(curl -s -o /dev/null --max-time 2 -w "%{http_code}" "$url" 2>/dev/null)

  printf "%-8s [%s] %s\n" "$p" "$code" "$body"
done
'
```

---

## Expected Behavior

| Phase            | /live | /ready | /startup |
| ---------------- | ----- | ------ | -------- |
| Just started     | 200   | 503    | 503      |
| Warm-up phase    | 200   | 503    | 503      |
| Warm-up complete | 200   | 200    | 200      |

---

# 9. Production Best Practices

| Scenario                  | Recommendation                        |
| ------------------------- | ------------------------------------- |
| High availability systems | Keep liveness simple                  |
| Complex dependencies      | Bind readiness to downstream services |
| Long startup time         | Always use startup probe              |
| Microservice clusters     | Enable internal-state                 |
