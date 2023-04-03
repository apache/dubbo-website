---
title: Custom Filter component
weight: 3
type: docs
---

Refer to samples [dubbo-go-samples/filter](https://github.com/apache/dubbo-go-samples/tree/master/filter)

## 1. Filter concept

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

Filter can be loaded on the Consumer side or the Provider side. When loaded on the Consumer side, the downstream of its Invoke function call is the network layer, and OnResponse is called after the request is completed and the return result is obtained from the network layer. When loaded on the Provider side, the downstream of its Invoke function call is user code, and OnResponse is called after the user code is executed and passed down to the network layer.

Filter adopts the idea of aspect-oriented design. Through reasonable expansion of Filter, it can record logs, set data management, record the performance of the server corresponding to the invoker, limit traffic, and so on.

## 2. Framework predefined Filter

The framework predefines a series of filters, which can be used directly in the configuration, and its code implementation is located at [filter](https://github.com/apache/dubbo-go/tree/release-3.0/filter)

- accesslog
- active
- sign: AuthConsumerFilter
- auth: AuthProviderFilter
  -echo
- execute: ExecuteLimitFilter
- generic: GenericFilter
- generic_service: GenericServiceFilter
- pshutdown: GracefulShutdownProviderFilter
  -cshutdown: GracefulShutdownConsumerFilter
- hystrix_consumer: HystrixConsumerFilter
- hystrix_provider: HystrixProviderFilter
- metrics
- seata
- sentinel-provider
- sentinel-consumer
  -token
  -tps
- tracing

## 3. Load Filter by default

When the user configures the filter to be used in the configuration file, the framework uses the filter configured by the user, otherwise the default filter is loaded:

-Consumer:

cshutdown

- Provider:

  echo, metrics, token, accesslog, tps, generic_service, executivete, pshutdown

## 4. User specified Filter

When specifying a filter, it can be separated by ','

- Consumer side

  ```yaml
  dubbo:
    consumer:
      filter: echo,token,tps,myCustomFilter # Custom filter can be specified
  ```



- Provider side

  ```yaml
  dubbo:
    provider:
      services:
        GreeterProvider:
          filter: myCustomFilter, echo, tps
  ```

## 5. Custom Filter

Users can customize Filter in the code, register it on the framework, and choose to use it in the configuration.

```go
func init() {
extension. SetFilter("myCustomFilter", NewMyClientFilter)
}

func NewMyClientFilter() filter. Filter {
return &MyClientFilter{}
}

type MyClientFilter struct {
}

func (f *MyClientFilter) Invoke(ctx context.Context, invoker protocol.Invoker, invocation protocol.Invocation) protocol.Result {
fmt.Println("MyClientFilter Invoke is called, method Name = ", invocation.MethodName())
return invoker. Invoke(ctx, invocation)
}
func (f *MyClientFilter) OnResponse(ctx context.Context, result protocol.Result, invoker protocol.Invoker, protocol protocol.Invocation) protocol.Result {
fmt.Println("MyClientFilter OnResponse is called")
return result
}

```


