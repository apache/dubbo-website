---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/design/aop_and_extension/
    - /zh-cn/docs3-v2/golang-sdk/preface/design/aop_and_extension/
    - /zh-cn/overview/mannual/golang-sdk/preface/design/aop_and_extension/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/aop_and_extension/
description: 当前 Dubbo Go 的 AOP 与扩展机制
keywords: AOP, extension
title: AOP 与可扩展机制
type: docs
---

相关示例：

* 自定义 filter：<a href="https://github.com/apache/dubbo-go-samples/tree/main/filter/custom" target="_blank">dubbo-go-samples/filter/custom</a>
* 条件路由：<a href="https://github.com/apache/dubbo-go-samples/tree/main/router/condition" target="_blank">dubbo-go-samples/router/condition</a>
* 标签路由：<a href="https://github.com/apache/dubbo-go-samples/tree/main/router/tag" target="_blank">dubbo-go-samples/router/tag</a>

Dubbo Go 通过 Go 包初始化和统一的扩展注册中心，来承载大部分可插拔能力。filter、router、protocol、registry、load balance、cluster 策略、tracing exporter、metadata report 等能力，都是按这个模型加载的。

## extension 注册中心

当前实现位于 `common/extension`。它已经不再依赖每个类型单独维护的原始 map，而是统一使用泛型注册中心：

```go
var loadbalances = NewRegistry[func() loadbalance.LoadBalance]("loadbalance")

func SetLoadbalance(name string, fcn func() loadbalance.LoadBalance) {
	loadbalances.Register(name, fcn)
}

func GetLoadbalance(name string) loadbalance.LoadBalance {
	return loadbalances.MustGet(name)()
}
```

同样的模式也用在：

* `common/extension/filter.go`
* `common/extension/protocol.go`
* `common/extension/registry.go`
* `common/extension/router_factory.go`

这样做之后，Dubbo Go 的扩展注册模型更统一，也支持某些类别上的注销、列举已注册名称等辅助能力。

## `init()` 的作用

内置实现通常都会在自己的包里通过 `init()` 完成注册：

```go
func init() {
	extension.SetLoadbalance(constant.LoadBalanceKeyRandom, NewRandomLoadBalance)
}
```

运行时里很多能力都遵循这个模式：

* `protocol/triple/triple.go` 注册 Triple
* `protocol/dubbo/dubbo_protocol.go` 注册 Dubbo
* `protocol/rest/rest_protocol.go` 注册 REST
* `registry/nacos/registry.go`、`registry/zookeeper/registry.go`、`registry/etcdv3/registry.go` 注册 registry
* `filter/generic/filter.go`、`filter/metrics/filter.go`、`filter/graceful_shutdown/...` 注册 filter
* `cluster/router/condition/factory.go`、`cluster/router/tag/factory.go`、`cluster/router/script/factory.go` 注册 router factory

只要这些包被导入，框架后续就能按名称查找到对应实现。

## `imports` 包

对大多数应用来说，最简单的做法是直接导入：

```go
import _ "dubbo.apache.org/dubbo-go/v3/imports"
```

`imports/imports.go` 是一个一站式入口，会统一导入常用内置实现，包括：

* cluster 策略
* load balance
* router
* config center
* filter
* metadata report 实现
* tracing 和 metrics exporter
* protocol
* registry

如果你希望更精细地控制依赖面，也可以只按需导入具体实现包。

## 自定义扩展

自定义扩展一般遵循下面几步：

1. 实现目标接口；
2. 在 `init()` 中通过 `common/extension` 注册工厂；
3. 确保应用最终导入了这个包。

例如：

* 自定义 filter：使用 `extension.SetFilter(...)`
* 自定义 router factory：使用 `extension.SetRouterFactory(...)`
* 自定义 protocol：使用 `extension.SetProtocol(...)`
* 自定义 registry：使用 `extension.SetRegistry(...)`

后续框架就可以根据配置或运行时选项里的名称来解析这些实现。

## 面向切面的调用链

Dubbo Go 在多个核心抽象上采用了 AOP 风格的调用链设计：

* `filter.Filter`
* `cluster.Router`
* `cluster/loadbalance.LoadBalance`
* `protocol/base.Invoker`

每个实现只关注自己的一层职责，然后组合进更大的调用链里。这也是 metrics、tracing、token 校验、泛化调用、优雅停机等能力可以在不侵入所有 protocol 或业务 handler 的前提下接入的原因。
