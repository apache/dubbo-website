---
description: 脚本路由
title: 脚本路由
type: docs
weight: 1
---

示例源码：<a href="https://github.com/apache/dubbo-go-samples/tree/main/router/script" target="_blank">dubbo-go-samples/router/script</a>。

Script Router 在消费端通过 JavaScript 脚本筛选候选 Provider，目前支持应用级动态规则。它适合根据 Provider URL、RPC 方法、调用附件等运行时信息实现自定义路由，例如将流量固定到指定端口、按租户或灰度标识选择实例。

对于只需按地址、方法或应用名进行简单匹配的场景，优先使用 Condition Router。Script Router 的表达能力更强，但脚本执行和维护成本更高，生产环境应限制脚本复杂度，并验证脚本始终返回可调用的 Provider 列表。

## 前置准备

- Docker 和 Docker Compose，用于运行 Nacos。
- Nacos 2.x+。
- Go 1.23+。
- 已下载 `dubbo-go-samples/router/script` 示例。

### 启动 Nacos

按照 [Nacos 快速开始](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/) 启动 Nacos。示例中的注册中心和配置中心地址均为 `127.0.0.1:8848`。

## 脚本入参

路由脚本以 `invokers`、`invocation`、`context` 三个参数执行，必须返回由原始候选项组成的数组。

| 入参 | 含义 | 常见用法 |
| --- | --- | --- |
| `invokers` | 当前可用的候选 Provider 列表。每项可通过 `GetURL()` 获取服务 URL。 | 根据 URL 的端口、地址或参数过滤实例。 |
| `invocation` | 当前 RPC 调用信息。 | 根据方法名、参数或 attachments 实现按调用维度的路由。 |
| `context` | 当前调用上下文。 | 在脚本需要时读取调用链路中的上下文信息。 |

下面的脚本只保留端口为 `20000` 的 Provider：

```javascript
(function(invokers, invocation, context) {
  if (!invokers || invokers.length === 0) return [];
  return invokers.filter(function(invoker) {
    var url = invoker.GetURL();
    return url && url.Port === "20000";
  });
})(invokers, invocation, context);
```

## 配置 Script Router

示例 consumer 通过 `dubbo.WithConfigCenter` 连接 Nacos 配置中心。启动 Provider 后，Script Router 会按照 Provider 的应用名订阅规则。

在 Nacos 配置中心新增配置：

| 配置项 | 值 |
| --- | --- |
| Data ID | `script-server.script-router` |
| Group | `DEFAULT_GROUP` |
| 格式 | `YAML` |

Data ID 的命名规则为 `{provider application name}.script-router`。本示例中两个 Provider 都使用 `script-server` 作为应用名，因此 Data ID 为 `script-server.script-router`；`key` 也必须与该应用名一致。

将以下内容保存到 Nacos：

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

字段说明：

| 字段 | 说明 |
| --- | --- |
| `scope` | Script Router 使用 `application` 作用域。 |
| `key` | 规则目标 Provider 的应用名。 |
| `enabled` | 是否启用规则；设置为 `false` 时不执行脚本。 |
| `type` | 脚本类型，当前支持 `javascript`。 |
| `script` | 返回过滤后 Provider 列表的 JavaScript 脚本。 |

## 运行并验证

在 `dubbo-go-samples/router/script` 目录中分别打开三个终端。

先启动两个 Provider：

```bash
go run ./go-server/cmd/server.go              # 端口 20000
go run ./go-node2-server/cmd/server_node2.go  # 端口 20001
```

再启动 consumer：

```bash
go run ./go-client/cmd/client.go
```

consumer 每 5 秒调用一次 `Greet`。未在 Nacos 下发规则时，响应会在 `20000` 和 `20001` 两个 Provider 之间切换。保存上述规则后无需重启 consumer，后续日志应只包含端口 `20000`：

```text
receive: hello world from: 20000
```

删除 Nacos 配置或将 `enabled` 改为 `false` 后，调用会恢复为可路由到两个 Provider。若规则未生效，请检查 Data ID、Group、配置中心连接以及脚本返回值。

## 与 Condition Router 的区别

| 对比项 | Script Router | Condition Router |
| --- | --- | --- |
| 规则表达 | JavaScript 脚本 | 声明式条件表达式，例如 `consumer => provider` |
| 适用场景 | 自定义计算、复杂筛选或基于调用信息决策 | 地址、方法、应用名等常规匹配 |
| 配置方式 | Nacos 动态应用级规则 | 支持动态规则，也支持代码中的静态规则 |
| 成本 | 执行和维护成本更高，需要审查脚本 | 规则简单、可读性更高 |

因此，应先使用 Condition Router 覆盖常规流量控制需求；只有条件表达式无法满足时，再使用 Script Router。
