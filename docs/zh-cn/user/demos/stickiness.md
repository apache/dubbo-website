# 粘滞连接

粘滞连接用于有状态服务，尽可能让客户端总是向同一提供者发起调用，除非该提供者挂了，再连另一台。

粘滞连接将自动开启[延迟连接](./lazy-connect.md)，以减少长连接数。

```xml
<dubbo:protocol name="dubbo" sticky="true" />
```

