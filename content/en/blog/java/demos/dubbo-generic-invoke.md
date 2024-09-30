---
title: "Dubbo Generic Invocation"
linkTitle: "Dubbo Generic Invocation"
tags: ["Java"]
date: 2018-08-14
description: > 
    This article introduces the scenarios for using Dubbo generic invocation and related examples
---


The following scenarios can consider using generic invocation:

- Service testing platform
- API service gateway

Generic invocation is mainly used in cases where the consumer side does not have an API interface; it does not require the introduction of an interface jar package but directly initiates a service call through the GenericService interface, with all POJOs in the parameters and return values represented as `Map`. The server does not need to concern itself with generic invocation and can expose services as usual.

Let's see how the consumer side uses generic invocation to make a service call.

## Generic Invocation through Spring XML Configuration

In the Spring configuration, declare `generic="true"`, for example:

```xml
<dubbo:reference id="userService" interface="com.alibaba.dubbo.samples.generic.api.IUserService" generic="true"/>
```

When needed, call it by forcing the type conversion to GenericService:

```java
GenericService userService = (GenericService) context.getBean("userService");
// primary param and return value
String name = (String) userService.$invoke("delete", new String[]{int.class.getName()}, new Object[]{1});
System.out.println(name);
```

Where:

1. The GenericService interface only has one method called `$invoke`, which takes three parameters: method name, method parameter types array, and parameter values array;
2. For the method parameter types array
   1. If it is a primitive type, like int or long, you can use `int.class.getName()` to get its type;
   2. If it is a primitive type array, like int[], use `int[].class.getName()`;
   3. If it is a POJO, directly use the fully qualified name, such as `com.alibaba.dubbo.samples.generic.api.Params`.

## Generic Invocation through API Programming

```
ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-consumer");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// Weak type interface name
reference.setInterface("com.alibaba.dubbo.samples.generic.api.IUserService");
// Declare as a generic interface
reference.setGeneric(true);

reference.setApplication(application);

// Use com.alibaba.dubbo.rpc.service.GenericService to replace all interface references
GenericService genericService = reference.get();

String name = (String) genericService.$invoke("delete", new String[]{int.class.getName()}, new Object[]{1});
System.out.println(name);
```

Using the API approach, there is no need to pre-configure services like in XML, allowing dynamic construction of ReferenceConfig; compared to XML, the API approach is more common.

## Scenarios where parameters or return values are POJOs

For example, if the method signature is `User get(Params params);` where User has attributes id and name, and Params has attribute query.

Here is the calling code on the consumer side:

```java
String[] parameterTypes = new String[]{"com.alibaba.dubbo.samples.generic.api.Params"};
Map<String, Object> params = new HashMap<String, Object>();
param.put("class", "com.alibaba.dubbo.samples.generic.api.Params");
param.put("query", "a=b");
Object user = userService.$invoke("get", parameterTypes, new Object[]{param});
System.out.println("sample one result: " + user);
```

The output of the above code is:

```shell
sample one result: {name=charles, id=1, class=com.alibaba.dubbo.samples.generic.api.User}
```

Here, the Dubbo framework automatically converts the return value of the POJO into a Map. It can be seen that the return value `user` is a HashMap, which stores name, id, and class as three k/v pairs.

#### Generic Interface Implementation

The implementation of the generic interface is mainly used in cases where the server does not have API interfaces, with all POJOs in parameters and return values represented as Map, typically used for framework integration, such as implementing a generic remote service mock framework that can handle all service requests by implementing the GenericService interface.

### Server Implementation of GenericService

```java
public class GenericServiceImpl implements GenericService {
    @Override
    public Object $invoke(String method, String[] parameterTypes, Object[] args) throws GenericException {
        if (method.equals("hi")) {
            return "hi, " + args[0];
        } else if (method.equals("hello")) {
            return "hello, " + args[0];
        }

        return "welcome";
    }
}
```

### Server Exposing Services

```java
ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-provider");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

GenericService genericService = new GenericServiceImpl();

ServiceConfig<GenericService> service = new ServiceConfig<GenericService>();
service.setApplication(application);
service.setInterface("com.alibaba.dubbo.samples.generic.api.HelloService");
service.setRef(genericService);
service.export();

ServiceConfig<GenericService> service2 = new ServiceConfig<GenericService>();
service2.setApplication(application);
service2.setInterface("com.alibaba.dubbo.samples.generic.api.HiService");
service2.setRef(genericService);
service2.export();
```

Similarly, services can also be exposed using XML configuration; at this time, the server does not depend on the HiService and HelloService interfaces.

### Consumer Side Service Call

```java
ApplicationConfig application = new ApplicationConfig();
application.setName("api-generic-consumer");

RegistryConfig registry = new RegistryConfig();
registry.setAddress("zookeeper://127.0.0.1:2181");

application.setRegistry(registry);

ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// Weak type interface name
reference.setInterface(HiService.class);
reference.setApplication(application);

HiService hiService = (HiService) reference.get();
System.out.println(hiService.hi("dubbo"));

ReferenceConfig<GenericService> reference2 = new ReferenceConfig<GenericService>();
// Weak type interface name
reference2.setInterface(HelloService.class);
reference2.setApplication(application);

HelloService helloService = (HelloService) reference2.get();
System.out.println(helloService.hello("community"));
```

Similarly, the consumer side can also use XML configuration to reference services and then make calls. Here, the calling method is ordinary service calling, not generic invoking. Of course, using generic invocation is also possible.

At this point, a simple service mock platform is successfully launched!

## Others

* The generic invocation and generic interface implementations introduced in this article are built on the native `Dubbo` protocol. In versions before 2.6.2, other protocols such as http/hessian did not support generic invocation; version 2.6.3 will add support for generic invocation for these two protocols.
* The relevant example code mentioned in this article can be found in dubbo-samples: https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-generic
