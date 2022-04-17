---
type: docs
title: "Local Mock"
linkTitle: "Local Mock"
weight: 26
description: "Local mock in dubbo"
---

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

## Advanced Usage

### return

`return` can be used to return an object's string representation as the mocked return value. The legal values incude:
* *empty*: empty value, default value for primary type, and empty value for collections.
* *null*: `null`
* *true*: `true`
* *false*: `false`
* *JSON format*: a mocked return value in JSON format, will be deserialized at runtime 

### throw

`throw` can be used to throw an exception object as the mocked return value. 

Throw a default RPCException when invocation gets wrong:

```xml
<dubbo:reference interface="com.foo.BarService" mock="throw" />
```

Throw a specified exception when invocation gets wrong:

```xml
<dubbo:reference interface="com.foo.BarService" mock="throw com.foo.MockException" />
```

### force & fail

Since `2.6.6` and above, it is possible to use `fail:` and `force:` in Spring's XML configuration to define mock behavior. `force:` means the mocked value is forced to use no matter the invocation gets wrong or not, in fact, the remote invocation will not happen at all. `fail:` is consistent with the default behavior, that is, mock happens only when invocation gets wrong. Futhermore, both `force:` and `fail:` can be used together with `throw` or `return` to define the mock behavior further.

Force to return the specified value:

```xml
<dubbo:reference interface="com.foo.BarService" mock="force:return fake" />
```

Force to throw the specified exception:

```xml
<dubbo:reference interface="com.foo.BarService" mock="force:throw com.foo.MockException" />
```

### Specify Mock For Particular Method Only

Mock behavior can be specified on the method level. Assume there are a couple of methods on `com.foo.BarService`, we can specify the mock behavior for one particular method only, say `sayHello()`. In the example below, "fake" is forced to return everytime when `sayHello()` is called, but other methods will not be effected:

```xml
<dubbo:reference id="demoService" check="false" interface="com.foo.BarService">
    <dubbo:parameter key="sayHello.mock" value="force:return fake"/>
</dubbo:reference>
```

[^1]: Mock is a subset of the Stub. If you use Stub, you may need to rely on the RpcException class. If you use Mock, you do not need to rely on RpcException, when throwing RpcException, it will callback Mock implementation class.
[^2]: BarServiceMock implements BarService and has a no-argument constructor.
