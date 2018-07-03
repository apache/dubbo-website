# 连接控制

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

如果 `<dubbo:service>` 和 `<dubbo:reference>` 都配了 connections，`<dubbo:reference>` 优先，参见：[配置的覆盖策略](../configuration/xml.md)

[^1]: 因为连接在 Server上，所以配置在 Provider 上
[^2]: 如果是长连接，比如 Dubbo 协议，connections 表示该服务对每个提供者建立的长连接数

