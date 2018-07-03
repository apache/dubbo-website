# Generic Service

The implementation of the generic interface is mainly used when there is no API interface and model class on the server side. All POJOs in the parameters and return values are represented by the Map and are usually used for framework integration. For example, to implement a universal remote service Mock framework, handle all service requests by implementing the GenericService interface.

In Java code, implement `GenericService` interface：

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

## Export generic implements via Spring

Declared in the Spring configuration file：

```xml
<bean id="genericService" class="com.foo.MyGenericService" />
<dubbo:service interface="com.foo.BarService" ref="genericService" />
```

## Export generic implements via API

```java
...
// use com.alibaba.dubbo.rpc.service.GenericService can replace all implements
GenericService xxxService = new XxxGenericService();

// The instance is very heavy, which encapsulates all the registration center and service provider connection, please cache
ServiceConfig<GenericService> service = new ServiceConfig<GenericService>();
// weak type service interface name
service.setInterface("com.xxx.XxxService");  
service.setVersion("1.0.0");
// point to a generic serivce instance
service.setRef(xxxService);

// export service to registration center
service.export();
```
