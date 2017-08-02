限制服务器端接受的连接不能超过10个：（因为连接在Server上，所以配置在Provider上）

```xml
<dubbo:provider protocol="dubbo" accepts="10" />
```

```xml
<dubbo:protocol name="dubbo" accepts="10" />
```

限制客户端服务使用连接连接数：(如果是长连接，比如Dubbo协议，connections表示该服务对每个提供者建立的长连接数)

```xml
<dubbo:reference interface="com.foo.BarService" connections="10" />
```

或

```xml
<dubbo:service interface="com.foo.BarService" connections="10" />
```

如果 `<dubbo:service>`和 `<dubbo:reference>` 都配了connections，`<dubbo:reference>` 优先，参见：[配置的覆盖策略](../configuration/xml.md)

