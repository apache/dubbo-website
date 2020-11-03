# Lazy Connect

Lazy connect can reduce the number of keep-alive connections. When a call is initiated, create a keep-alive connection.[^1]

```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

[^1]: Note: This configuration takes effect only for dubbo protocols that use keep-alive connections.
