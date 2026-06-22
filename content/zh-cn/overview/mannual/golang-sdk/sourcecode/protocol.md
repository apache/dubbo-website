---
aliases:
    - /zh/docs3-v2/golang-sdk/sourcecode/protocol/
    - /zh-cn/docs3-v2/golang-sdk/sourcecode/protocol/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/protocol/
description: 当前网络协议源码概览
title: 网络协议
type: docs
weight: 1
---

相关示例：

* Triple RPC：<a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple" target="_blank">dubbo-go-samples/rpc/triple</a>
* 多协议服务：<a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/multi-protocols" target="_blank">dubbo-go-samples/rpc/multi-protocols</a>
* gRPC 互通：<a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/grpc" target="_blank">dubbo-go-samples/rpc/grpc</a>

在当前 Dubbo Go 中，protocol 层是 invocation 模型和底层网络协议之间的桥梁。它一方面负责把 provider 暴露成网络服务，另一方面负责把 consumer 侧的引用转换成可调用的远程 invoker。

## 核心协议抽象

当前协议接口定义在 `protocol/base/base_protocol.go`：

```go
type Protocol interface {
	Export(invoker Invoker) Exporter
	Refer(url *common.URL) Invoker
	Destroy()
}
```

它的职责很直接：

* `Export`：把 provider 侧 invoker 暴露成网络服务
* `Refer`：为目标 URL 创建 consumer 侧 invoker
* `Destroy`：销毁该协议持有的 invoker 和 exporter

此外还有一个可选能力：

```go
type RegistryUnregisterer interface {
	UnregisterRegistries()
}
```

它主要用于优雅停机阶段，让协议在完整 teardown 之前，先把已经暴露出去的服务从注册中心摘除。

## Provider 侧流程

在 provider 侧，Dubbo Go 通常会经过下面这条链路：

1. `server.Register(...)` 或 `server.RegisterService(...)` 创建 service metadata 和 invoker。
2. `ServiceOptions.Export()` 选择 protocol 和 registry 行为。
3. 具体协议实现调用 `Export(invoker)`。
4. 暴露后的服务开始监听配置好的网络端点。

不同协议提供不同的传输层和编解码方式，但都会遵循同一个 `Export` 契约。

## Consumer 侧流程

在 consumer 侧：

1. `client.Dial...(...)` 构造 reference。
2. 解析直连 URL 或注册中心 URL。
3. 选中的协议实现调用 `Refer(url)`。
4. 返回的 invoker 成为生成代码 stub 或泛化调用背后的可调用对象。

这也是为什么 protocol 层会同时服务于生成代码调用和基于注册中心的动态引用。

## 内置协议实现

常用内置实现包括：

* `protocol/triple`
* `protocol/dubbo`
* `protocol/rest`
* `protocol/jsonrpc`

其中 Triple 是当前新应用推荐使用的协议，支持 unary、streaming、metadata header/trailer、reflection，以及在线路层和 gRPC 互通。

如果你想看一个应用如何同时暴露多个协议端点，`rpc/multi-protocols` 是很合适的 sample。

## 注册中心协议包装层

Dubbo Go 还提供了位于 `registry/protocol` 的 registry-backed protocol 层。

它会协调：

* 服务 export
* 服务注册
* metadata 上报
* 订阅和 directory 刷新

所以实际运行时，很多 reference 并不是单纯的“protocol 调用”，而是“registry protocol + 具体业务协议”的组合。

## 带过滤链的协议调用

原始 protocol 实现通常还会经过 `protocol/protocolwrapper` 的再次包装，尤其是 filter 链的接入。这样 protocol 调用就成为很多横切能力的集成点，例如：

* tracing
* metrics
* token/auth 校验
* 泛化调用支持
* 优雅停机

这也是为什么 protocol 包在接口层看起来很小，但在整个运行时调用链里非常关键。
