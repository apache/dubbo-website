---
type: docs
title: "json generic invoke"
linkTitle: "json generic invoke"
weight: 15
description: "support generic invoke of json string parameters"
---

{{% alert title="Notice" color="primary" %}}
support on `2.7.12` or above.
{{% /alert %}}

A new method is provided for Dubbo generic invoke: directly passing on String to complete an invoke. In other words, users can directly pass on
parameter object's json String to complete a generic invoke. 

## Using generic invoke through API method

For the following providers:

```java
public User setUser(User user) {
        return user;
    }
```

do one generic invoke:

```java
public class GenericInvoke {
    public static void main(String[] args) {
        ApplicationConfig app = new ApplicationConfig("ConsumerTest");
        RegistryConfig reg = new RegistryConfig("nacos://localhost:8848");
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(app);
        bootstrap.registry(reg);
        bootstrap.start();
            try {
                // config remote service
                ReferenceConfig<GenericService> reference = new ReferenceConfig<>();
                // name of the weakly typed interface    
                reference.setInterface("com.xxx.api.service.TestService");
                reference.setGroup("dev");
                reference.setVersion("1.0");
                reference.setRetries(0);
                // set generic=gson in RpcContext
                RpcContext.getContext().setAttachment("generic","gson");
                // declare the interface to be generic
                reference.setGeneric(true);
                reference.setCheck(false);
                GenericService genericService = ReferenceConfigCache.getCache().get(reference);
                // pass on parameter object's json String for an invoke
                Object res = genericService.$invoke("setUser", new String[]{"com.xxx.api.service.User"}, new Object[]{"{'name':'Tom','age':24}"});
                System.out.println("result[setUser]："+res); // response output:result[setUser]：{name=Tom, class=com.xxx.api.service.User, age=24}
            } catch (Throwable ex) {
                ex.printStackTrace();
            }
    }
}
```
