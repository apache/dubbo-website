---
description: 亲和性路由
title: 亲和性路由
type: docs
weight: 1
---

## 使用方法

### 前置准备

- Docker 以及 Docker Compose 环境，用于部署 Nacos 注册中心。
- Nacos 2.x+
- Go 1.23+

#### 启动 Nacos 配置中心

请参考文档
[安装并启动 Nacos 服务](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/)。

### 亲和性路由

亲和性路由会优先选择与消费端具有相同参数值的 provider，常用于同地域、同环境等流量就近路由场景。

例如消费端 URL 携带 `region=beijing` 时，下面的规则会优先选择同样携带 `region=beijing` 的 provider：

```yaml
configVersion: v3.1
scope: service
key: service.apache.com
enabled: true
runtime: true
affinityAware:
  key: region
  ratio: 20
```

参数说明：

- `scope`：使用 `service` 表示服务级规则，使用 `application` 表示应用级规则。
- `key`：规则作用的服务名或 provider 应用名。
- `enabled`：是否启用该规则。
- `affinityAware.key`：用于亲和性匹配的参数名。路由器会匹配 provider 侧同名参数值与消费端值相同的实例。
- `affinityAware.ratio`：启用亲和性筛选结果所需的最小命中比例，取值范围为 `0` 到 `100`。如果命中比例低于该值，Dubbo 会保留原始 provider 列表。

> 动态配置的 `Data Id` 在服务级规则下为 `{service_key}.affinity-router`，在应用级规则下为 `{provider_application}.affinity-router`。

### 客户端使用

客户端需要启用配置中心，以便 Dubbo 订阅亲和性路由规则：

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName("affinity-client"),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress(RegistryAddress),
	),
	dubbo.WithConfigCenter(
		config_center.WithNacos(),
		config_center.WithAddress(RegistryAddress),
	),
)
```

服务端需要在 URL 参数中发布相同的亲和性 key，例如 `region=beijing`。当客户端请求也携带 `region=beijing` 时，路由器会优先选择这些 provider。

### 静态配置

亲和性路由也支持本地静态路由配置。静态配置适用于不依赖配置中心的场景，或者需要在动态配置可用前提供启动规则的场景。

下面的示例在创建 reference 时添加一个服务级静态亲和性规则：

```go
conn, err := cli.NewService(&svc,
	client.WithRouter(&global.RouterConfig{
		Scope: constant.RouterScopeService,
		Key:   "service.apache.com",
		AffinityAware: global.AffinityAware{
			Key:   "region",
			Ratio: 20,
		},
	}),
)
```

如果需要应用级路由，可以使用 `constant.RouterScopeApplication`，并将 `Key` 设置为目标 provider 应用名。

### 优先级与合并语义

- 动态下发的路由规则会覆盖同一有效规则上的静态配置。
- 静态亲和性规则按配置 key 存储，因此 `Key` 不同的多条静态规则可以同时存在。
- `affinityAware.key` 为空、`ratio` 非法或 `enabled: false` 的静态规则会被忽略。
- 如果没有 provider 命中亲和性 key，或者命中比例低于 `affinityAware.ratio`，Dubbo 会保留原始 provider 列表。
