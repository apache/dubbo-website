---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/design/architecture/
    - /zh-cn/docs3-v2/golang-sdk/preface/design/architecture/
    - /zh-cn/overview/mannual/golang-sdk/preface/design/architecture/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/architecture/
description: 当前 Dubbo Go 架构
keywords: 架构
title: 架构
type: docs
weight: 1
---

相关示例：

* 快速开始 RPC 应用：<a href="https://github.com/apache/dubbo-go-samples/tree/main/helloworld" target="_blank">dubbo-go-samples/helloworld</a>
* 基于注册中心的微服务应用：<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>
* 多协议应用：<a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/multi-protocols" target="_blank">dubbo-go-samples/rpc/multi-protocols</a>

Dubbo Go 当前围绕几个运行时概念组织：应用实例、provider、consumer、protocol、registry、metadata 和治理扩展。现在的应用通常通过 `dubbo.go`、`server`、`client` 中的 API 入口构建；使用配置文件的场景仍然会走 `config.RootConfig`。

## 主要运行层次

| 层次 | 主要包 | 职责 |
| --- | --- | --- |
| 应用实例 | `dubbo.go`, `options.go` | 持有 application、protocol、registry、metadata、metrics、tracing、router、shutdown 等选项。 |
| Provider API | `server` | 注册 service handler，构造 service options，创建 invoker 并暴露服务。 |
| Consumer API | `client` | 创建 client，引用服务，创建生成代码服务或泛化服务，并发起远程调用。 |
| Protocol | `protocol/base`, `protocol/triple`, `protocol/dubbo`, `protocol/rest` | Provider 侧将 invoker 转为网络服务，consumer 侧将 invoker 转为网络调用。 |
| Registry 与发现 | `registry`, `registry/protocol`, `registry/servicediscovery`, `registry/directory` | 负责注册、订阅、服务发现和注册中心驱动的调用。 |
| Metadata | `metadata`, `metadata/report`, `metadata/mapping` | 负责服务定义、service-to-application 映射和 metadata 上报。 |
| 治理扩展 | `filter`, `cluster`, `cluster/router`, `cluster/loadbalance`, `common/extension` | 提供 filter、router、load balance、cluster 策略和扩展注册。 |

## Provider 流程

当前 server API 下，provider 通常会经历以下流程：

1. `dubbo.NewInstance(...)` 创建应用实例并初始化全局选项。
2. `ins.NewServer(...)` 基于 application、protocol、registry、provider 选项创建 server。
3. 生成代码或用户代码调用 `server.Register(...)` 或 `server.RegisterService(...)`。
4. server 构造 `ServiceOptions`，记录服务 metadata，并创建 invoker。
5. `ServiceOptions.Export()` 委托协议完成服务暴露。
6. 如果配置了注册中心，`registry/protocol` 会协调服务 export、注册中心注册和 metadata 上报。

Triple 协议通过 `protocol/triple` 暴露服务。应用级服务发现路径则通过 `registry/servicediscovery` 注册应用实例和 metadata。

## Consumer 流程

consumer 通常会经历以下流程：

1. `dubbo.NewInstance(...)` 创建应用实例。
2. `ins.NewClient(...)` 创建带有 registry、protocol、consumer、metadata、metrics、tracing、router 等选项的 client。
3. 生成代码 client 调用 `client.DialWithInfo(...)`，泛化调用使用 `client.NewGenericService(...)`。
4. client 构造 `ReferenceOptions`，并在需要时初始化 metadata report。
5. 直连 URL 会直接进入目标 protocol；注册中心 URL 会进入 `registry/protocol`。
6. registry directory 接收地址变更，并在调用前应用 router、load balance 和 cluster 逻辑。

## 扩展加载

很多实现通过 Go 包初始化注册。导入：

```go
import _ "dubbo.apache.org/dubbo-go/v3/imports"
```

会加载常用内置 protocol、registry、filter、router、metadata report、tracing exporter、metrics、load balance 和 cluster 策略。用户也可以只按需导入具体实现包。
