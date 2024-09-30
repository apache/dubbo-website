---
aliases:
  - /en/overview/mannual/golang-sdk/tutorial/governance/features/custom-filter/
description: Filter Interceptor
title: Filter Interceptor
type: docs
weight: 7
---

Filters dynamically intercept requests or responses to transform or utilize the information contained in the requests or responses. Filters do not typically create responses themselves but provide generic functions that can be "attached" to any RPC request. Dubbo Filters are pluggable, allowing us to insert any type and number of filters into a single RPC request.

The working principle of filters is illustrated in the diagram below:

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/framework/filter.png"/>

## Usage
### 1. Concept of Filter Interceptor

Filter is defined as follows:

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

Filters can be loaded on either the Consumer or Provider side. When loaded on the Consumer side, the downstream of its Invoke function call is the network layer, and OnResponse is called after getting the return result from the network layer when the request ends. When loaded on the Provider side, the downstream of its Invoke function call is user code, and OnResponse is called before passing down to the network layer after user code execution ends.

Filters adopt an aspect-oriented design approach, allowing for reasonable extensions to record logs, set data points, record service performance corresponding to the invoker, limit traffic, and more.

### 2. Predefined Filters by the Framework

A series of predefined filters are available in the framework for direct use in the configuration, with their code implementation located at [filter](https://github.com/apache/dubbo-go/tree/main/filter).

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

### 3. Default Loaded Filters

When users configure custom filter loading strategies in their configuration files, the framework will load both the user-configured filters and default filters together; otherwise, it will only load the default filters. The list of currently activated default filters is as follows:

- Consumer: cshutdown
- Provider: echo, metrics, token, accesslog, tps, generic_service, executivete, pshutdown

### 4. Custom Filters

Users can create custom filters in their code, register them with the framework, and select them for use in the configuration.

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

## Complete Example
You can learn how to use the API to configure and enable filters through the following link: <a href="https://github.com/apache/dubbo-go-samples/tree/main/filter" target="_blank">Complete example source code address</a>

