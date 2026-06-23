---
aliases:
  - /zh-cn/overview/mannual/golang-sdk/tutorial/governance/features/custom-filter/
description: filter拦截器
title: filter拦截器
type: docs
weight: 7
---

示例源码：<a href="https://github.com/apache/dubbo-go-samples/tree/main/filter" target="_blank">dubbo-go-samples/filter</a>。

Filter 过滤器会动态拦截请求（request）或响应（response），以转换或利用其中携带的信息。过滤器本身通常
不会直接创建响应，而是提供可以“附加”到 RPC 调用链上的通用逻辑。Dubbo Filter 是可插拔的，因此我们
可以在一次 Consumer 或 Provider 调用链中组合多个 Filter。

Filter 工作原理如下图所示：

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/framework/filter.png"/>


## 使用方式
### 1. Filter 拦截器概念

Filter 定义如下：

```go
// Filter interface defines the functions of a filter
// Extension - Filter
type Filter interface {
	// Invoke is the core function of a filter, it determines the process of the filter
	Invoke(context.Context, protocol.Invoker, protocol.Invocation) protocol.Result
	// OnResponse updates the results from Invoke and then returns the modified results.
	OnResponse(context.Context, protocol.Result, protocol.Invoker, protocol.Invocation) protocol.Result
}
```

Filter 可以加载在 Consumer 端或者 Provider 端。当它加载在 Consumer 端时，`Invoke` 的下游是网络层，
`OnResponse` 会在收到响应后被调用；当它加载在 Provider 端时，`Invoke` 的下游是用户代码，
`OnResponse` 会在用户代码执行完成、响应写回网络前被调用。

Filter 采用面向切面的设计思路，适合承载日志、指标、链路追踪、鉴权、流量保护、优雅停机、泛化调用适配
等横切能力。

### 2. Filter 的加载方式

新项目建议优先按需引入具体的 filter：

```go
import _ "dubbo.apache.org/dubbo-go/v3/filter/echo"
import _ "dubbo.apache.org/dubbo-go/v3/filter/generic"
```

如果你希望一次性引入 Dubbo Go SDK 中大部分内置能力，也可以直接使用：

```go
import _ "dubbo.apache.org/dubbo-go/v3/imports"
```

另外还保留了历史上的批量导入方式：

```go
import _ "dubbo.apache.org/dubbo-go/v3/filter/filter_impl"
```

### 3. 框架内置 Filter

框架内置了一系列 filter，可以在配置中直接启用，其代码实现位于
[filter](https://github.com/apache/dubbo-go/tree/main/filter) 目录。

- accesslog
- active
- padasvc: Adaptive Service Provider Filter
- sign: Auth Consumer Filter
- auth: Auth Provider Filter
- echo
- execute: Execute Limit Filter
- generic: Generic Consumer Filter
- generic_service: Generic Provider Filter
- pshutdown: Graceful Shutdown Provider Filter
- cshutdown: Graceful Shutdown Consumer Filter
- metrics
- otelServerTrace / otelClientTrace: OpenTelemetry Trace Filter
- polaris-limit: Polaris 限流 Filter
- seata
- sentinel-provider
- sentinel-consumer
- token
- tps
- tracing: Tracing Filter

`hystrix_consumer` 和 `hystrix_provider` 属于更早版本中的能力。当前 3.3.x 文档重点展示主仓库和
`imports` 包里仍然存在的内置 filter。

### 4. 默认 Filter 链

如果不手动覆盖配置，Dubbo Go SDK 默认会启用如下 filter 链：

- Consumer: cshutdown
- Provider: echo, token, accesslog, tps, generic_service, execute, pshutdown

在此基础上，还可能根据配置自动追加其他 filter，例如：

- 开启 metrics 时追加 `metrics`
- 开启 OpenTelemetry tracing 时追加 `otelServerTrace` 或 `otelClientTrace`
- Provider 端开启 adaptive service 时追加 `padasvc`

如果用户在配置文件中声明了自定义 filter 策略，框架会把用户配置和默认链合并，而不是简单把运行时默认能力全部替换掉。

一个最小配置示例如下：

```yaml
dubbo:
  consumer:
    filter: "metrics,tracing"
  provider:
    filter: "accesslog,tps"
```

如果是在根配置层声明，通常使用 `consumer.filter` 和 `provider.filter`；如果是在具体引用或服务配置里声明，
则分别使用 `reference.filter` 和 `service.filter`。

### 5. 自定义 Filter

用户可以在代码中自定义 Filter，注册到框架上，并在配置中选择启用。

```go
func init() {
	extension.SetFilter("myCustomFilter", NewMyClientFilter)
}

func NewMyClientFilter() filter.Filter {
	return &MyClientFilter{}
}

type MyClientFilter struct {
}

func (f *MyClientFilter) Invoke(ctx context.Context, invoker protocol.Invoker, invocation protocol.Invocation) protocol.Result {
	fmt.Println("MyClientFilter Invoke is called, method Name = ", invocation.MethodName())
	return invoker.Invoke(ctx, invocation)
}
func (f *MyClientFilter) OnResponse(ctx context.Context, result protocol.Result, invoker protocol.Invoker, protocol protocol.Invocation) protocol.Result {
	fmt.Println("MyClientFilter OnResponse is called")
	return result
}
```
