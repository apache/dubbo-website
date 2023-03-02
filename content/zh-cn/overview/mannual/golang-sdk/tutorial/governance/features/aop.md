---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/features/aop/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/features/aop/
description: 自定义服务调用中间件
title: 自定义服务调用中间件
type: docs
weight: 1
---






参考samples [dubbo-go-samples/filter](https://github.com/apache/dubbo-go-samples/tree/master/filter)

## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 阅读[【组件加载与可扩展性】](/zh-cn/overview/mannual/golang-sdk/preface/design/aop_and_extension/)
- 创建一个新的 demo 应用

## 2. 配置指定 Filter

指定filter时可用','分隔

- Consumer 端

  ```yaml
  dubbo:
    consumer:
      filter: echo,token,tps,myCustomFilter # 可指定自定义filter
  ```

  

- Provider 端

  ```yaml
  dubbo:
    provider:
      services:
        GreeterProvider:
          filter: myCustomFilter,echo,tps
  ```

## 3. 自定义Filter

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