---
description: Script Router
title: Script Router
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

> The `Data Id` of the dynamic config must be `{provider_application}.script-router`.

### Static configuration

Script router also supports local static router configuration. Static configuration is useful when you want script routing without a config center, or when you need a bootstrap rule before dynamic configuration is available.

The following example adds an application-scope static script rule when creating a reference:

```go
conn, err := cli.NewService(&svc,
	client.WithRouter(&global.RouterConfig{
		Scope:      constant.RouterScopeApplication,
		Key:        "script-server",
		ScriptType: "javascript",
		Script: `
(function(invokers, invocation, context) {
  if (!invokers || invokers.length === 0) return [];
  return invokers.filter(function(invoker) {
    var url = invoker.GetURL();
    return url && url.Port === "20000";
  });
})(invokers, invocation, context);`,
	}),
)
```

`Key` must be the target provider application name. Static script rules are stored by `{provider_application}.script-router`, so multiple static entries can coexist when their provider application names are different.

### Priority and merge semantics

- Dynamically delivered script rules override static configuration for the same provider application.
- Script router only supports application-scope static rules.
- A static rule with an empty `key`, empty `type`, empty `script`, `enabled: false`, an unsupported script type, or an invalid script is ignored.
- If no dynamic script rule is active for the provider application, Dubbo uses the matching static script rule.

For the complete example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/script).
