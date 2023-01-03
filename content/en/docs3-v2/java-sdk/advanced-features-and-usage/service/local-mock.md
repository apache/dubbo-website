---
type: docs
title: "Local Masquerade"
linkTitle: "Local camouflage"
weight: 10
description: "Learn how to use local masquerade to achieve service degradation in Dubbo3"
---

## Feature description

There is a mechanism in Dubbo3 to achieve lightweight service degradation, which is local masquerade[^1].

## scenes to be used

Local masquerading is often used for service degradation. For example, for a verification service, when all the service providers hang up, if the service consumer initiates a remote call at this time, the call will fail and an `RpcException` will be thrown.

In order to avoid such a situation where an exception is thrown directly, the client can use local masquerade to provide Mock data and return authorization failure.

## How to use

### Enable mock configuration

Configured in the following way in the Spring XML configuration file:

```xml
<dubbo:reference interface="com.foo.BarService" mock="true" />
```

or

```xml
<dubbo:reference interface="com.foo.BarService" mock="com.foo.BarServiceMock" />
```

Provide Mock implementation in the project [^2]:

```java
package com.foo;
public class BarServiceMock implements BarService {
    public String sayHello(String name) {
        // You can fake fault-tolerant data, this method is only executed when RpcException occurs
        return "fault tolerance data";
    }
}
```

### Use the return keyword to mock the return value

Use `return` to return an object represented by a string as the return value of the Mock. Legal strings can be:
- *empty*: stands for empty, returns the default value of the basic type, the empty value of the collection class, and the empty object of the custom entity class [^3]
- *null*: return `null`
- *true*: returns `true`
- *false*: return `false`
- *JSON string*: returns the object obtained after deserializing the JSON string

For example, if the consumer of the service often needs try-catch to catch exceptions, such as:

```java
public class DemoService {

    public Offer findOffer(String offerId) {
        Offer offer = null;
        try {
            offer = offerService. findOffer(offerId);
        } catch (RpcException e) {
            logger. error(e);
        }

        return offer;
    }
}
```

Then consider changing to a Mock implementation, and `return null` in the Mock implementation. If you just want to simply ignore exceptions, it is available in `2.0.11` and above:

```xml
<dubbo:reference interface="com.foo.BarService" mock="return null" />
```

### Use the throw keyword Mock to throw an exception

Use `throw` to return an Exception object as the return value of the Mock.

A default RPCException is thrown when the call fails:

```xml

<dubbo:reference interface="com.foo.BarService" mock="throw"/>
```

When an error occurs in the call, throw the specified Exception [^4]:

```xml

<dubbo:reference interface="com.foo.BarService" mock="throw com.foo.MockException"/>
```

### Use the force and fail keywords to configure the behavior of the Mock

`force:` means to force the use of Mock behavior, in which case no remote calls will be made.

`fail:` Consistent with the default behavior, the mock behavior is only used when an error occurs in the remote call. That is to say, it is actually possible not to use the `fail` keyword when configuring, but to use `throw` or `return` directly.

Both `force:` and `fail:` are supported in combination with `throw` or `return`.

Force a specified value to be returned:

```xml

<dubbo:reference interface="com.foo.BarService" mock="force:return fake"/>
```

Force the specified exception to be thrown:

```xml

<dubbo:reference interface="com.foo.BarService" mock="force:throw com.foo.MockException"/>
```

The specified value is returned when the call fails:
```xml

<dubbo:reference interface="com.foo.BarService" mock="fail:return fake"/>

<!-- Equivalent to the following writing -->
<dubbo:reference interface="com.foo.BarService" mock="return fake"/>
```

An exception is thrown when the call fails

```xml

<dubbo:reference interface="com.foo.BarService" mock="fail:throw com.foo.MockException"/>

<!-- Equivalent to the following writing -->
<dubbo:reference interface="com.foo.BarService" mock="throw com.foo.MockException"/>
```

### Configure Mock at method level

Mock can be specified at the method level, assuming there are several methods on `com.foo.BarService`, we can specify Mock behavior for the `sayHello()` method separately.

The specific configuration is as follows. In this example, whenever `sayHello()` is called, it is forced to return "fake":

```xml

<dubbo:reference id="demoService" check="false" interface="com.foo.BarService">
    <dubbo:parameter key="sayHello.mock" value="force:return fake"/>
</dubbo:reference>
```

## Precautions

[^1]: Mock is a subset of Stub, which is convenient for service providers to implement fault-tolerant logic on the client side. Because it is often necessary to perform fault-tolerant when RpcException (such as network failure, timeout, etc.) occurs, and when business exceptions (such as login Wrong username and password) does not require fault tolerance. If you use Stub, you may need to catch and rely on the RpcException class, but you can use Mock without relying on RpcException, because its agreement is to execute only when RpcException occurs.
[^2]: Next to the interface, put a Mock implementation that implements the BarService interface and has a no-argument constructor. At the same time, if the Mock class is not explicitly specified in the configuration file, then it is necessary to ensure that the fully qualified class name of the Mock class is in the form of `original fully qualified class name+Mock`, such as `com.foo.BarServiceMock`, otherwise it will be Mock will fail.
[^3]: If the return value is an entity class, then it will return an empty object with default values instead of `null`.
[^4]: Custom exceptions must have a constructor with `String` as the input parameter, which will be used to receive exception information.