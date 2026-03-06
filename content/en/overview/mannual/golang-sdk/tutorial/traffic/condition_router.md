---
description: Condition Router
title: Condition Router
type: docs
weight: 1
---

## How to use

### Prerequisites

- Docker and Docker Compose environment to deploy Nacos registry.
- Nacos Version 2.x+
- Go 1.23+

#### Run Nacos

Follow this instruction
to [install and start Nacos server](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/).

### Condition router

Similar to the Tag Router, the condition router offers more advanced traffic control capabilities.
It uses `consumer => provider` expressions to manage traffic for both providers and consumers.

Expression example:

`host = 127.0.0.1 => host = 127.0.0.1, 192.168.1.1`

> You can use = and != symbols for matching, and use commas for multiple choice matching.

Here's the example code.

Server side:

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

Client side:

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

> A configuration in Nacos is needed if you want to use condition router.

Example config:

> The `Data Id` of config must be `{application_name}.{router_type}` (e.g. condition-server.condition-router).

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

For the complete example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/condition).