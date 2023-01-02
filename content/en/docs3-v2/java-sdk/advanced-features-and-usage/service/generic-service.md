---
type: docs
linkTitle: "Generalized call"
title: "Achieving generalization (server-side generalization)"
weight: 17
description: "Implement a generic remote service Mock framework, which can handle all service requests by implementing the GenericService interface"
---
## Feature description
The universal interface implementation method is mainly used when there is no API interface and model classifier on the server side. All POJOs in the parameters and return values are represented by Map, which is usually used for framework integration. For example, to implement a general remote service Mock framework, you can All service requests are handled by implementing the GenericService interface.

## scenes to be used

## How to use
Implement the `GenericService` interface in Java code

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

### Exposing generic implementations via Spring

Declare the implementation of the service in the Spring configuration

```xml
<bean id="genericService" class="com. foo. MyGenericService" />
<dubbo:service interface="com.foo.BarService" ref="genericService" />
```

### Expose the generalization implementation through the API

```java
...
// Use org.apache.dubbo.rpc.service.GenericService to replace all interface implementations
GenericService xxxService = new XxxGenericService();

// This instance is very heavy, and it encapsulates all connections with the registry and service providers, please cache
ServiceConfig<GenericService> service = new ServiceConfig<GenericService>();
// Weakly typed interface name
service.setInterface("com.xxx.XxxService");
service.setVersion("1.0.0");
// point to a generic service implementation
service.setRef(xxxService);
 
// expose and register services
service. export();
```