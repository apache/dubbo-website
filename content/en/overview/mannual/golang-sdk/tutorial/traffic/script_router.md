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

For the complete example, please
see: [Full Example Code](https://github.com/apache/dubbo-go-samples/tree/main/router/script).