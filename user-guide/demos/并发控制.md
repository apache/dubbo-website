限制com.foo.BarService的每个方法，服务器端并发执行（或占用线程池线程数）不能超过10个：

```xml
<dubbo:service interface="com.foo.BarService" executes="10" />
```

限制com.foo.BarService的sayHello方法，服务器端并发执行（或占用线程池线程数）不能超过10个：

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" executes="10" />
</dubbo:service>
```

限制com.foo.BarService的每个方法，每客户端并发执行（或占用连接的请求数）不能超过10个：

```xml
<dubbo:service interface="com.foo.BarService" actives="10" />
```

或

```xml
<dubbo:reference interface="com.foo.BarService" actives="10" />
```

限制com.foo.BarService的sayHello方法，每客户端并发执行（或占用连接的请求数）不能超过10个：

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

或

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

如果 `<dubbo:service>` 和 `<dubbo:reference>` 都配了actives，`<dubbo:reference>` 优先，参见：[配置的覆盖策略](user-guide-configuration#配置覆盖)。

#### Load Balance 均衡

配置服务的客户端的loadbalance属性为leastactive，此Loadbalance会调用并发数最小的Provider（Consumer端并发数）。

```xml
<dubbo:reference interface="com.foo.BarService" loadbalance="leastactive" />
```

或

```xml
<dubbo:service interface="com.foo.BarService" loadbalance="leastactive" />
```