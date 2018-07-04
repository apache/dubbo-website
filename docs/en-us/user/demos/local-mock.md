# Local mock

Local mock [^1] is usually used for service downgrade, such as a verification service, the client does not throw an exception when the service provider hangs up all the time, but returns the authorization failed through the Mock data.

Configured in the spring configuration file as follows:

```xml
<dubbo:reference interface="com.foo.BarService" mock="true" />
```

or

```xml
<dubbo:reference interface="com.foo.BarService" mock="com.foo.BarServiceMock" />
```

Mock implementation in the project [^2]：

```java
package com.foo;
public class BarServiceMock implements BarService {
    public String sayHello(String name) {
        // You can return mock data, this method is only executed when an RpcException is thrown.
        return "mock data";
    }
}
```

If the service consumer often needs `try-catch` to catch exceptions, such as:

```java
Offer offer = null;
try {
    offer = offerService.findOffer(offerId);
} catch (RpcException e) {
   logger.error(e);
}
```

Consider changing to Mock implementation and return null in Mock implementation. If you just want to simply ignore the exception, `2.0.11` version or later version is available:

```xml
<dubbo:reference interface="com.foo.BarService" mock="return null" />
```

[^1]: Mock is a subset of the Stub. If you use Stub, you may need to rely on the RpcException class. If you use Mock, you do not need to rely on RpcException, when throwing RpcException, it will callback Mock implementation class.
[^2]: BarServiceMock implements BarService and has a no-argument constructor.
