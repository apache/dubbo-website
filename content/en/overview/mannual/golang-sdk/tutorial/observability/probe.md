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

> [https://github.com/apache/dubbo-go-samples/tree/main/observability/probe](https://github.com/apache/dubbo-go-samples/tree/main/observability/probe)

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

Dubbo-Go supports both **New API (recommended)** and **configuration file (YAML)** styles.

---

## 3.1 New API Configuration (Recommended)

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

## 3.2 YAML Configuration File

```yaml
metrics:
  probe:
    enabled: true
    port: 22222
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

Before deploying, build the sample into a container image. In the [dubbo-go-samples](https://github.com/apache/dubbo-go-samples) repository root, use its [build.sh](https://github.com/apache/dubbo-go-samples/blob/main/observability/probe/go-server/build.sh):

```bash
./observability/probe/go-server/build.sh
```

The script contents are:

```bash
#!/bin/bash

#
#  Licensed to the Apache Software Foundation (ASF) under one or more
#  contributor license agreements.  See the NOTICE file distributed with
#  this work for additional information regarding copyright ownership.
#  The ASF licenses this file to You under the Apache License, Version 2.0
#  (the "License"); you may not use this file except in compliance with
#  the License.  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

set -e

echo "Building probe server image..."

# Build from repository root.
cd "$(dirname "$0")/../../.."

# Build linux binary first. This uses local `replace => ../dubbo-go` if present.
TARGET_OS=${TARGET_OS:-linux}
TARGET_ARCH=${TARGET_ARCH:-amd64}

CGO_ENABLED=0 GOOS="$TARGET_OS" GOARCH="$TARGET_ARCH" go build -o observability/probe/go-server/probeApp ./observability/probe/go-server/cmd/main.go
docker build -f observability/probe/go-server/Dockerfile -t dubbo-go-probe-server:latest .

echo "Build completed successfully."
```

If you use a local Minikube cluster, you can also load the image:

```bash
minikube image load dubbo-go-probe-server:latest
```

The following complete Deployment is based on [server-deployment.yml](https://github.com/apache/dubbo-go-samples/blob/main/observability/probe/deploy/server-deployment.yml) in dubbo-go-samples and configures liveness, readiness, and startup probes on the container:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-go-probe-server
  labels:
    app: dubbo-go-probe-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dubbo-go-probe-server
  template:
    metadata:
      labels:
        app: dubbo-go-probe-server
    spec:
      containers:
        - name: server
          image: dubbo-go-probe-server:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 20000
              name: triple
            - containerPort: 22222
              name: probe
          livenessProbe:
            httpGet:
              path: /live
              port: probe
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: probe
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /startup
              port: probe
            failureThreshold: 30
            periodSeconds: 1
```

---

Deploy to Kubernetes:

Run the following commands from the dubbo-go-samples repository root:

```bash
kubectl apply -f observability/probe/deploy/server-deployment.yml
kubectl rollout status deploy/dubbo-go-probe-server
```

---

# 8. Example Usage

The example path and run commands below use the dubbo-go-samples repository root as their working directory.

Example path:

```
observability/probe/
```

---

## Run Locally

```bash
go run ./observability/probe/go-server/cmd/main.go
```

---

## Verify Probes with curl

After the service starts, you can request the three probe endpoints separately:

```bash
# liveness, expected 200
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:22222/live

# readiness, expected 503 before the service is ready
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:22222/ready

# startup, expected 503 before startup is complete
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:22222/startup
```

You can also inspect the response body:

```bash
curl -i http://127.0.0.1:22222/live
curl -i http://127.0.0.1:22222/ready
curl -i http://127.0.0.1:22222/startup
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

## Recommended Starting Values

| Probe Type | Recommended Values                                                                                       | Notes                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| liveness   | `initialDelaySeconds: 10-30`, `periodSeconds: 10`, `timeoutSeconds: 1-3`, `failureThreshold: 3`        | Use only for process survival and unrecoverable failures, not for databases, registries, or Redis |
| readiness  | `initialDelaySeconds: 2-5`, `periodSeconds: 5`, `timeoutSeconds: 1-3`, `failureThreshold: 2-3`         | Remove traffic quickly when dependencies fail, and recover quickly after they return |
| startup    | `periodSeconds: 5-10`, `timeoutSeconds: 1-3`, `failureThreshold = ceil(maxStartupSeconds / periodSeconds) + 1` | Budget for the longest cold-start, warm-up, and config-loading path |

For example, if the application may need up to `120s` to start and `periodSeconds: 5` is used:

```text
failureThreshold = ceil(120 / 5) + 1 = 25
```

## Operational Guidance

* Keep `liveness` simple and reserve it for failures that require a restart
* Put service registry, database, Redis, and downstream RPC checks in `readiness`
* Let `startup` absorb slow initialization instead of inflating `liveness.initialDelaySeconds`
* In microservice clusters, enable `use-internal-state: true` and combine it with `probe.SetReady(...)` for proactive traffic draining
