---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/features/generic/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/generic/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/features/generic/
    - /zh-cn/overview/mannual/golang-sdk/tutorial/develop/features/generic/
description: 当前 Dubbo Go 的泛化调用
title: 泛化调用
type: docs
weight: 7
---

相关示例：

* 泛化调用示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/generic" target="_blank">dubbo-go-samples/generic</a>
* Triple 示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple" target="_blank">dubbo-go-samples/rpc/triple</a>

当前 Dubbo Go 的泛化调用主要围绕 `client.NewGenericService(...)` 和 `filter/generic.GenericService` 展开。早期基于 `ReferenceConfigBuilder`、`GenericLoad()`、`GetRPCService()` 的示例属于兼容旧 API 的写法，已经不是推荐入口。

## 核心 API

主要运行时入口在 `client/client.go`：

```go
genericService, err := cli.NewGenericService(
	"org.apache.dubbo.samples.UserProvider",
	client.WithProtocolTriple(),
	client.WithSerialization(constant.Hessian2Serialization),
	client.WithURL("tri://127.0.0.1:20000"),
)
```

`NewGenericService(...)` 默认会做三件事：

* 设置 `NONIDL`
* 打开 generic invocation
* 使用 `hessian2` 序列化

它内部会创建 `filter/generic.GenericService`，然后接入 Dubbo Go 正常的 reference 和 invocation 流程。

## GenericService

核心类型如下：

```go
type GenericService struct {
	Invoke func(ctx context.Context, methodName string, types []string, args []hessian.Object) (any, error) `dubbo:"$invoke"`
}
```

它和 Dubbo 的泛化调用模型保持一致：调用方提供：

* 方法名
* 参数类型名列表
* 参数值列表

框架再把这些内容编码成对远端服务的 `$invoke` 请求。

## 强类型结果辅助方法

当前 Dubbo Go 还提供了 `InvokeWithType(...)`：

```go
var user User
err := genericService.InvokeWithType(
	ctx,
	"getUser",
	[]string{"java.lang.String"},
	[]hessian.Object{"123"},
	&user,
)
```

这个辅助方法会把泛化调用结果反序列化成具体的 Go 返回对象。这样你既可以保留泛化调用的动态传输方式，又不需要手动把返回的 map 结构再转一遍。

## 常见使用场景

泛化调用通常适合这些场景：

* 调用方没有生成代码 stub
* 调用方希望按接口名和方法名动态发起调用
* 调用方要和 Java Dubbo 服务通过 generic payload 交互
* 在迁移或测试阶段需要一个动态 client

如果你想看 Triple + Hessian2 兼容场景，最值得先看的 sample 就是 `generic`。

## 和 Generic Filter 的关系

它并不只是一个 client helper。实现同时也和 `filter/generic` 下的过滤链相关，Dubbo Go 会在那里处理泛化调用的编码、解码以及服务端适配逻辑。

这也是为什么这个能力既属于 client API，也属于框架基于 filter 的扩展机制。
