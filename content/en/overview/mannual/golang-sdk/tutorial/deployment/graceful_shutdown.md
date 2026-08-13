---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/traffic/graceful_shutdown/
    - /en/docs3-v2/golang-sdk/tutorial/governance/traffic/graceful_shutdown/
    - /en/overview/mannual/golang-sdk/tutorial/deploy2/graceful_shutdown/
description: This article primarily introduces the basic steps and usage instructions for graceful shutdown.
keywords: Graceful Shutdown
title: Graceful Shutdown
type: docs
---

# Graceful Shutdown

Sample source: <a href="https://github.com/apache/dubbo-go-samples/tree/main/graceful_shutdown" target="_blank">dubbo-go-samples/graceful_shutdown</a>.

## 1. Background

During version releases, scaling, or node migration, Kubernetes, systemd, or an operations platform stops old instances and starts new ones. If an old instance exits immediately, the registry, client-side invoker cache, and upstream traffic may be briefly inconsistent: the registry may not have propagated the delete event, and upstream requests may still be running. For high-traffic services, this can cause connection resets, request failures, timeout retries, and alert storms.

Dubbo-go graceful shutdown drains traffic before the process exits. It is designed to ensure that:

- A provider notifies the registry and long-connection consumers before it stops accepting new business requests.
- Requests that have already reached the provider can finish within a bounded timeout.
- A consumer can wait for its own outbound requests before releasing downstream references.
- Resource destruction, port closing, and custom shutdown callbacks run in order.

## 2. How It Works

In a normal Dubbo-go call chain, a service instance often acts as both a provider and a consumer. Graceful shutdown therefore handles both sides.

### 2.1 Shutdown Trigger

When the application receives an exit signal such as `SIGTERM` or `SIGINT`, Dubbo-go enters the built-in graceful shutdown flow if `dubbo.shutdown.internal-signal` is `true`. Typical triggers include Kubernetes pod deletion, rolling upgrades, `kubectl delete pod`, `kill -TERM <pid>`, and pressing `Ctrl+C` in a terminal.

> Do not use `kill -9` for graceful shutdown. `SIGKILL` cannot be caught by the process, so Dubbo-go cannot run the shutdown flow.

### 2.2 Provider Flow

The provider-side goal is to remove the instance from traffic first, then wait for in-flight requests.

1. Unregister the current instance from the registry so consumers can refresh their provider list.
2. Send closing notices to Triple long-connection consumers so they can avoid the closing invoker earlier.
3. Continue accepting requests during `consumer-update-wait-time` to allow registry events and client caches to converge.
4. Before turning on request rejection, wait for provider active requests to reach zero within `step-timeout` and `offline-request-window-timeout`.
5. Enter the reject-new-request phase. New requests are rejected or handled by the custom `reject-handler`.
6. Destroy protocols, close listening ports, and release resources.

`offline-request-window-timeout` is useful for high-traffic services. After active requests temporarily reach zero, Dubbo-go observes a short window. If no new request arrives during that window, it is safer to continue destroying resources.

### 2.3 Consumer Flow

The consumer-side goal is to avoid providers that are closing and to finish its own outbound requests before exit.

When the local instance exits as a consumer:

1. Wait for outbound downstream requests to finish. The wait budget is controlled by `step-timeout`.
2. Unsubscribe from the registry.
3. Destroy consumer invokers, connections, and references.

When a remote provider is shutting down, the consumer can mark the corresponding invoker as closing based on active closing notices, response attachments, or connection-closing errors. During `closing-invoker-expire-time`, the consumer avoids routing to that invoker. The invoker is removed when the registry delete event arrives; if the delete event does not arrive in time, the expiration prevents the invoker from staying unavailable forever.

> A consumer should not unsubscribe from the registry at the beginning of shutdown, because the instance may still need service discovery data to complete outbound calls that are already in progress.

## 3. Configuration

Configure graceful shutdown in `dubbogo.yaml`:

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

If you initialize a Dubbo instance with the new API, you can also configure common graceful shutdown parameters with `dubbo.WithShutdown(...)` and `graceful_shutdown.WithXXX(...)` options:

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
			// Dubbo-go listens for shutdown signals internally by default.
			// Uncomment the next line if the application handles signals itself.
			// graceful_shutdown.WithoutInternalSignal(),
		),
	)
	if err != nil {
		panic(err)
	}
	_ = ins
}
```

`internal-signal` is enabled by default. Use `graceful_shutdown.WithoutInternalSignal()` in the new API when you need to disable it. Fields without dedicated `WithXXX` options can still be configured in `dubbogo.yaml`.

| Field | Default | Description |
| --- | --- | --- |
| `timeout` | `60s` | Maximum duration of the whole graceful shutdown flow. The application continues exiting after this budget to avoid hanging forever. |
| `step-timeout` | `3s` | Timeout for a single wait phase, mainly request draining. It should be greater than the service P99/P999 latency. |
| `notify-timeout` | `5s` | Timeout budget for actively notifying long-connection consumers. It controls only the notify step and does not replace request draining. |
| `consumer-update-wait-time` | `3s` | Time a provider waits after unregistering so consumers can refresh their provider list. |
| `offline-request-window-timeout` | `3s` | Observation window after provider active requests reach zero, used to confirm no new request is still arriving. |
| `closing-invoker-expire-time` | `30s` | Expiration time for a consumer-side invoker that has been marked as closing. |
| `internal-signal` | `true` | Whether Dubbo-go listens for process shutdown signals internally. If disabled, the application must trigger shutdown itself. |
| `reject-handler` | default handler | Rejection handler used after the provider starts rejecting new requests. It usually does not need customization. |

Recommended tuning rules:

- `timeout` should cover registry propagation, long-connection notification, request draining, and shutdown callbacks. It should be lower than Kubernetes `terminationGracePeriodSeconds`.
- `step-timeout` should cover the normal latency of most requests. Increase it for slow methods.
- `consumer-update-wait-time` depends on registry push latency and the time consumers need to refresh provider lists.
- `closing-invoker-expire-time` should not be too short, otherwise a consumer may route to a provider that is still closing before registry convergence finishes.

## 4. Local Verification

`dubbo-go-samples/graceful_shutdown` provides a Triple local sample for verifying long-connection notices, request draining, and timing knobs. The sample does not include a registry, so it can verify protocol-level behavior but cannot directly show registry unregister propagation.

### 4.1 Start The Sample

Clone the samples repository and run commands from the repository root:

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples
```

Start the server in the first terminal:

```bash
go run ./graceful_shutdown/go-server/cmd -timeout=60s -step-timeout=5s -delay=2s
```

Start the client in a second terminal:

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=3 -interval=300ms -request-timeout=6s
```

Then press `Ctrl+C` in the server terminal and watch the logs.

Expected behavior:

- Server logs print graceful shutdown phases in order.
- Requests that already reached the server still have a chance to complete.
- After shutdown begins, new requests gradually fail or are avoided by the consumer.

### 4.2 Important Address Format And Flags

For direct client calls, `-addr` must include the protocol prefix, such as `tri://127.0.0.1:20000`. If you only pass `127.0.0.1:20000`, the direct reference may be parsed incorrectly in some scenarios.

The sample server CLI flags are slightly shorter than the YAML configuration keys. The main flags are:

- `-port=20000`
- `-timeout=60s`
- `-step-timeout=3s`
- `-consumer-update-wait=3s`
- `-offline-window=3s`
- `-delay=0s`

`-delay` adds fixed processing latency to every request so you can verify in-flight request draining during shutdown.

The sample client supports these main flags:

- `-addr=tri://127.0.0.1:20000`
- `-interval=200ms`
- `-concurrency=1`
- `-request-timeout=5s`
- `-short=true|false`
- `-name-prefix=hello`
- `-max-requests=0`
- `-min-successes=0`
- `-min-failures=0`

For long-connection testing, keep `-short=false`. `-max-requests`, `-min-successes`, and `-min-failures` are mainly for automated verification; the client panics if the configured minimum counts are not reached before exit.

### 4.3 Verify Request Draining

Use `-delay` to simulate slow requests and set `step-timeout` greater than the request delay:

```bash
go run ./graceful_shutdown/go-server/cmd -delay=2s -step-timeout=5s
```

Keep the client sending concurrent requests:

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=3 -interval=300ms -request-timeout=6s
```

Stop the server while requests are running. Some in-flight requests should complete during shutdown; after the wait budget is consumed, the server continues exiting.

### 4.4 Verify Long-Connection Notice

The default client uses long connections, which is the preferred path for verifying active closing notices:

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000
```

To compare short-connection behavior, add `-short=true`:

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -short=true
```

### 4.5 Observe Active Notice And Request Draining Together

Use a short consumer update wait so the server starts rejecting new work earlier while existing requests still have a draining window:

```bash
go run ./graceful_shutdown/go-server/cmd -delay=2s -timeout=15s -step-timeout=2s -consumer-update-wait=0s
```

Keep the client sending concurrent requests:

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=2 -interval=200ms -request-timeout=4s
```

After pressing `Ctrl+C` in the server terminal, watch for:

- Server logs print the full graceful shutdown sequence.
- Some in-flight requests still complete after shutdown starts.
- Newer requests fail earlier than with the default configuration.
- Client logs show the Triple long-connection active notice path.

### 4.6 Short Request Draining Window

Use a draining budget shorter than the request delay to compare server log behavior:

```bash
go run ./graceful_shutdown/go-server/cmd -delay=2s -step-timeout=1s -consumer-update-wait=0s
```

Keep the client sending concurrent requests:

```bash
go run ./graceful_shutdown/go-client/cmd -addr=tri://127.0.0.1:20000 -concurrency=2 -interval=200ms -request-timeout=4s
```

This scenario is mainly for observing how the graceful shutdown flow continues when `step-timeout` is shorter than the in-flight request processing time. The overall `timeout` has a lower bound in Dubbo-go, so use `step-timeout` for local short-budget draining verification.

### 4.7 Integration Test

The sample is also included in the samples repository integration test script:

```bash
./integrate_test.sh graceful_shutdown
```

The script starts the Triple server, runs the client in the background, waits until at least one request succeeds, sends an interrupt signal to trigger graceful shutdown, and verifies that the client observes both successful requests and shutdown-time failures.

## 5. Kubernetes Deployment Tips

In Kubernetes, pod deletion or rolling upgrade runs `preStop`, sends `SIGTERM` to the container main process, and finally kills the container when `terminationGracePeriodSeconds` expires. A Dubbo-go application must finish graceful shutdown within this window.

Recommended configuration:

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

Configuration recommendations:

- `terminationGracePeriodSeconds` should be greater than `dubbo.shutdown.timeout`, with extra time reserved for log flushing, metrics reporting, and container exit.
- A short `sleep` in `preStop` can give Kubernetes Endpoints, Service load balancing, and external gateways time to remove the pod from traffic, but it should not replace Dubbo-go graceful shutdown.
- The container entrypoint should use `exec ./your-app` or a signal-forwarding init process such as `tini` so `SIGTERM` reaches the Go process.
- If the application exposes health checks, make readiness fail quickly after shutdown starts to reduce the window in which Kubernetes Service still forwards new traffic.

Verification commands:

```bash
kubectl delete pod <pod-name>
kubectl logs -f <pod-name>
```

Keep a client sending requests at the same time, then check server logs, client success/failure counts, registry instance lists, and pod exit duration.

## 6. Custom Callback

If you need cleanup logic after the shutdown flow, such as flushing logs, reporting metrics, or closing business resources, register a custom callback:

```go
extension.AddCustomShutdownCallback(func() {
	// User defined operations
})
```

Callbacks should be short and bounded. Long-running callbacks are still constrained by the total `timeout` budget.

## 7. Troubleshooting Checklist

- If graceful shutdown does not start, make sure the process was not killed by `kill -9` and `internal-signal` was not disabled.
- If rolling upgrades still produce many failures, check whether `consumer-update-wait-time` is shorter than registry propagation and consumer refresh latency.
- If slow requests are interrupted, check whether `step-timeout` and Kubernetes `terminationGracePeriodSeconds` are large enough.
- If consumers still call a provider that is closing, check whether Triple long connections are used, registry events are normal, and `closing-invoker-expire-time` is not too short.
- If Kubernetes force kills the pod, increase `terminationGracePeriodSeconds` or shorten application shutdown callbacks.

## 8. References

[【Dubbo-go Elegant Up and Down Design and Practice】](https://developer.aliyun.com/article/860775)
