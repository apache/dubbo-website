# Local stub

When using rpc, the client usually only the interface, but sometimes the client also want to perform part of the logic in the client. For example: do ThreadLocal cache, verify parameters, return mock data when call fails., etc.

To solve this problem, you can configure the stub in the API, so that when the client generates the proxy instance, it passes the proxy to the `Stub` via the constructor [^1], and then you can implement your logic in the stub implementation code.


![/user-guide/images/stub.jpg](../sources/images/stub.jpg)

Configured in the spring configuration file as follows:

```xml
<dubbo:service interface="com.foo.BarService" stub="true" />
```

or

```xml
<dubbo:service interface="com.foo.BarService" stub="com.foo.BarServiceStub" />
```

Provide Stub implementation [^2]：

```java
package com.foo;
public class BarServiceStub implements BarService {
    private final BarService barService;

    // The real remote proxy object is passed in through the constructor
    public (BarService barService) {
        this.barService = barService;
    }

    public String sayHello(String name) {
        // The following code is executed on the client. You can do local ThreadLocal caching on the client side, or verify parameters, etc.
        try {
            return barService.sayHello(name);
        } catch (Exception e) {
            // You can return the mock data.
            return "MockData";
        }
    }
}
```

[^1]: The Stub must have a constructor that can pass in the proxy.
[^2]: BarServiceStub implements BarService ，it has a constructor passed in the remote BarService instance
