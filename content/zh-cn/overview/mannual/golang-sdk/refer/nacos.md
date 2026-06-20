---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
description: 当前 Dubbo Go 中使用 Nacos 作为注册中心
title: 使用 Nacos 作为注册中心
type: docs
weight: 10
---

相关示例：

* Nacos 注册中心示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>
* 应用级服务发现参考：<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>

另见：

* [应用级服务发现](/zh-cn/overview/mannual/golang-sdk/tutorial/service-discovery/application-level-service-discovery/)
* [工具：dubbogo-cli](/zh-cn/overview/mannual/golang-sdk/tools/dubbogo-cli/)

这个页面用于说明当前 Dubbo Go 中如何把 Nacos 作为注册中心来使用。它的旧版本主要在讲 CLI 调试流程，但那已经不是现在 Nacos 集成页的核心内容了。

## 这个示例展示了什么

当前 `registry/nacos` sample 主要展示：

* provider 注册到 Nacos
* consumer 通过 Nacos 发现服务
* 基于 Triple 的 RPC 调用链路
* Go 应用中基于注册中心的服务发现

示例目录主要包括：

* `go-server/cmd/server.go`
* `go-client/cmd/client.go`
* `proto/greet.proto`

## 启动 Nacos

首先启动一个可用的 Nacos 服务，并确保 Dubbo Go 应用能够访问它。sample README 使用的是标准 Nacos 服务和默认控制台。

## 启动 Provider

在 sample 目录下运行：

```bash
go run ./go-server/cmd/server.go
```

provider 启动后会暴露服务，并把实例注册到 Nacos。

你也可以用一个 HTTP 请求先验证服务已经起来：

```bash
curl \
  --header "Content-Type: application/json" \
  --data '{"name": "Dubbo"}' \
  http://localhost:20000/greet.GreetService/Greet
```

## 启动 Consumer

然后运行：

```bash
go run ./go-client/cmd/client.go
```

consumer 会先通过 Nacos 解析目标服务，再发起 RPC 调用。

## 配置形态

在当前 Dubbo Go 中，Nacos 可能出现在几个不同层次的配置里：

* 实例级：`dubbo.WithRegistry(registry.WithNacos(), ...)`
* 引用级：`client.WithRegistry(...)` 或 `client.WithRegistryIDs(...)`
* 服务级：`server.WithRegistry(...)` 或 `server.WithRegistryIDs(...)`
* 配置文件模式：`registries` 节点

常用 registry 选项来自 `registry/options.go`，包括：

* `registry.WithNacos()`
* `registry.WithAddress(...)`
* `registry.WithGroup(...)`
* `registry.WithNamespace(...)`
* `registry.WithRegisterService()`
* `registry.WithRegisterInterface()`
* `registry.WithRegisterServiceAndInterface()`

## 应用级服务发现

在当前 Dubbo Go 部署里，Nacos 很常和应用级服务发现一起使用。在这个模型下：

* provider 注册应用实例和 metadata；
* consumer 先解析 service 到 application 的映射；
* 再通过 metadata 还原出可调用的服务端点。

如果你正在判断要不要继续用旧的接口级注册模型，建议先从上面链接的“应用级服务发现”页面看起。

## 关于 dubbogo-cli

`dubbogo-cli` 依然可以用于调试和互通场景，但它不再是 Nacos 注册中心页面的主体内容。如果你需要 CLI，请从下面的位置安装：

* [apache/dubbo-go/tools/dubbogo-cli](https://github.com/apache/dubbo-go/tree/main/tools/dubbogo-cli)

然后参考独立的 tools 页面。
