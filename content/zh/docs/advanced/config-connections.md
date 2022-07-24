---
type: docs
title: "连接控制"
linkTitle: "连接控制"
weight: 29
description: "Dubbo 中服务端和客户端的连接控制"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/config-connections/)。
{{% /pageinfo %}}

## 服务端连接控制

限制服务器端接受的连接不能超过 10 个 [^1]：

```xml
<dubbo:provider protocol="dubbo" accepts="10" />
```

或

```xml
<dubbo:protocol name="dubbo" accepts="10" />
```

## 客户端连接控制

限制客户端服务使用连接不能超过 10 个 [^2]：

```xml
<dubbo:reference interface="com.foo.BarService" connections="10" />
```

或

```xml
<dubbo:service interface="com.foo.BarService" connections="10" />
```

如果 `<dubbo:service>` 和 `<dubbo:reference>` 都配了 connections，`<dubbo:reference>` 优先，参见：[配置的覆盖策略](../../configuration/xml)

[^1]: 因为连接在 Server上，所以配置在 Provider 上
[^2]: 如果是长连接，比如 Dubbo 协议，connections 表示该服务对每个提供者建立的长连接数

