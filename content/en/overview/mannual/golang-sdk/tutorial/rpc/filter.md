---
aliases:
  - /zh-cn/overview/mannual/golang-sdk/tutorial/governance/features/custom-filter/
description: filter拦截器
title: filter拦截器
type: docs
weight: 7
---

Filter 过滤器动态拦截请求（request）或响应（response）以转换或使用请求或响应中包含的信息。过滤器本身通常不会创建响应，而是提供可以“附加”到任何一次 RPC 请求的通用函数。Dubbo Filter 是可插拔的，我们可以在一次 RPC 请求中插入任意类型的、任意多个 Filter。

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

Filter 可以加载在 Consumer 端或者 Provider端。当加载在 Consumer 端，其Invoke函数调用的下游为网络层，OnResponse 为请求结束从网络层获取到返回结果后被调用。当加载在 Provider 端，其 Invoke 函数调用的下游为用户代码，OnResponse 为用户代码执行结束后向下传递至网络层前被调用。

Filter 采用面向切面设计的思路，通过对 Filter 的合理扩展，可以记录日志、设置数据打点，记录 invoker 所对应服务端性能，限流等等工作。

### 2. 框架预定义 Filter

框架预定义了一系列filter，可以在配置中直接使用，其代码实现位于 [filter](https://github.com/apache/dubbo-go/tree/main/filter)

- accesslog
- active
- sign: AuthConsumerFilter
- auth: AuthProviderFilter
- echo
- execute: ExecuteLimitFilter
- generic: GenericFilter
- generic_service: GenericServiceFilter
- pshutdown: GracefulShutdownProviderFilter
- cshutdown: GracefulShutdownConsumerFilter
- hystrix_consumer: HystrixConsumerFilter
- hystrix_provider: HystrixProviderFilter
- metrics
- seata
- sentinel-provider
- sentinel-consumer
- token
- tps
- tracing

### 3. 默认加载Filter

用户在配置文件中配置了自定义 Filter 加载策略时，框架将同时加载用户配置的 filters 和默认 filters，否则仅加载默认 filters。当前版本默认激活的 filter 列表如下：

- Consumer: cshutdown
- Provider: echo, metrics, token, accesslog, tps, generic_service, executivete, pshutdown

### 4. 自定义Filter

用户可在代码中自定义 Filter，注册到框架上，并在配置中选择使用。

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

## 完整示例
可通过以下链接学习如何使用 API 配置和启用 Filter 的 <a href="https://github.com/apache/dubbo-go-samples/tree/main/filter" target="_blank">完整示例源码地址</a>


