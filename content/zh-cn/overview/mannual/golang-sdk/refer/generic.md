---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/concept/generic/
    - /zh-cn/docs3-v2/golang-sdk/preface/concept/generic/
    - /zh-cn/overview/mannual/golang-sdk/preface/concept/generic/
description: 泛化调用参考
keywords: 泛化调用
title: 泛化调用
type: docs
weight: 2
---

相关示例：

* 泛化调用示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/generic" target="_blank">dubbo-go-samples/generic</a>
* Triple 示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple" target="_blank">dubbo-go-samples/rpc/triple</a>

另见：[源码指南：泛化调用](/zh-cn/overview/mannual/golang-sdk/sourcecode/generic/)。

泛化调用允许调用方在没有目标接口生成代码 stub 的情况下发起远程调用。它常见于网关、测试、互通、动态调用等场景。

## 推荐入口

对于当前 Dubbo Go，推荐使用的入口是：

* `client.NewGenericService(...)`
* `filter/generic.GenericService.Invoke(...)`
* `filter/generic.GenericService.InvokeWithType(...)`

这是现在写新泛化调用代码时的标准运行时路径。早期基于 `config.ReferenceConfig` 的手工示例属于兼容路径，不应再作为新文档的默认方案。

## Triple 场景下的典型用法

如果是直连调用：

```go
ins, err := dubbo.NewInstance(dubbo.WithName("generic-client"))
if err != nil {
	panic(err)
}

cli, err := ins.NewClient()
if err != nil {
	panic(err)
}

genericService, err := cli.NewGenericService(
	"org.apache.dubbo.samples.UserProvider",
	client.WithProtocolTriple(),
	client.WithSerialization(constant.Hessian2Serialization),
	client.WithURL("tri://127.0.0.1:50052"),
	client.WithVersion("1.0.0"),
	client.WithGroup("triple"),
)
if err != nil {
	panic(err)
}
```

然后就可以按方法名动态调用远端方法：

```go
resp, err := genericService.Invoke(
	context.Background(),
	"GetUser1",
	[]string{"java.lang.String"},
	[]hessian.Object{"A003"},
)
```

这是理解泛化调用最直接的方式，也和当前 `dubbo-go-samples/generic` 的示例结构一致。

## 自动结果映射

如果你不想手动把返回的 map 再转成 Go struct，可以使用 `InvokeWithType(...)`：

```go
type User struct {
	ID   string
	Name string
	Age  int32
}

var user User
err = genericService.InvokeWithType(
	context.Background(),
	"GetUser1",
	[]string{"java.lang.String"},
	[]hessian.Object{"A003"},
	&user,
)
```

`InvokeWithType(...)` 适合“传输层使用泛化调用，但调用方仍希望得到强类型 Go 结果”的场景。

## 泛化方式

Dubbo Go 通过 `generic` 配置支持多种泛化方式：

| 泛化方式 | 参数值 | 返回形态 | 典型用途 |
| --- | --- | --- | --- |
| Map | `true` | `map[string]any` 风格数据 | 默认且最常用 |
| Gson | `gson` | JSON 字符串 | 面向 JSON 的互通 |
| Protobuf-JSON | `protobuf-json` | JSON 字符串 | protobuf 服务互通 |
| Bean | `bean` | Java bean descriptor | Java 兼容场景 |

对于大多数 Go 或 Go/Java 互通场景，默认的 Map 泛化方式仍然是最实用的选择。

## 接口定义建议

如果一个服务预期要支持泛化调用或跨语言消费，建议：

* 优先使用显式 request struct，而不是复杂的散装参数列表；
* 在公开 RPC 接口中优先使用 `[]T`，不要使用 variadic `...T`；
* 新的跨语言服务优先使用 Triple + Protobuf IDL。

这样接口在动态调用方、网关和泛化序列化场景里会更容易建模。
