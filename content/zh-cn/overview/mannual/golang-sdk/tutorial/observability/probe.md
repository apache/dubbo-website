---
aliases:
  - /zh/docs3-v2/golang-sdk/tutorial/governance/monitor/probe/
  - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/monitor/probe/
  - /zh/docs3-v3/golang-sdk/tutorial/governance/monitor/probe/
description: "Dubbo-Go Kubernetes Probe (liveness / readiness / startup) user manual"
title: Kubernetes 生命周期探针
type: docs
weight: 3
---

# Dubbo-Go Kubernetes 生命周期探针

Dubbo-Go 提供内置的 **Kubernetes HTTP Probe 服务**，用于支持：

* ✅ `liveness`
* ✅ `readiness`
* ✅ `startup`

该模块通过独立 HTTP 端口暴露探针接口，并支持：

* 自定义健康检查逻辑
* 可选内部生命周期对齐
* 可控的重启风险

以下是一个具体的使用示例，可查看 [示例完整源码](https://github.com/apache/dubbo-go-samples/tree/main/observability/probe)。

---

# 一、设计目标

| 目标     | 说明                                 |
| ------ | ---------------------------------- |
| 可扩展    | 支持注册自定义检查回调                        |
| 可控风险   | liveness 默认不绑定内部复杂逻辑               |
| 生命周期对齐 | readiness / startup 可对齐 Dubbo 生命周期 |
| 独立端口   | 与业务端口隔离                            |

---

# 二、默认行为

启用 Probe 后，默认在：

```
端口: 22222
```

暴露以下路径：

| Endpoint     | 说明     |
| ------------ | ------ |
| GET /live    | 进程存活检查 |
| GET /ready   | 服务就绪检查 |
| GET /startup | 启动阶段检查 |

---

## 响应规则

| 条件     | HTTP 状态码 |
| ------ | -------- |
| 所有检查通过 | 200      |
| 任意检查失败 | 503      |

---

# 三、配置方式

Dubbo-Go 支持 **New API（推荐）** 与 **配置文件方式（YAML）** 两种配置方式。

---

## 3.1 New API 配置方式（推荐）

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

## 可用 Option

| Option                          | 说明              |
| ------------------------------- | --------------- |
| WithProbeEnabled()              | 启用 Probe        |
| WithProbePort(int)              | 设置 Probe 端口     |
| WithProbeLivenessPath(string)   | 设置 liveness 路径  |
| WithProbeReadinessPath(string)  | 设置 readiness 路径 |
| WithProbeStartupPath(string)    | 设置 startup 路径   |
| WithProbeUseInternalState(bool) | 是否启用内部状态检查      |

---

## 3.2 YAML 配置文件方式

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

## 配置项说明

| 配置项                | 说明            |
| ------------------ | ------------- |
| enabled            | 是否开启 probe 服务 |
| port               | HTTP 端口       |
| liveness-path      | liveness 路径   |
| readiness-path     | readiness 路径  |
| startup-path       | startup 路径    |
| use-internal-state | 是否启用内部生命周期状态  |

---

# 四、内部生命周期状态（UseInternalState）

当：

```yaml
use-internal-state: true
```

Probe 会附加 Dubbo 内部状态判断。

---

## 内部状态机制

| Probe 类型  | 依赖状态                                   |
| --------- | -------------------------------------- |
| readiness | `probe.SetReady(true/false)`           |
| startup   | `probe.SetStartupComplete(true/false)` |

---

## 默认行为

* 当 `Server.Serve()` 成功执行：

  * ready = true
  * startup = true

* 优雅关闭时：

  * ready = false

---

## 当设置为 false

如果：

```yaml
use-internal-state: false
```

则 Probe 结果 **完全由用户注册的回调决定**。

---

# 五、自定义健康检查（推荐方式）

你可以注册回调扩展检查逻辑。

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

## 执行逻辑

* 所有注册的检查函数都会执行
* 只要有一个返回 error
* Probe 返回 503

---

# 六、语义建议

## Liveness

* 建议仅用于：

  * 进程是否崩溃
  * 核心依赖是否彻底不可用

⚠️ 失败会触发 Pod 重启。

---

## Readiness

* 可绑定：

  * 注册中心状态
  * 数据库
  * Redis
  * 下游 RPC
  * 本地缓存

用于控制流量是否进入。

---

## Startup

* 用于：

  * 冷启动
  * 预热逻辑
  * 数据加载
  * 模型初始化

避免启动慢时被误判为失败。

---

# 七、Kubernetes 配置示例

在部署前，需要先将示例构建为容器镜像。以 [dubbo-go-samples](https://github.com/apache/dubbo-go-samples) 仓库中的 [build.sh](https://github.com/apache/dubbo-go-samples/blob/main/observability/probe/go-server/build.sh) 为例，在仓库根目录执行：

```bash
./observability/probe/go-server/build.sh
```

脚本内容如下：

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

如果使用 Minikube 本地集群，可以再执行：

```bash
minikube image load dubbo-go-probe-server:latest
```

以下是一个完整的 Deployment 示例，参考自 [dubbo-go-samples 的 server-deployment.yml](https://github.com/apache/dubbo-go-samples/blob/main/observability/probe/deploy/server-deployment.yml)，将 liveness、readiness、startup 三类探针配置在容器上：

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

部署到 Kubernetes：

在 dubbo-go-samples 仓库根目录执行：

```bash
kubectl apply -f observability/probe/deploy/server-deployment.yml
kubectl rollout status deploy/dubbo-go-probe-server
```

---

# 八、示例运行说明

示例路径和运行命令均以 dubbo-go-samples 仓库根目录为基准。

示例路径：

```
observability/probe/
```

---

## 本地运行

```bash
go run ./observability/probe/go-server/cmd/main.go
```

---

## 使用 curl 验证探针

服务启动后，可以分别请求三个探针端点：

```bash
# liveness，预期 200
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:22222/live

# readiness，未就绪时预期 503
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:22222/ready

# startup，未启动完成时预期 503
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:22222/startup
```

也可以直接查看响应体：

```bash
curl -i http://127.0.0.1:22222/live
curl -i http://127.0.0.1:22222/ready
curl -i http://127.0.0.1:22222/startup
```

---

## 实时观察 Probe 状态

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

## 预期行为

| 阶段   | /live | /ready | /startup |
| ---- | ----- | ------ | -------- |
| 刚启动  | 200   | 503    | 503      |
| 预热阶段 | 200   | 503    | 503      |
| 预热完成 | 200   | 200    | 200      |

---

# 九、生产最佳实践

## 推荐参数起点

| Probe 类型  | 推荐值                                                                                 | 说明                                      |
| --------- | ----------------------------------------------------------------------------------- | --------------------------------------- |
| liveness  | `initialDelaySeconds: 10-30`，`periodSeconds: 10`，`timeoutSeconds: 1-3`，`failureThreshold: 3` | 仅用于进程存活和不可恢复故障，不检查数据库、注册中心、Redis 等波动依赖 |
| readiness | `initialDelaySeconds: 2-5`，`periodSeconds: 5`，`timeoutSeconds: 1-3`，`failureThreshold: 2-3` | 依赖异常时快速摘流，依赖恢复后尽快重新接流               |
| startup   | `periodSeconds: 5-10`，`timeoutSeconds: 1-3`，`failureThreshold = ceil(maxStartupSeconds / periodSeconds) + 1` | 预算要覆盖冷启动、预热、配置加载等最长路径             |

例如：如果应用最长启动耗时约为 `120s`，并设置 `periodSeconds: 5`，则建议：

```text
failureThreshold = ceil(120 / 5) + 1 = 25
```

## 落地建议

* `liveness` 保持简单，只检测“必须重启才能恢复”的故障
* `readiness` 绑定注册中心、数据库、Redis、下游 RPC 等波动依赖
* `startup` 单独承担慢启动保护，避免把大 `initialDelaySeconds` 堆到 `liveness` 上
* 微服务集群建议开启 `use-internal-state: true`，再结合 `probe.SetReady(...)` 做主动摘流
