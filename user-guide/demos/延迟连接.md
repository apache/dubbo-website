> ![warning](../sources/images/check.gif)延迟连接，用于减少长连接数，当有调用发起时，再创建长连接。

> ![warning](../sources/images/warning-3.gif)只对使用长连接的dubbo协议生效。

```xml
<dubbo:protocol name="dubbo" lazy="true" />
```
