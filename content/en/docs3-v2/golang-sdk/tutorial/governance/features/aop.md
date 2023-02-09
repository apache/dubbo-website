---
title: Custom service call middleware
type: docs
weight: 1
---

Refer to samples [dubbo-go-samples/filter](https://github.com/apache/dubbo-go-samples/tree/master/filter)

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Read [[Component Loading and Extensibility]](/en/docs3-v2/golang-sdk/preface/design/aop_and_extension/)
- Create a new demo application

## 2. Configure the specified Filter

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

## 3. Custom Filter

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