---
description: Script Router
title: Script Router
type: docs
weight: 1
---

Sample source: <a href="https://github.com/apache/dubbo-go-samples/tree/main/router/script" target="_blank">dubbo-go-samples/router/script</a>.

Script Router runs on the consumer and uses a JavaScript script to filter candidate providers. It currently supports application-scoped dynamic rules. Use it when routing decisions depend on runtime information such as a provider URL, RPC method, or invocation attachment, for example to pin traffic to a port or select instances by tenant or gray-release marker.

For simple matching by address, method, or application name, prefer Condition Router. Script Router is more expressive, but scripts cost more to execute and maintain. Keep production scripts small and verify that they always return callable providers.

## Prerequisites

- Docker and Docker Compose to run Nacos.
- Nacos 2.x or later.
- Go 1.23 or later.
- The `dubbo-go-samples/router/script` sample.

### Start Nacos

Follow the [Nacos quick start](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/) to start Nacos. This sample uses `127.0.0.1:8848` for both the registry and configuration center.

## Script arguments

The route script receives `invokers`, `invocation`, and `context`. It must return an array containing the selected original candidates.

| Argument | Description | Common use |
| --- | --- | --- |
| `invokers` | The currently available provider candidates. Call `GetURL()` on each item to read its service URL. | Filter instances by URL port, address, or parameter. |
| `invocation` | Information about the current RPC call. | Route by method name, arguments, or attachments. |
| `context` | The context of the current call. | Read call-chain context when the script needs it. |

The following script keeps only the provider on port `20000`:

```javascript
(function(invokers, invocation, context) {
  if (!invokers || invokers.length === 0) return [];
  return invokers.filter(function(invoker) {
    var url = invoker.GetURL();
    return url && url.Port === "20000";
  });
})(invokers, invocation, context);
```

## Configure Script Router

The sample consumer connects to the Nacos configuration center through `dubbo.WithConfigCenter`. After the providers start, Script Router subscribes to the rule for the provider application.

Create the following configuration in Nacos:

| Setting | Value |
| --- | --- |
| Data ID | `script-server.script-router` |
| Group | `DEFAULT_GROUP` |
| Format | `YAML` |

The Data ID format is `{provider application name}.script-router`. Both providers in this sample use `script-server` as their application name, so the Data ID is `script-server.script-router`; `key` must use the same application name.

Save the following content in Nacos:

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

Field descriptions:

| Field | Description |
| --- | --- |
| `scope` | The Script Router scope; use `application`. |
| `key` | The application name of the target provider. |
| `enabled` | Whether to enable the rule; `false` skips script execution. |
| `type` | The script type; the sample uses `javascript`. |
| `script` | The JavaScript script that returns the filtered provider list. |

## Run and verify

Open three terminals in the `dubbo-go-samples/router/script` directory.

Start both providers first:

```bash
go run ./go-server/cmd/server.go              # port 20000
go run ./go-node2-server/cmd/server_node2.go  # port 20001
```

Then start the consumer:

```bash
go run ./go-client/cmd/client.go
```

The consumer calls `Greet` every five seconds. Before the rule is published in Nacos, responses alternate between providers on `20000` and `20001`. After saving the rule, the consumer does not need to restart and subsequent logs should only contain port `20000`:

```text
receive: hello world from: 20000
```

Delete the Nacos configuration or set `enabled` to `false` to allow calls to route to both providers again. If the rule does not take effect, check the Data ID, Group, configuration-center connection, and script return value.

## Script Router vs. Condition Router

| Aspect | Script Router | Condition Router |
| --- | --- | --- |
| Rule expression | JavaScript script | Declarative condition expression such as `consumer => provider` |
| Use case | Custom computation, complex filtering, or decisions based on call information | Common matching by address, method, or application name |
| Configuration | Nacos dynamic application-scoped rule | Dynamic rules and static rules declared in code |
| Cost | Higher execution and maintenance cost; scripts require review | Simpler and easier to read |

Use Condition Router for ordinary traffic-control requirements first, and use Script Router only when condition expressions are not sufficient.
