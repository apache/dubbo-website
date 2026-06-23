---
description: "说明 dubbo-go 应用级服务发现的注册数据、metadata 模式和默认 metadata service 配置。"
title: 应用级服务发现
type: docs
weight: 12
---

dubbo-go 支持接口级注册和应用级服务发现。接口级注册会把可调用的 provider URL 直接写入注册中心；应用级服务发现会把应用实例写入注册中心，再通过服务映射和 metadata 还原 consumer 调用所需的 provider URL。

应用级服务发现是当前默认模型。接口级注册和应用级服务发现使用不同的注册与订阅路径，二者不会自动互通。使用接口级发现的 consumer 无法发现只注册应用级实例的 provider；使用应用级服务发现的 consumer 也无法发现只注册接口级 URL 的 provider。如果迁移阶段需要同时支持两类 consumer，可以使用 `all`。

## 注册模式

可以通过 registry type 选择 provider 的注册方式：

| Registry type | API 配置 | 注册内容 |
| --- | --- | --- |
| `interface` | `registry.WithRegisterInterface()` | provider URL，例如 `tri://host:port/interface` 或 `rest://host:port/interface`。 |
| `service` | `registry.WithRegisterService()` | 应用实例和实例 metadata。consumer 先发现实例，再通过 metadata 解析 provider URL。 |
| `all` | `registry.WithRegisterServiceAndInterface()` | 同时注册应用级实例和接口级 provider URL，适合迁移阶段使用。 |

示例：

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
		registry.WithRegisterService(),
	),
)
```

如果使用配置文件，可以将 `registry-type` 设置为 `service`、`interface` 或 `all`。如果对注册方式有明确要求，建议显式配置。

## 注册中心存储什么

在应用级服务发现中，注册中心不会把完整的可调用 provider URL 作为主要注册数据，而是存储应用级数据，例如：

- 应用名；
- 实例 host 和 port；
- 实例 metadata；
- 暴露服务的 revision；
- metadata 存储类型；
- metadata service URL 参数；
- service 到 application 的映射关系。

consumer 会先查询某个服务由哪些应用提供，再订阅这些应用实例，最后通过 metadata 还原服务级 provider URL。

## Metadata 模式

应用级服务发现需要 provider metadata。dubbo-go 支持 local 和 remote 两种 metadata 存储模式。

### Local Metadata

`local` 是当前默认模式。

在 local metadata 模式下，provider 将 `MetadataInfo` 保存在本地，并暴露 metadata service。provider 会把实例 revision 和 metadata service URL 参数写入注册中心。consumer 从 provider instance 中读取这些参数，再调用 provider 的 metadata service 拉取 `MetadataInfo`。

流程如下：

```text
provider -> registry: application instance + revision + metadata service URL params
consumer -> registry: discover provider instance
consumer -> provider metadata service: get MetadataInfo by revision
```

metadata service 的 RPC 协议由 `metadata-service-protocol` 控制。当前默认值是 `dubbo`，也可以显式配置：

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithMetadataServiceProtocol("tri"),
)
```

provider 和 consumer 不需要配置相同的 `metadata-service-protocol`。provider 会把实际使用的 metadata service protocol 写入实例 metadata，consumer 根据 provider 广播出来的协议调用 metadata service。consumer 运行时需要具备调用该协议的能力。

### Remote Metadata

在 remote metadata 模式下，provider 通过 metadata report 将 `MetadataInfo` 上报到 metadata center。consumer 从 metadata center 读取 metadata，而不是调用 provider 的 metadata service。

流程如下：

```text
provider -> metadata center: report MetadataInfo
provider -> registry: application instance + revision
consumer -> registry: discover provider instance
consumer -> metadata center: read MetadataInfo by revision
```

可以通过 `dubbo.WithRemoteMetadata()` 开启 remote metadata，并配置 metadata report：

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithRemoteMetadata(),
	dubbo.WithMetadataReport(
		metadata.WithProtocol("nacos"),
		metadata.WithAddress("127.0.0.1:8848"),
	),
)
```

也可以复用 registry 作为 metadata report。registry 默认 `use-as-meta-report=true`，除非显式设置 `registry.WithoutUseAsMetaReport()`。

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithRemoteMetadata(),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
		registry.WithRegisterService(),
	),
)
```

remote metadata 模式下，provider 和 consumer 都需要能够访问同一个 metadata center。此时 consumer 不会调用 provider 的 metadata service，因此 `metadata-service-protocol` 不参与 remote metadata 读取链路。

## 当前默认值

| 配置项 | 当前默认值 |
| --- | --- |
| `metadata-type` | `local` |
| `metadata-service-protocol` | `dubbo` |
| registry `use-as-meta-report` | `true` |
| registry `use-as-config-center` | `true` |
| 默认注册和发现模型 | 应用级服务发现，`registry.WithRegisterService()` 或 `registry-type: service` |

## 隐式默认值与行为

有一些行为在配置未显式填写时会自动推导，比较容易被忽略：

- 如果没有配置 `registry-type`，dubbo-go 会回退到应用级注册与发现。
- 应用级 consumer 在 reference 没有显式指定业务协议时，会默认按 `tri` 订阅。
- `metadata-type` 默认是 `local`，因此如果没有显式开启 remote metadata，consumer 会通过 provider 的 metadata service 拉取 metadata。
- 在 local metadata 模式下，`metadata-service-protocol` 默认是 `dubbo`。
- 如果没有配置 `metadata-service-port`，metadata service 会优先复用默认协议端口；如果拿不到可用端口，则回退为随机端口。
- registry 默认 `use-as-meta-report=true`，所以只要不显式设置 `registry.WithoutUseAsMetaReport()`，registry 可以直接复用为 metadata report center。
- registry 还默认 `use-as-config-center=true`，所以只要不显式设置 `registry.WithoutUseAsConfigCenter()`，同一个 registry 也可能被复用为 config center。

## 使用建议

- 应用级服务发现使用 `service` 注册。
- 迁移阶段如果仍有接口级 consumer，可以使用 `all`。
- 简单部署和示例优先使用 local metadata。
- 如果已经有 metadata center，并且希望 consumer 不直接调用 provider metadata RPC，可以使用 remote metadata。
- local metadata 模式下，如果不希望使用默认 metadata transport，建议显式配置 `metadata-service-protocol`。
