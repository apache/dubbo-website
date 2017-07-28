> ![warning](../sources/images/check.gif)泛接口实现方式主要用于服务器端没有API接口及模型类元的情况，参数及返回值中的所有POJO均用Map表示，通常用于框架集成，比如：实现一个通用的远程服务Mock框架，可通过实现GenericService接口处理所有服务请求。

```xml
<bean id="genericService" class="com.foo.MyGenericService" />
<dubbo:service interface="com.foo.BarService" ref="genericService" />
```

```java
package com.foo;
public class MyGenericService implements GenericService {
 
    public Object $invoke(String methodName, String[] parameterTypes, Object[] args) throws GenericException {
        if ("sayHello".equals(methodName)) {
            return "Welcome " + args[0];
        }
    }
}
```

```java
... 
GenericService xxxService = new XxxGenericService(); // 用com.alibaba.dubbo.rpc.service.GenericService可以替代所有接口实现 
 
ServiceConfig<GenericService> service = new ServiceConfig<GenericService>(); // 该实例很重量，里面封装了所有与注册中心及服务提供方连接，请缓存
service.setInterface("com.xxx.XxxService"); // 弱类型接口名 
service.setVersion("1.0.0"); 
service.setRef(xxxService); // 指向一个通用服务实现 
 
// 暴露及注册服务 
service.export();
```
