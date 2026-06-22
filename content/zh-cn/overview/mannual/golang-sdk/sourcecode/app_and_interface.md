---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/design/app_and_interface/
    - /zh-cn/docs3-v2/golang-sdk/preface/design/app_and_interface/
    - /zh-cn/overview/mannual/golang-sdk/preface/design/app_and_interface/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/app_and_interface/
description: 当前 Dubbo Go 中的应用级与接口级概念
keywords: 基本概念
title: 应用和接口
type: docs
---

相关示例：

* Hello world 应用：<a href="https://github.com/apache/dubbo-go-samples/tree/main/helloworld" target="_blank">dubbo-go-samples/helloworld</a>
* 基于 YAML 的配置：<a href="https://github.com/apache/dubbo-go-samples/tree/main/config_yaml" target="_blank">dubbo-go-samples/config_yaml</a>
* 基于注册中心的应用：<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>

当前 Dubbo Go 依然保留“应用级配置”和“接口级服务引用”这两个层次，但它的运行时模型已经比早期版本里那种简单的“application vs interface”说明更完整。现在真正的源码入口，是 `options.go` 里的应用实例选项，以及兼容配置文件模式的 `config/root_config.go`。

## 应用级配置

应用级配置会被同一个 Dubbo Go 进程里的所有服务和引用共享。

在配置文件模式下，这套模型由 `config.RootConfig` 表达，主要字段包括：

* `Application`
* `Protocols`
* `Registries`
* `ConfigCenter`
* `MetadataReport`
* `Provider`
* `Consumer`
* `Otel`
* `Metrics`
* `Tracing`
* `Logger`
* `Shutdown`
* `Router`
* `TLSConfig`

在 API 模式下，对应的是 `options.go` 里的 `InstanceOptions`，它通常通过下面这些 helper 填充：

* `dubbo.WithProtocol(...)`
* `dubbo.WithRegistry(...)`
* `dubbo.WithConfigCenter(...)`
* `dubbo.WithMetadataReport(...)`
* `dubbo.WithMetrics(...)`
* `dubbo.WithTracing(...)`
* `dubbo.WithShutdown(...)`
* `dubbo.WithRouter(...)`
* `dubbo.WithRemoteMetadata()`
* `dubbo.WithMetadataServiceProtocol(...)`

这些选项描述的是整个应用实例的运行环境，而不是某一个单独服务。

## 接口级配置

接口级配置则绑定在单个暴露服务或单个远程引用上。

在 provider 侧，核心单位是注册出来的 service：

* `server.Register(...)`
* `server.RegisterService(...)`
* `server.ServiceOptions`

这一层承载接口名、实现 handler、protocol ID、registry ID、序列化方式，以及服务 metadata 等信息。

在 consumer 侧，核心单位是 reference：

* 通过 `client.DialWithInfo(...)` 创建的生成代码 stub
* 通过 `client.DialWithService(...)` 创建的普通 service reference
* 通过 `client.NewGenericService(...)` 创建的泛化 reference

这一层承载接口名、直连 URL 或注册中心目标、协议选择、group/version、timeout，以及按引用粒度配置的路由或 metadata 行为。

## 为什么要区分这两个层次

这个区分在当前 Dubbo Go 里尤其重要，因为应用级服务发现已经是常见模式。

应用级负责的内容包括：

* application identity
* 注册中心和 metadata center 接入
* protocol server/client 初始化
* tracing、metrics、logging
* router 和 shutdown 策略

接口级负责的内容包括：

* 哪个服务被 export 或 refer
* 哪些方法可以被调用
* 每个服务绑定哪些 protocol 和 registry
* 泛化调用或生成代码调用的具体行为

所以，一个进程里可以同时暴露多个服务、引用多个远程服务，同时共享同一套 application identity、registry、protocol server 和治理配置。

## Provider 和 Consumer 可以共存

一个 Dubbo Go 进程可以同时具备 provider 和 consumer 两种角色。实际运行时通常就是这样：

* 一个应用实例里可以有多个 service；
* 同一个应用实例也可以同时引用多个远程 service；
* 除非在 service 或 reference 层显式覆盖，否则它们共享同一套顶层实例选项。

这也是为什么你会在源码中看到 `server`、`client`、`registry`、`metadata`、`protocol` 这些包按职责拆开的原因。
