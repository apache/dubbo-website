# 延迟连接

延迟连接用于减少长连接数。当有调用发起时，再创建长连接。[^1]

```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

[^1]: 注意：该配置只对使用长连接的 dubbo 协议生效。
