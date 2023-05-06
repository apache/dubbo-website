---
aliases:
    - /zh/docsv2.7/user/examples/config-connections/
description: Dubbo 中服务端和客户端的连接控制
linkTitle: 连接控制
title: 连接控制
type: docs
weight: 29
---


## 背景
连接控制功能可以使用户能够控制和管理进出服务器连接数，限制连接数并设置超时，以确保 Dubbo 系统的稳定性和性能，还允许用户根据 IP 地址、端口和协议配置不同级别的访问控制，保护系统免受恶意流量的影响，并降低服务中断的风险，此外提供了一种监视当前流量和连接状态的方法

## 示例
### 服务端连接控制

限制服务器端接受的连接不能超过 10 个 [^1]：

```xml
<dubbo:provider protocol="dubbo" accepts="10" />
```

或

```xml
<dubbo:protocol name="dubbo" accepts="10" />
```

### 客户端连接控制

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
