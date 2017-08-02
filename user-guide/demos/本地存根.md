> ![warning](../sources/images/check.gif)远程服务后，客户端通常只剩下接口，而实现全在服务器端，但提供方有些时候想在客户端也执行部分逻辑，比如：做ThreadLocal缓存，提前验证参数，调用失败后伪造容错数据等等，此时就需要在API中带上Stub，客户端生成Proxy实例，会把Proxy通过构造函数传给Stub，然后把Stub暴露组给用户，Stub可以决定要不要去调Proxy。

> ![warning](../sources/images/warning-3.gif)Stub必须有可传入Proxy的构造函数。


![/user-guide/images/stub.jpg](../sources/images/stub.jpg)

```xml
<dubbo:service interface="com.foo.BarService" stub="true" />
```

或

```xml
<dubbo:service interface="com.foo.BarService" stub="com.foo.BarServiceStub" />
```

api.jar:

```sh
com.foo.BarService
com.foo.BarServiceStub // 在API旁边放一个Stub实现，它实现BarService接口，并有一个传入远程BarService实例的构造函数
```

```java
package com.foo;
public class BarServiceStub implements BarService {
 
    private final BarService barService;
 
    // 构造函数传入真正的远程代理对象
    public (BarService barService) {
        this.barService = barService;
    }
 
    public String sayHello(String name) {
        // 此代码在客户端执行
        // 你可以在客户端做ThreadLocal本地缓存，或预先验证参数是否合法，等等
        try {
            return barService.sayHello(name);
        } catch (Exception e) {
            // 你可以容错，可以做任何AOP拦截事项
            return "容错数据";
        }
    }
}
```
