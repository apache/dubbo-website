> ![warning](../sources/images/warning-3.gif) 注：path,group,version,dubbo,token,timeout几个key有特殊处理，请使用其它key值。

![/user-guide/images/context.png](../sources/images/context.png)

##### (1) 服务消费方

```xml
RpcContext.getContext().setAttachment("index", "1"); // 隐式传参，后面的远程调用都会隐式将这些参数发送到服务器端，类似cookie，用于框架集成，不建议常规业务使用
xxxService.xxx(); // 远程调用
// ...
```

> 注: setAttachment设置的KV，在完成下面一次远程调用会被清空。即多次远程调用要多次设置。

##### (2) 服务提供方

```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() { // 服务方法实现
        String index = RpcContext.getContext().getAttachment("index"); // 获取客户端隐式传入的参数，用于框架集成，不建议常规业务使用
        // ...
    }
}
```