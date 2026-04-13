---
description: Tag Router
title: Tag Router
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
