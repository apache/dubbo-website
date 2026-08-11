---
description: Tag Router
title: Tag Router
type: docs
weight: 1
---

Related samples:

- Dynamic tag router: <a href="https://github.com/apache/dubbo-go-samples/tree/main/router/tag" target="_blank">dubbo-go-samples/router/tag</a>
- Static tag router: <a href="https://github.com/apache/dubbo-go-samples/tree/main/router/static_config/tag" target="_blank">dubbo-go-samples/router/static_config/tag</a>

## How to use

### Prerequisites

- Docker and Docker Compose environment to deploy Nacos registry.
- Nacos Version 2.x+
- Go 1.23+

#### Run Nacos

Follow this instruction
to [install and start Nacos server](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/).

### Tag router

The tag router enables traffic control based on tags. It is commonly used for canary releases (tag the new-version instances so that only requests carrying the tag are routed to them) and environment isolation (instances in different lanes are distinguished by tags to keep traffic from crossing environments). The following is the example code.

Server side:

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("tag-server"),
		dubbo.WithTag("test-tag"), // set application's tag
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20001),
		),
	)
```

Parameters:

- dubbo.WithTag: Sets tag that the instance carries, which used to mark the instance (e.g. Canary Env). The tag is written into the instance metadata (`dubbo.tag`) in the registry. Tag matching is case-sensitive, so it must exactly match the tag carried by the client.

Client side:

```go
atta := map[string]string{
	constant.Tagkey:      "test-tag",
	constant.ForceUseTag: "true", // use string type
}
ctx := context.WithValue(context.Background(), constant.AttachmentKey, atta)
resp, err := svc.Greet(ctx, &greet.GreetRequest{Name: name})
```

Parameters:

- `constant.Tagkey`: Sets tag that requests carry.
- `constant.ForceUseTag`: Sets whether to force tag matching. With `"true"`, the call fails when no instance matches the tag; with `"false"`, it is allowed to fall back to untagged instances.

> Untagged traffic is routed only to untagged servers. Tagged traffic can be routed to servers with matching tags or
> to untagged servers, depending on the force configuration.

Run the sample:

```shell
$ go run ./go-server/cmd/server.go           # untagged server, port 20000
$ go run ./go-tag-server/cmd/server_tag.go   # server tagged with test-tag, port 20001
$ go run ./go-client/cmd/client.go
```

The client makes four calls in turn, and the expected results are:

```
✔ invoke successfully : receive: tag with force, response from: server-with-tag
❌ invoke failed: Failed to invoke the method Greet.
✔ invoke successfully : receive: tag with no-force, response from: server-without-tag
✔ invoke successfully : receive: non-tag, response from: server-without-tag
```

The four calls correspond to: tag matched successfully; tag not found with force set to true (no fallback, the call fails); tag not found but force set to false (falls back to the untagged instance); untagged traffic (routed only to the untagged instance).

For the complete example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/tag).

### Dynamic rule configuration

Besides request-level tags, tag rules can also be delivered dynamically from a config center, leaving the "tag → instance group" mapping to the rule.

Dynamic tag rules require a config center. The client must connect to Nacos via `dubbo.WithConfigCenter`, otherwise the log prints `Config center does not start, Tag router will not be enabled`:

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName("tag-client"),
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

Create a config in Nacos with `Data ID` set to `{application_name}.tag-router` (the application name here is the **server-side** application name, e.g. `tag-server.tag-router`), Group set to the default `DEFAULT_GROUP`, and format set to `YAML`.

Example rule — route requests carrying the `gray` tag to instances with `dubbo.tag=test-tag`:

```yaml
configVersion: V3.3.2
scope: application
key: tag-server
force: false
enabled: true
priority: 1
tags:
  - name: gray
    match:
      - key: dubbo.tag
        value:
          exact: test-tag
```

Key fields:

- `tags[].name`: the tag name, corresponding to the tag value carried in the request attachment.
- `tags[].match`: matches the instance group by instance URL parameters; `value` supports `exact`, `prefix`, `regex`, etc.
- `tags[].addresses`: selects the instance group directly by `ip:port`; use either this or `match`.
- `force`: whether to fall back when no instance matches the tag. `true` means no fallback and the call fails directly; `false` means falling back to untagged instances.
- `enabled`: whether this rule is enabled.

Once the rule is published, running consumers pick it up without restart, and the client log prints `Parse tag router config success`.

> To disable a dynamic rule, it is recommended to republish the config with `enabled: false`, and running consumers immediately return to the behavior without the rule. If the config entry is deleted directly, running consumers may not receive the delete event and the old rule may stay effective.

### Static configuration API

Besides the usage above, tag router also supports injecting routing rules statically in code. Static configuration does not require a config center, and it can work with direct URLs or with instances discovered from a registry.

The following example shows an application-scope static tag router:

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName(clientApplication),
	dubbo.WithRouter(
		router.WithScope("application"),
		router.WithKey(clientApplication),
		router.WithPriority(100),
		router.WithForce(false),
		router.WithTags([]global.Tag{
			{
				Name:      "gray",
				Addresses: []string{"127.0.0.1:20002"},
			},
		}),
	),
)
```

Request tag attachment:

```go
ctx := context.WithValue(context.Background(), constant.AttachmentKey, map[string]string{
	constant.Tagkey: "gray",
})
```

Parameters:

- `router.WithScope("application")`: applies the rule at application scope.
- `router.WithKey(clientApplication)`: binds the rule to the consumer application.
- `router.WithTags(...)`: declares the static mapping from tag to address list.
- `router.WithForce(...)`: controls whether fallback is allowed when no tagged provider matches.

The static sample in `dubbo-go-samples` uses direct URLs only to keep the example minimal; it does not mean the API is limited to direct-connect scenarios.

For the static example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/static_config/tag).

### Priority and merge semantics

- Dynamically delivered routing rules override static configuration.
- When `dubbo.WithRouter(...)` is called multiple times, append semantics apply and multiple static router entries are appended to the instance configuration.
- When `router.WithTags(...)` is set multiple times on the same static router entry, replace semantics apply and the later setting replaces the earlier one.
- Repeatedly injecting the exact same static rule usually leads to the same effective routing result, but the implementation does not compare old and new content and short-circuit as a no-op.
