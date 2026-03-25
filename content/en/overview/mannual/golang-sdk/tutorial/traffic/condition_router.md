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

> The example above uses dynamic configuration and requires a config in Nacos or another config center.

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

### Static configuration API

Besides the dynamic approach above, condition router also supports injecting routing rules statically in code. Static configuration does not require a config center, and it can work with direct URLs or with instances discovered from a registry.

The following example shows a service-scope static condition router:

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

Parameters:

- `router.WithScope("service")`: applies the rule at service scope.
- `router.WithKey(greet.GreetServiceName)`: binds the rule to the target service key.
- `router.WithConditions(...)`: declares the static condition expressions.
- `router.WithForce(true)`: controls whether fallback is allowed when the rule does not match.

The static sample in `dubbo-go-samples` uses direct URLs only to keep the example minimal; it does not mean the API is limited to direct-connect scenarios.

For the static example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/bdcb408a52b6cf3d4f70e5b6f2b0ab52a8f04f43/router/static_config/condition).

### Priority and merge semantics

- Dynamically delivered routing rules override static configuration.
- When `dubbo.WithRouter(...)` is called multiple times, append semantics apply and multiple static router entries are appended to the instance configuration.
- When `router.WithConditions(...)` is set multiple times on the same static router entry, replace semantics apply and the later setting replaces the earlier one.
- Repeatedly injecting the exact same static rule usually leads to the same effective routing result, but the implementation does not compare old and new content and short-circuit as a no-op.
