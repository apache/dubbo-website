> ![warning](../sources/images/check.gif)Mock通常用于服务降级，比如某验权服务，当服务提供方全部挂掉后，客户端不抛出异常，而是通过Mock数据返回授权失败。

> ![warning](../sources/images/check.gif)Mock是Stub的一个子集，便于服务提供方在客户端执行容错逻辑，因经常需要在出现RpcException(比如网络失败，超时等)时进行容错，而在出现业务异常(比如登录用户名密码错误)时不需要容错，如果用Stub，可能就需要捕获并依赖RpcException类，而用Mock就可以不依赖RpcException，因为它的约定就是只有出现RpcException时才执行。

```xml
<dubbo:service interface="com.foo.BarService" mock="true" />
```

或

```xml
<dubbo:service interface="com.foo.BarService" mock="com.foo.BarServiceMock" />
```

api.jar:

```sh
com.foo.BarService
com.foo.BarServiceMock // 在API旁边放一个Mock实现，它实现BarService接口，并有一个无参构造函数
```

```java
package com.foo;
public class BarServiceMock implements BarService {
 
    public String sayHello(String name) {
        // 你可以伪造容错数据，此方法只在出现RpcException时被执行
        return "容错数据";
    }
}
```

如果服务的消费方经常需要try-catch捕获异常，如：

```java
Offer offer = null;
try {
    offer = offerService.findOffer(offerId);
} catch (RpcException e) {
   logger.error(e);
}
```

请考虑改为Mock实现，并在Mock中return null。

如果只是想简单的忽略异常，在2.0.11以上版本可用：

```xml
<dubbo:service interface="com.foo.BarService" mock="return null" />
```
