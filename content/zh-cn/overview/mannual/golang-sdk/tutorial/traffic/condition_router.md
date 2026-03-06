---
description: 条件路由
title: 条件路由
type: docs
weight: 1
---

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

> 使用condition router必须在nacos等配置中心动态设置匹配规则。

Nacos配置示例:

> 配置的`Data ID`名字必须为: `{application_name}.{router_type}`。
> 例如: `condition-server.condition-router`。

```yaml
configVersion: v3.1
scope: "application"
key: "condition-server"
priority: 1
force: true
enabled: false
conditions:
  - from:
      match: "application = condition-client"
    to:
      - match: "port = 20000"
```

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/condition)。