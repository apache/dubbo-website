---
description: Affinity Router
title: Affinity Router
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

### Affinity router

The affinity router keeps requests close to providers that have the same attachment or URL parameter value as the consumer. A common case is routing traffic to providers in the same region or environment.

For example, if the consumer URL carries `region=beijing`, the following rule prefers providers whose URL also carries `region=beijing`:

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

Parameters:

- `scope`: use `service` for a service-level rule or `application` for an application-level rule.
- `key`: identifies the service or provider application that the rule applies to.
- `enabled`: enables or disables the rule.
- `affinityAware.key`: the parameter name used for affinity matching. The router matches providers whose value equals the consumer-side value for the same key.
- `affinityAware.ratio`: the minimum percentage of matched providers required before the affinity result is used. The value must be between `0` and `100`. If the matched provider ratio is lower, Dubbo keeps the original provider list.

> The `Data Id` of the dynamic config must be `{service_key}.affinity-router` for service scope, or `{provider_application}.affinity-router` for application scope.

### Client usage

Enable a config center on the client so Dubbo can subscribe to the affinity rule:

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

The server should publish the same affinity key as a URL parameter, for example `region=beijing`. When the client request also carries `region=beijing`, the router prefers those providers.

### Static configuration

Affinity router also supports local static router configuration. Static configuration is useful when you want affinity routing without a config center, or when you need a bootstrap rule before dynamic configuration is available.

The following example adds a service-scope static affinity rule when creating a reference:

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

For application-scope routing, use `constant.RouterScopeApplication` and set `Key` to the target provider application name.

### Priority and merge semantics

- Dynamically delivered routing rules override static configuration for the same effective rule.
- Static affinity rules are stored by config key, so multiple static entries can coexist when their `Key` values are different.
- A static rule with an empty `affinityAware.key`, an invalid ratio, or `enabled: false` is ignored.
- If no provider matches the affinity key, or the matched provider ratio is below `affinityAware.ratio`, the original provider list is preserved.
