---
description: 条件路由
title: 条件路由
type: docs
weight: 1
---

相关示例：

- 动态 condition router：<a href="https://github.com/apache/dubbo-go-samples/tree/main/router/condition" target="_blank">dubbo-go-samples/router/condition</a>
- 静态 condition router：<a href="https://github.com/apache/dubbo-go-samples/tree/main/router/static_config/condition" target="_blank">dubbo-go-samples/router/static_config/condition</a>

## 使用方法

### 前置准备

- Docker 以及 Docker compose 环境来部署Nacos配置中心。
- Nacos 2.x+
- Go 1.23+

#### 启动Nacos配置中心

参考这个教程来[启动Nacos](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/)。

### Condition router 介绍

Condition router 与 Tag router 类似，但是提供了更强大的流量管控功能，可以通过表达式`consumer => provider`，
对服务端以及客户端进行流量管控。

匹配表达式示例:

`host = 127.0.0.1 => host = 127.0.0.1, 192.168.1.1`

> 可以使用 = 以及 != 等符号进行匹配，使用逗号进行多选择匹配。

示例代码:

服务端部分:

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("condition-server"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(TriPort),
		),
	)
```

客户端部分:

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("condition-client"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithConfigCenter( // configure config center to enable condition router
			config_center.WithNacos(),
			config_center.WithAddress(RegistryAddress),
		),
	)
rep, err := srv.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"})
```

> 上述示例使用的是动态配置方式，需要在nacos等配置中心动态设置匹配规则。

运行示例（两个服务端同属应用`condition-server`，客户端每 5 秒调用一次`Greet`方法）:

```shell
$ go run ./go-server/cmd/server.go              # 20001端口
$ go run ./go-node2-server/cmd/server_node2.go  # 20000端口
$ go run ./go-client/cmd/client.go
```

Nacos配置示例:

> 配置的`Data ID`名字必须为: `{application_name}.{router_type}`。
> 例如: `condition-server.condition-router`（这里的应用名是**服务端**的应用名）。
> Group 使用默认的`DEFAULT_GROUP`，配置格式选择`YAML`。

```yaml
configVersion: V3.3.2
scope: "application"
key: "condition-server"
priority: 1
force: true
enabled: true
conditions:
  - from:
      match: "application = condition-client"
    to:
      - match: "port = 20001"
```

关键字段说明:

- `enabled`: 是否启用本条规则，下发时需要设置为`true`。
- `force`: 路由结果为空集时是否强制生效。`true`表示不回退、直接调用失败；`false`表示回退到全量地址列表。

预期结果:

- 未下发规则时，客户端可以正常调用，响应来自 20000 或 20001 端口的实例。
- 规则下发后，运行中的客户端无需重启即可生效，响应只会来自 20001 端口的实例:

  ```
  receive: hello world from: 20001
  ```

- 删除规则后，客户端调用恢复为不受限状态。

> 当`force: true`且规则过滤后没有可用 provider 时，调用会直接失败，客户端日志中可以看到
> `route an empty set in condition-route`字样，说明规则已生效但未匹配到任何实例，
> 此时应检查`to.match`条件与实例的实际参数（如端口）是否一致。

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/condition)。

### 静态配置 API

除上面的动态配置方式外，Condition router 也支持通过静态配置 API 在代码中注入路由规则。静态配置不要求配置中心参与，可以配合直连 URL 使用，也可以配合注册中心使用。

下面是一个服务级静态 condition router 的示例：

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName(clientApplication),
	dubbo.WithRouter(
		router.WithScope("service"),
		router.WithKey(greet.GreetServiceName),
		router.WithPriority(100),
		router.WithForce(true),
		router.WithConditions([]string{
			"method = Greet => port = 20000",
		}),
	),
)
```

参数：

- `router.WithScope("service")`: 按服务维度生效。
- `router.WithKey(greet.GreetServiceName)`: 指定当前规则作用的服务键。
- `router.WithConditions(...)`: 静态声明 condition router 的匹配表达式。
- `router.WithForce(true)`: 控制规则命中失败时是否允许回退。

`dubbo-go-samples` 中的静态示例使用直连 URL，只是为了最小化演示，不代表该 API 只能用于直连场景。

静态配置示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/static_config/condition)。

### 规则优先级与合并语义

- 动态配置的路由规则会覆盖静态配置。
- 多次调用 `dubbo.WithRouter(...)` 时，采用 append 语义，多条静态路由会被追加到实例配置中。
- 对同一条静态路由多次设置 `router.WithConditions(...)` 时，采用 replace 语义，后一次设置会替换前一次设置。
- 重复注入完全相同的静态规则时，最终路由结果通常保持一致，但实现上不会先比较新旧内容并短路跳过。
