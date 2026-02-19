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
