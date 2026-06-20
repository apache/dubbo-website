---
description: 脚本路由
title: 脚本路由
type: docs
weight: 1
---

## 使用方法

### 前置准备

- Docker 以及 Docker compose 环境来部署Nacos配置中心。
- Nacos 2.x+
- Go 1.23+

#### 启动Nacos配置中心

参考这个教程来[启动Nacos](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/)。

### Script router 介绍

Script router与condition router类似，都提供了使用表达式进行流量管控的功能。
但是Script router具有更强大的匹配功能，与此同时带来的是匹配消耗的资源更多，因此在生产环境中应当尽量少使用。

Script router的示例代码与Condition router类似，在nacos配置上略有差别，这里仅提供nacos上的简单配置。

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

参数说明:

| 参数     | 说明                 |
|--------|--------------------|
| type   | script的类型，目前仅可使用js |
| script | script实际内容         |

> 动态配置的 `Data Id` 必须是 `{provider_application}.script-router`。

### 静态配置

Script router 同时支持本地静态路由配置。静态配置适用于不使用配置中心的场景，或在动态配置下发前提供启动阶段的默认规则。

下面的示例在创建引用时添加一个应用粒度的静态脚本路由规则：

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

`Key` 必须是目标 provider application 名称。静态脚本规则会按 `{provider_application}.script-router` 存储，因此不同 provider application 的多条静态规则可以同时存在。

### 优先级与合并语义

- 配置中心下发的动态脚本规则优先于同一 provider application 的静态配置。
- Script router 的静态配置仅支持应用粒度规则。
- 如果静态规则的 `key`、`type`、`script` 为空，`enabled: false`，脚本类型不支持，或脚本内容无法编译，该规则会被忽略。
- 如果当前 provider application 没有生效的动态脚本规则，Dubbo 会使用匹配的静态脚本规则。

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/script)。
