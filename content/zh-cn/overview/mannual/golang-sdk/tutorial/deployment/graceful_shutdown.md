---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/traffic/graceful_shutdown/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/traffic/graceful_shutdown/
    - /zh-cn/overview/mannual/golang-sdk/tutorial/deploy2/graceful_shutdown/
description: 本文主要介绍 Dubbo-go 优雅停机的整体流程、配置、验证方式和 Kubernetes 部署建议
keywords: 优雅停机
title: 优雅停机
type: docs
---

# 优雅停机

示例源码：<a href="https://github.com/apache/dubbo-go-samples/tree/main/graceful_shutdown" target="_blank">dubbo-go-samples/graceful_shutdown</a>。

## 1. 背景

在发布新版本、扩缩容或迁移节点时，Kubernetes、systemd 或运维平台会终止旧实例并启动新实例。如果旧实例直接退出，注册中心、客户端连接池和上游流量之间会出现短暂的不一致：注册中心可能还没有推送摘除事件，上游请求也可能仍在处理中。对于高流量服务，这会带来连接断开、请求失败、超时重试和告警放大。

Dubbo-go 的优雅停机用于在进程退出前完成摘流和请求排空，尽量保证：

- Provider 不再接收新的业务请求之前，先从注册中心反注册并通知长连接 Consumer。
- 已经进入 Provider 的请求可以在超时时间内完成。
- Consumer 本身正在发出的下游调用可以在退出前拿到响应。
- 资源销毁、端口释放和用户自定义回调按顺序执行。

## 2. 工作机制

一次 Dubbo-go 调用链路中，某个服务实例通常既是 Provider，也是 Consumer。因此优雅停机会同时处理服务提供端和服务消费端。

### 2.1 触发停机

当应用收到 `SIGTERM`、`SIGINT` 等退出信号时，如果 `dubbo.shutdown.internal-signal` 为 `true`，Dubbo-go 会进入内置优雅停机流程。Kubernetes 删除 Pod、滚动发布、`kubectl delete pod`、`kill -TERM <pid>` 和终端 `Ctrl+C` 都属于典型触发方式。

> 不要使用 `kill -9` 触发停机。`SIGKILL` 无法被进程捕获，Dubbo-go 没有机会执行优雅停机流程。

### 2.2 Provider 侧流程

Provider 侧目标是先摘流，再等待正在执行的请求完成。

1. 从注册中心反注册当前实例，触发 Consumer 端服务列表更新。
2. 对 Triple 长连接 Consumer 发送关闭通知，使 Consumer 可以尽快避开正在关闭的 Invoker。
3. 在 `consumer-update-wait-time` 时间内继续接收请求，给客户端和注册中心事件传播留出窗口。
4. 在开启拒绝新请求前，在 `step-timeout` 和 `offline-request-window-timeout` 约束下等待 Provider 侧活跃请求数归零。
5. 进入拒绝新请求阶段，后续新请求会被拒绝或由自定义 `reject-handler` 处理。
6. 销毁协议、关闭监听端口并释放资源。

`offline-request-window-timeout` 主要用于高流量场景：当活跃请求暂时归零后，再观察一个短窗口。如果窗口内没有新的请求进入，就可以更安全地继续销毁资源。

### 2.3 Consumer 侧流程

Consumer 侧目标是避免继续调用正在关闭的 Provider，并保证自身退出时下游请求尽量完成。

当本实例作为 Consumer 退出时：

1. 等待正在发出的下游请求完成，等待预算由 `step-timeout` 控制。
2. 取消对注册中心的订阅。
3. 销毁 Consumer 端 Invoker、连接和引用。

当远端 Provider 正在关闭时，Consumer 会根据主动关闭通知、响应中的关闭标记或连接关闭错误，将对应 Invoker 临时标记为 closing，并在 `closing-invoker-expire-time` 期间避免继续路由到该 Invoker。注册中心删除事件到达后，Invoker 会被正式移除；如果删除事件没有及时到达，过期时间可以避免 Invoker 永久不可用。

> Consumer 取消注册中心订阅不能放在最开始执行，因为服务在退出期间仍可能需要完成已经发出的下游调用。

## 3. 配置说明

可以在 `dubbogo.yaml` 中配置优雅停机参数：

```yaml
dubbo:
  shutdown:
    timeout: 60s
    step-timeout: 3s
    notify-timeout: 5s
    consumer-update-wait-time: 3s
    offline-request-window-timeout: 3s
    closing-invoker-expire-time: 30s
    internal-signal: true
```

如果使用 new API 初始化 Dubbo 实例，也可以通过 `dubbo.WithShutdown(...)` 搭配 `graceful_shutdown.WithXXX(...)` 配置常用停机参数：

```go
package main

import (
	"time"

	dubbo "dubbo.apache.org/dubbo-go/v3"
	"dubbo.apache.org/dubbo-go/v3/graceful_shutdown"
)

func main() {
	ins, err := dubbo.NewInstance(
		dubbo.WithShutdown(
			graceful_shutdown.WithTimeout(60*time.Second),
			graceful_shutdown.WithStepTimeout(3*time.Second),
			graceful_shutdown.WithNotifyTimeout(5*time.Second),
			graceful_shutdown.WithConsumerUpdateWaitTime(3*time.Second),
			graceful_shutdown.WithOfflineRequestWindowTimeout(3*time.Second),
			// 默认启用 Dubbo-go 内置信号监听；如需应用自行处理信号，可取消下一行注释。
			// graceful_shutdown.WithoutInternalSignal(),
		),
	)
	if err != nil {
		panic(err)
	}
	_ = ins
}
```

`internal-signal` 默认启用，new API 中需要关闭时使用 `graceful_shutdown.WithoutInternalSignal()`；没有专用 `WithXXX` 的字段可以继续保留在 `dubbogo.yaml` 中配置。

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `timeout` | `60s` | 整个优雅停机流程的最大耗时。超过后应用会继续退出，避免进程长期卡住。 |
| `step-timeout` | `3s` | 单个等待阶段的超时时间，主要用于请求排空。建议大于服务 P99/P999 响应时间。 |
| `notify-timeout` | `5s` | 主动通知长连接 Consumer 的超时预算，只控制通知阶段，不替代请求排空时间。 |
| `consumer-update-wait-time` | `3s` | Provider 反注册后继续等待 Consumer 更新地址列表的时间。 |
| `offline-request-window-timeout` | `3s` | Provider 活跃请求归零后的观察窗口，用于确认没有新的请求继续进入。 |
| `closing-invoker-expire-time` | `30s` | Consumer 将远端 Invoker 标记为 closing 后的过期时间。 |
| `internal-signal` | `true` | 是否启用 Dubbo-go 内置信号监听。关闭后需要应用自行调用停机逻辑。 |
| `reject-handler` | 默认处理器 | Provider 开始拒绝新请求时使用的拒绝处理器，通常无需配置。 |

建议根据业务实际耗时调整这些参数：

- `timeout` 应覆盖注册中心传播、长连接通知、请求排空和回调执行，并且小于 Kubernetes `terminationGracePeriodSeconds`。
- `step-timeout` 应至少覆盖绝大多数请求的正常响应时间，慢接口可适当调大。
- `consumer-update-wait-time` 取决于注册中心推送延迟和 Consumer 更新地址列表的耗时。
- `closing-invoker-expire-time` 不宜过短，否则 Consumer 可能在注册中心事件未收敛前重新选择正在关闭的 Provider。

## 4. 本地验证

`dubbo-go-samples/graceful_shutdown` 提供了 Triple 协议的本地验证示例，用于观察长连接通知、请求排空和停机时间参数的效果。该示例不包含注册中心，因此可以验证协议层行为，但不能直接观察注册中心反注册传播。

### 4.1 启动示例

在本地克隆示例仓库，并从仓库根目录执行命令：

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples
```

在第一个终端启动服务端：

```bash
go run ./graceful_shutdown/go-server/cmd -timeout=60s -step-timeout=5s -delay=2s
```

在第二个终端启动客户端：

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=3 -interval=300ms -request-timeout=6s
```

然后在服务端终端按 `Ctrl+C`，观察日志。

预期现象：

- 服务端按顺序输出优雅停机阶段日志。
- 已经进入服务端的请求仍有机会完成。
- 停机开始后，新请求会逐渐失败或被 Consumer 避开。

### 4.2 重要地址格式和参数

进行直连调用时，`-addr` 必须带协议前缀，例如 `tri://127.0.0.1:20000`。如果只传 `127.0.0.1:20000`，在某些场景下可能会被错误解析。

示例服务端命令行参数与 YAML 配置名不完全相同，主要支持：

- `-port=20000`
- `-timeout=60s`
- `-step-timeout=3s`
- `-consumer-update-wait=3s`
- `-offline-window=3s`
- `-delay=0s`

其中 `-delay` 会给每次请求增加固定处理延迟，用于观察停机时的在途请求排空效果。

示例客户端主要支持：

- `-addr=tri://127.0.0.1:20000`
- `-interval=200ms`
- `-concurrency=1`
- `-request-timeout=5s`
- `-short=true|false`
- `-name-prefix=hello`
- `-max-requests=0`
- `-min-successes=0`
- `-min-failures=0`

长连接验证时建议保持 `-short=false`。`-max-requests`、`-min-successes` 和 `-min-failures` 主要用于自动化验证；如果客户端退出前没有达到最小阈值，会直接 `panic` 让集成测试失败。

### 4.3 验证请求排空

使用 `-delay` 模拟慢请求，并让 `step-timeout` 大于请求耗时：

```bash
go run ./graceful_shutdown/go-server/cmd -delay=2s -step-timeout=5s
```

客户端保持并发调用：

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=3 -interval=300ms -request-timeout=6s
```

当请求正在执行时停止服务端。正常情况下，部分已进入服务端的请求会在停机流程中完成；超过等待预算后，服务端继续退出。

### 4.4 验证长连接通知

默认客户端使用长连接，更适合验证主动关闭通知：

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000
```

如需对比短连接行为，可以增加 `-short=true`：

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -short=true
```

### 4.5 同时观察主动通知与请求排空

缩短 Consumer 更新等待时间，可以让服务端更早拒绝新请求，同时保留已有请求的排空窗口：

```bash
go run ./graceful_shutdown/go-server/cmd -delay=2s -timeout=15s -step-timeout=2s -consumer-update-wait=0s
```

客户端持续并发调用：

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=2 -interval=200ms -request-timeout=4s
```

在服务端终端按 `Ctrl+C` 后，重点观察：

- 服务端日志打印完整优雅停机序列。
- 部分在途请求会在停机开始后继续完成。
- 新进入的请求会比默认配置更早失败。
- 客户端日志会体现 Triple 长连接主动通知路径。

### 4.6 缩短请求排空窗口

可以让请求排空预算短于请求处理耗时，用于对比服务端日志行为：

```bash
go run ./graceful_shutdown/go-server/cmd -delay=2s -step-timeout=1s -consumer-update-wait=0s
```

客户端保持并发调用：

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=2 -interval=200ms -request-timeout=4s
```

该场景主要用于观察 `step-timeout` 短于在途请求处理耗时时，优雅停机流程如何继续推进。Dubbo-go 的整体 `timeout` 存在下限，本地验证短等待预算时建议调整 `step-timeout`。

### 4.7 集成测试

示例也接入了 samples 仓库的集成测试脚本：

```bash
./integrate_test.sh graceful_shutdown
```

脚本会启动 Triple 服务端，后台运行客户端，等待至少一次请求成功后发送中断信号触发优雅停机，并校验客户端在停机期间能观察到成功请求和失败请求。

## 5. Kubernetes 部署建议

在 Kubernetes 中，Pod 删除或滚动升级时会先执行 `preStop`，然后向容器主进程发送 `SIGTERM`，最后在 `terminationGracePeriodSeconds` 到期后强制结束容器。Dubbo-go 应用需要在这个时间窗口内完成优雅停机。

推荐配置：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-go-provider
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 90
      containers:
        - name: provider
          image: your-registry/dubbo-go-provider:latest
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 5"]
```

配置建议：

- `terminationGracePeriodSeconds` 应大于 `dubbo.shutdown.timeout`，并预留日志刷新、指标上报和容器退出时间。
- `preStop` 中的短暂 `sleep` 可为 Kubernetes Endpoint、Service 负载均衡和外部网关摘流留出时间，但不要用过长 `sleep` 替代 Dubbo-go 自身的优雅停机。
- 容器入口脚本应使用 `exec ./your-app` 或 `tini` 等方式确保 `SIGTERM` 能传递给 Go 进程。
- 如果应用提供健康检查，建议在进入停机后尽快让 readiness 失败，减少 Kubernetes Service 继续转发新流量的窗口。

验证方式：

```bash
kubectl delete pod <pod-name>
kubectl logs -f <pod-name>
```

同时保持客户端持续调用，观察服务端日志、客户端成功/失败请求数量、注册中心实例列表以及 Pod 退出耗时。

## 6. 自定义回调

如果需要在停机流程结束后执行清理动作，例如刷新日志、上报指标或关闭业务资源，可以注册自定义回调：

```go
extension.AddCustomShutdownCallback(func() {
	// 用户自定义操作
})
```

回调应尽量短小可控。如果回调耗时过长，仍会受到 `timeout` 总预算限制。

## 7. 排查清单

- 如果没有进入优雅停机流程，先确认不是 `kill -9`，并确认 `internal-signal` 没有被关闭。
- 如果滚动发布仍出现大量失败，检查 `consumer-update-wait-time` 是否小于注册中心推送和 Consumer 地址刷新耗时。
- 如果慢请求被中断，检查 `step-timeout` 和 Kubernetes `terminationGracePeriodSeconds` 是否足够。
- 如果 Consumer 仍打到正在关闭的 Provider，检查是否使用 Triple 长连接、注册中心事件是否正常、`closing-invoker-expire-time` 是否过短。
- 如果 Pod 被 Kubernetes 强制杀死，调大 `terminationGracePeriodSeconds` 或缩短应用侧停机回调耗时。

## 8. 参考资料

[【Dubbo-go 优雅上下线的设计与实践】](https://developer.aliyun.com/article/860775)
