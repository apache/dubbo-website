---
aliases:
  - /zh/docs3-v2/golang-sdk/refer/compatible_version/
  - /zh-cn/docs3-v2/golang-sdk/refer/compatible_version/
  - /zh-cn/overview/mannual/golang-sdk/preface/refer/compatible_version/
description: 依赖适配版本号
title: 版本信息
type: docs
weight: 1
---

## 推荐版本

当前网站文档面向仍在维护的 Dubbo Go SDK 3.3.x 版本线。如果你正在使用其他 dubbo-go 版本，请参考对应的历史文档和发布说明。

|  Go  | Dubbo-go        | protoc-gen-go-triple                                       | 说明                         |
|:----:|-----------------|------------------------------------------------------------|----------------------------|
| 1.25 | v3.3.2-20260419 | [仓库内置工具](https://github.com/apache/dubbo-go/tree/main/tools/protoc-gen-go-triple) | 当前 3.3.2 日期标签，匹配主干文档 |
| 1.24 | v3.3.1          | [仓库内置工具](https://github.com/apache/dubbo-go/tree/main/tools/protoc-gen-go-triple) | 3.3.x 常规发布版本，推荐新项目使用  |

{{% alert title="说明" color="primary" %}}
新项目建议优先使用同一个 3.3.x 版本线里的最新 patch 版本。当前 3.x 项目生成 Triple 代码时建议使用
dubbo-go 仓库 `tools/protoc-gen-go-triple` 目录下内置的 `protoc-gen-go-triple` 工具。
{{% /alert %}}

{{% alert title="历史说明" color="secondary" %}}
更早的 3.x 版本文档里可能会引用独立的 `protoc-gen-go-triple` 或 `dubbogo-cli` 仓库。下表保留这些链接，
仅用于对应历史版本的上下文说明；当前工具入口已经迁回 dubbo-go 主仓库 `tools/` 目录。
{{% /alert %}}

## 历史版本

### 3.x

查看更早的 3.x 版本文档：

|  Go  | Dubbo-go     | protoc-gen-go-triple                                       | 说明                                   |
|:----:|--------------|------------------------------------------------------------|--------------------------------------|
| 1.20 | v3.2.0-rc1   | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | 较早的 RC 文档；需要当前能力时建议升级到 3.3.x 版本线 |
| 1.16 | v3.1.1       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | 请参考 README 说明，了解如何生成老版本兼容的服务 stub 代码 |
| 1.16 | v3.1.0       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | 请参考 README 说明，了解如何生成老版本兼容的服务 stub 代码 |
| 1.16 | v3.0.4       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | 请参考 README 说明，了解如何生成老版本兼容的服务 stub 代码 |
| 1.16 | v3.0.3       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | 请参考 README 说明，了解如何生成老版本兼容的服务 stub 代码 |
| 1.16 | v3.0.2       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | 请参考 README 说明，了解如何生成老版本兼容的服务 stub 代码 |
| 1.16 | v3.0.1       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | 请参考 README 说明，了解如何生成老版本兼容的服务 stub 代码 |
| 1.16 | v3.0.0       | [v1.0.5](https://github.com/dubbogo/dubbogo-cli)           | CLI 在迁回 dubbo-go 主仓库前的历史打包方式 |
| 1.16 | v3.0.0-rc4-1 | [v1.0.2](https://github.com/dubbogo/dubbogo-cli)           | CLI 在迁回 dubbo-go 主仓库前的历史打包方式 |
| 1.16 | v3.0.0-rc3   | [v1.0.0](https://github.com/dubbogo/dubbogo-cli)           | CLI 在迁回 dubbo-go 主仓库前的历史打包方式 |

### 1.x

| Go | Dubbo-go | Triple | protoc-gen-go-triple | 说明                 | 
|:--:|----------|--------|----------------------|--------------------|
|    | v1.5.0   | v1.1.8 | v1.0.8               | 停止维护，请升级到最新 3.x 版本 |
