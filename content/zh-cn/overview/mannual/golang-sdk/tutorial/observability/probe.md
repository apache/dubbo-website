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

以下是一个具体的使用示例，可查看 [示例完整源码](https://github.com/apache/dubbo-go-samples/tree/main/metrics)。

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

Dubbo-Go 支持 **New API（推荐）** 与 **Old API（YAML）** 两种配置方式。

---

# 1️⃣ New API 配置方式（推荐）

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

# 2️⃣ Old API YAML 配置方式

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

# 八、示例运行说明

示例路径：

```
metrics/probe/
```

---

## 本地运行

```bash
go run ./metrics/probe/go-server/cmd/main.go
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

| 场景    | 建议                  |
| ----- | ------------------- |
| 高可用系统 | liveness 保持简单       |
| 依赖复杂  | readiness 绑定下游      |
| 启动耗时长 | 必须使用 startup        |
| 微服务集群 | 建议开启 internal-state |
