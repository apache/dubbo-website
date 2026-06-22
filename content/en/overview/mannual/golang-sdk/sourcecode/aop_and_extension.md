---
aliases:
    - /en/docs3-v2/golang-sdk/preface/design/aop_and_extension/
    - /en/overview/mannual/golang-sdk/preface/design/aop_and_extension/
    - /en/overview/mannual/golang-sdk/refer/sourcecode/aop_and_extension/
description: AOP and extension mechanism in current Dubbo Go
keywords: AOP, extension
title: AOP and Extension Mechanism
type: docs
---

Related samples:

* Custom filter: <a href="https://github.com/apache/dubbo-go-samples/tree/main/filter/custom" target="_blank">dubbo-go-samples/filter/custom</a>
* Condition router: <a href="https://github.com/apache/dubbo-go-samples/tree/main/router/condition" target="_blank">dubbo-go-samples/router/condition</a>
* Tag router: <a href="https://github.com/apache/dubbo-go-samples/tree/main/router/tag" target="_blank">dubbo-go-samples/router/tag</a>

Dubbo Go uses Go package initialization plus a centralized extension registry to provide most pluggable capabilities. Filters, routers, protocols, registries, load balancers, cluster strategies, tracing exporters, and metadata reporters are all loaded in this way.

## Extension Registry

The current implementation lives under `common/extension`. It no longer relies on ad hoc package-level maps for each type. Instead, each extension category uses the shared generic registry helper:

```go
var loadbalances = NewRegistry[func() loadbalance.LoadBalance]("loadbalance")

func SetLoadbalance(name string, fcn func() loadbalance.LoadBalance) {
	loadbalances.Register(name, fcn)
}

func GetLoadbalance(name string) loadbalance.LoadBalance {
	return loadbalances.MustGet(name)()
}
```

The same pattern is used for:

* `common/extension/filter.go`
* `common/extension/protocol.go`
* `common/extension/registry.go`
* `common/extension/router_factory.go`

This gives Dubbo Go a uniform registration model and also supports helper APIs such as unregistering and listing registered names in some categories.

## How `init()` Is Used

Built-in implementations usually register themselves in `init()`:

```go
func init() {
	extension.SetLoadbalance(constant.LoadBalanceKeyRandom, NewRandomLoadBalance)
}
```

The same pattern appears across the runtime:

* `protocol/triple/triple.go` registers Triple
* `protocol/dubbo/dubbo_protocol.go` registers Dubbo
* `protocol/rest/rest_protocol.go` registers REST
* `registry/nacos/registry.go`, `registry/zookeeper/registry.go`, `registry/etcdv3/registry.go` register registries
* `filter/generic/filter.go`, `filter/metrics/filter.go`, `filter/graceful_shutdown/...` register filters
* `cluster/router/condition/factory.go`, `cluster/router/tag/factory.go`, `cluster/router/script/factory.go` register router factories

Once those packages are imported, the framework can look up implementations by name.

## The `imports` Package

For most applications, the easiest way to load built-in implementations is:

```go
import _ "dubbo.apache.org/dubbo-go/v3/imports"
```

`imports/imports.go` is the one-stop entry that imports common built-in:

* cluster strategies
* load balancers
* routers
* config centers
* filters
* metadata report implementations
* tracing and metrics exporters
* protocols
* registries

If you want a smaller runtime surface, you can also import only the concrete implementation packages you need.

## Custom Extensions

A custom extension usually follows the same steps:

1. implement the target interface;
2. register a factory in `init()` with `common/extension`;
3. make sure the package is imported by your application.

For example:

* custom filter: register with `extension.SetFilter(...)`
* custom router factory: register with `extension.SetRouterFactory(...)`
* custom protocol: register with `extension.SetProtocol(...)`
* custom registry: register with `extension.SetRegistry(...)`

The framework then resolves the implementation from configuration or runtime options by name.

## AOP-Style Call Chains

Dubbo Go uses AOP-style chaining in several core abstractions:

* `filter.Filter`
* `cluster.Router`
* `cluster/loadbalance.LoadBalance`
* `protocol/base.Invoker`

Each implementation focuses on one concern, then participates in a larger invocation chain. This is why features such as metrics, tracing, token verification, generic invocation, and graceful shutdown can be added without changing every protocol or business handler.
