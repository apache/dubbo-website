---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/local-stub/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/local-stub/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/local-stub/
description: Understand the use of local stubs executing part of the logic on the client side in Dubbo
linkTitle: Local Stub
title: Local Stub
type: docs
weight: 11
---

## Feature Description:

After invoking a remote service, the client typically only has the interface, while the implementation resides entirely on the server. However, sometimes the provider wants to execute part of the logic on the client side as well.

![/user-guide/images/stub.jpg](/imgs/user/stub.jpg)

## Usage Scenarios
For scenarios such as creating ThreadLocal caches, validating parameters in advance, or simulating fault tolerance data after a failed call, the API needs to have a Stub. The client generates a Proxy instance, which is passed to the Stub through the constructor [^1], and then the Stub is exposed to the user. The Stub can decide whether to invoke the Proxy.

## Usage Method

For complete example source code, please refer to [dubbo-samples-stub](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-stub)

### Spring Configuration File

```xml
<dubbo:consumer interface="com.foo.BarService" stub="true" />
```

or

```xml
<dubbo:consumer interface="com.foo.BarService" stub="com.foo.BarServiceStub" />
```

### Providing Stub Implementation [^2]

```java
package com.foo;
public class BarServiceStub implements BarService {
    private final BarService barService;
    
    // Constructor takes in the real remote proxy object
    public BarServiceStub(BarService barService){
        this.barService = barService;
    }
 
    public String sayHello(String name) {
        // This code runs on the client; you can create ThreadLocal local caches or validate parameters
        try {
            return barService.sayHello(name);
        } catch (Exception e) {
            // You can provide fault tolerance; perform any AOP interception here
            return "Fault tolerance data";
        }
    }
}
```

[^1]: The Stub must have a constructor that accepts a Proxy.
[^2]: Place a Stub implementation next to the interface that implements the BarService interface and has a constructor that accepts the remote BarService instance.

