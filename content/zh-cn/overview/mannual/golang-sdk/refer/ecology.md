---
aliases:
    - /zh/docs3-v2/golang-sdk/refer/ecology/
    - /zh-cn/docs3-v2/golang-sdk/refer/ecology/
description: 当前 Dubbo Go 生态仓库与工具概览
title: 生态组件
type: docs
weight: 1
---

相关仓库与示例：

* 主运行时仓库：[apache/dubbo-go](https://github.com/apache/dubbo-go)
* 示例仓库：[apache/dubbo-go-samples](https://github.com/apache/dubbo-go-samples)
* 泛化调用示例：[dubbo-go-samples/generic](https://github.com/apache/dubbo-go-samples/tree/main/generic)
* Nacos 注册中心示例：[dubbo-go-samples/registry/nacos](https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos)
* Triple 示例：[dubbo-go-samples/rpc/triple](https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple)

这个页面用于梳理当前 Dubbo Go 生态里的主要仓库。很多旧文档还会引用 `dubbogo/*` 下的历史仓库或工具位置；如果是今天要开发或排查问题，优先以 Apache 名下的仓库作为入口。

## dubbo-go

[github.com/apache/dubbo-go](https://github.com/apache/dubbo-go)

Dubbo Go 主运行时仓库，包含：

* 核心运行时代码
* 内置 protocol、registry、filter、router、load balance
* `tools/protoc-gen-go-triple` 等工具
* `tools/dubbogo-cli` 等工具

## dubbo-go-samples

[github.com/apache/dubbo-go-samples](https://github.com/apache/dubbo-go-samples)

这是最适合查找可运行示例的仓库。比较常用的目录包括：

* `helloworld`
* `config_yaml`
* `generic`
* `registry/nacos`、`registry/zookeeper`、`registry/etcd`、`registry/polaris`
* `rpc/triple`、`rpc/multi-protocols`、`rpc/grpc`
* `filter/custom`、`filter/token`、`filter/sentinel`
* `router/condition`、`router/tag`、`router/script`、`router/static_config`
* `mesh`
* `java_interop/*`
* `triple_header_trailer`

## protoc-gen-go-triple

[apache/dubbo-go/tools/protoc-gen-go-triple](https://github.com/apache/dubbo-go/tree/main/tools/protoc-gen-go-triple)

Dubbo Go Triple 服务的 protobuf 代码生成插件。新的文档应当指向这里，而不是历史上的独立工具仓库。

## dubbogo-cli

[apache/dubbo-go/tools/dubbogo-cli](https://github.com/apache/dubbo-go/tree/main/tools/dubbogo-cli)

用于 Dubbo / Dubbo Go 调试与互通场景的命令行工具。现在它已经位于主仓库 `apache/dubbo-go` 内部。

## dubbo-go-hessian2

[github.com/apache/dubbo-go-hessian2](https://github.com/apache/dubbo-go-hessian2)

Dubbo Go 使用的 Hessian2 序列化库，在 Dubbo 协议和泛化调用互通场景里很常见。

## dubbo-getty

[github.com/apache/dubbo-getty](https://github.com/apache/dubbo-getty)

Dubbo Go 生态中使用的异步网络 IO 库之一。

## 关于旧仓库引用

一些旧文章里还会提到：

* 非 Apache 名下的历史工具仓库
* 旧的独立 Triple 代码生成工具仓库
* 旧的 CLI 安装说明

如果是当前 Dubbo Go 开发，优先使用 Apache 仓库以及 `apache/dubbo-go` 下的 `tools/` 目录。
