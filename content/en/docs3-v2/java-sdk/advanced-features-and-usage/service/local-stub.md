---
type: docs
title: "Local Stub"
linkTitle: "Local Stub"
weight: 11
description: "Understand the use of local stubs in Dubbo3 to execute part of the logic on the client"
---
## Feature description:

After the remote service, the client usually only has the interface, and the implementation is all on the server side, but the provider sometimes wants to execute some logic on the client side.

![/user-guide/images/stub.jpg](/imgs/user/stub.jpg)

## scenes to be used
Do ThreadLocal cache, verify parameters in advance, forge fault-tolerant data after call failure, etc. At this time, you need to bring a Stub in the API, and the client generates a Proxy instance, which will pass the Proxy to the Stub through the constructor [^1], and then pass the The Stub is exposed to the user, and the Stub can decide whether to call the Proxy.

## How to use
### spring configuration file configuration

```xml
<dubbo:consumer interface="com.foo.BarService" stub="true" />
```

or

```xml
<dubbo:consumer interface="com.foo.BarService" stub="com.foo.BarServiceStub" />
```

### Provide Stub implementation [^2]

```java
package com.foo;
public class BarServiceStub implements BarService {
    private final BarService barService;
    
    // The constructor passes in the real remote proxy object
    public BarServiceStub(BarService barService){
        this. barService = barService;
    }
 
    public String sayHello(String name) {
        // This code is executed on the client side, you can do ThreadLocal local cache on the client side, or pre-verify whether the parameters are legal, etc.
        try {
            return barService.sayHello(name);
        } catch (Exception e) {
            // You are fault tolerant and can do any AOP interception
            return "fault tolerance data";
        }
    }
}
```

[^1]: Stub must have a constructor that can be passed to Proxy.
[^2]: Next to the interface put a Stub implementation that implements the BarService interface and has a constructor that passes in the remote BarService instance.