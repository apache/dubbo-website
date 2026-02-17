---
aliases:
  - /en/docs3-v2/golang-sdk/tutorial/governance/traffic/mesh_router/
  - /en/docs3-v2/golang-sdk/tutorial/governance/traffic/mesh_router/
  - /en/overview/mannual/golang-sdk/tutorial/governance/traffic/mesh_router/
description: Routing Rules
title: Routing Rules
type: docs
weight: 1
---

Dubbo-go provides various types of routers to facilitate traffic control, such as implementing canary releases.   
This section briefly introduces the usage of different routers.

## Types

- Tag router
- Condition router
- Script router
- Affinity router

## How to use

### Prerequisites

- Docker and Docker Compose environment to deploy Nacos registry.
- Nacos Version 2.x+
- Go 1.23+

#### Run Nacos

Follow this instruction
to [install and start Nacos server](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/).

### Tag router

The tag router enables traffic control based on tags. The following is the example code.

Server side:

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("tag-server"),
		dubbo.WithTag("test-Tag"), // set application's tag
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20000),
		),
	)
```

Parameters:

- dubbo.WithTag: Sets tag that the instance carries, which used to mark the instance (e.g. Canary Env).

Client side:

```go
atta := map[string]string{
	constant.Tagkey:      "test-tag",
	constant.ForceUseTag: "true", // 使用string类型
}
ctx := context.WithValue(context.Background(), constant.AttachmentKey, atta)
resp, err := svc.Greet(ctx, &greet.GreetRequest{Name: name})
```

Parameters:

- `constant.TagKey`: Sets tag that requests carry.
- `constant.ForceUseTag`: Sets whether to force tag matching.

> Untagged traffic is routed only to untagged servers. Tagged traffic can be routed to servers with matching tags or
> to untagged servers, depending on the force configuration.

For the complete example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/tag).

### Condition router

Similar to the Tag Router, the condition router offers more advanced traffic control capabilities.
It uses `consumer => provider` expressions to manage traffic for both providers and consumers.

Common matching tag:

| tag         | description                    |
|-------------|--------------------------------|
| application | match by name                  |
| version     | match by version               |
| port        | match by port                  |
| region      | match by provider's region     |
| host        | match by ip or domain          |
| method      | match by requesting method     |
| attachement | match by consumer's attachment |

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
configVersion: V3.3.2
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

Parameters:

| Parameter     | Description                                                                                   |
|---------------|-----------------------------------------------------------------------------------------------|
| configVersion | config version (distinguished by v3.1). Post-v3.1 configurations offer more detailed settings |
| scope         | config scope. Can be set to 'service' or 'application'                                        |
| key           | application name                                                                              |
| priority      | priority of the config                                                                        |
| force         | whether to force rule matching                                                                |
| enabled       | whether to enable the config                                                                  |
| conditions    | matching rule                                                                                 |

For the complete example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/condition).

### Script router

Similar to the condition router, the script router enables traffic control using expressions. However,
while it offers more powerful matching capabilities, this comes at the cost of higher resource consumption.
Therefore, it should be used sparingly in production environments.

The example code for the script router is similar to that of the condition router,
with slight differences in the Nacos configuration.
Therefore, only the Nacos configuration is provided here.

```yaml
scope: "application"
key: "script-server"
enabled: true
type: "javascript"
script: |
  (function(invokers, invocation, context) {
    if (!invokers || invokers.length === 0) return [];
    return invokers.filter(function(invoker) {
      var url = invoker.GetURL();
      return url && url.Port === "20000";
    });
  })(invokers, invocation, context);
```

Parameters:

| parameter | description                                |
|-----------|--------------------------------------------|
| type      | type of script.(currently JavaScript only) |
| script    | content of script                          |

For the complete example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/script).

### Affinity router

