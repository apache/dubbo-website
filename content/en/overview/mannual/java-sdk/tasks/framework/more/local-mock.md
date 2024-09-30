---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/local-mock/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/local-mock/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/service-downgrade/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/service-downgrade/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/local-mock/
description: Learn how to achieve service downgrade using local mocking in Dubbo
linkTitle: Service Downgrade
title: Service Explanation (Local Mock)
type: docs
weight: 10
---

## Feature Description

In Dubbo3, there is a mechanism for lightweight service downgrading, that is, local mocking.

Mock is a subset of Stub, facilitating service providers to implement fault tolerance logic on the client side. It is often necessary to handle exceptions during `RpcException` (e.g., network failures, timeouts), while fault tolerance is not needed for business exceptions (e.g., login username/password errors). Using Stub may require capturing and depending on `RpcException`, whereas Mock does not, since its agreement is to only execute when `RpcException` occurs.

## Usage Scenarios

Local mocking is often used for service downgrading. For example, if an authentication service is completely down, and a service consumer initiates a remote call, this call will fail and throw an `RpcException`. To avoid such situations where exceptions are directly thrown, the client can use local mocking to return mock data indicating authorization failure.

Other usage scenarios include:
- When a service or interface exceeds its maximum load, needing emergency downgrade processing to prevent system crashes.
- When a non-critical service or interface is temporarily unavailable, returning mock data or empty, allowing the business to remain operational.
- Downgrading non-core business services or interfaces to free up system resources, ensuring core business operations run normally.
- When an upstream foundational service times out or is unavailable, executing a rapid response downgrade plan to avoid an overall service avalanche.

## Usage Method

For complete example source code, please refer to [dubbo-samples-mock](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-mock)

### Enable Mock Configuration

In the Spring XML configuration file, configure as follows:

```xml
<dubbo:reference interface="com.foo.BarService" mock="true" />
```

or

```xml
<dubbo:reference interface="com.foo.BarService" mock="com.foo.BarServiceMock" />
```

Provide Mock implementation in the project [^2]:
Place a Mock implementation next to the interface that implements the BarService interface and has a no-argument constructor. If the Mock class is not explicitly specified in the configuration file, ensure the fully qualified class name of the Mock class is in the form of `original qualified class name + Mock`, e.g., `com.foo.BarServiceMock`, otherwise the Mock will fail.
```java
package com.foo;
public class BarServiceMock implements BarService {
    public String sayHello(String name) {
        // You can fabricate fault tolerance data; this method is only executed if RpcException occurs
        return "Fault Tolerance Data";
    }
}
```

### Use return Keyword to Mock Return Value 

Use `return` to return a string representation of an object as the Mock return value. Valid strings can include:
- *empty*: Represents empty, returning the default value for primitive types, empty for collections, or an empty object for custom entity classes. If the return value is an entity class, it will return an object with all properties set to default values instead of `null`.
- *null*: Returns `null`
- *true*: Returns `true`
- *false*: Returns `false`
- *JSON String*: Returns the object obtained after deserializing the JSON string

For example, if the service consumer frequently needs to try-catch exceptions, like:

```java
public class DemoService {

    public Offer findOffer(String offerId) {
        Offer offer = null;
        try {
            offer = offerService.findOffer(offerId);
        } catch (RpcException e) {
            logger.error(e);
        }

        return offer;
    }
}
```

Consider changing this to a Mock implementation and returning `null` in the Mock implementation. If you simply want to ignore the exception, in versions `2.0.11` and above, you can use:

```xml
<dubbo:reference interface="com.foo.BarService" mock="return null" />
```

### Use throw Keyword to Mock Throw Exceptions

Use `throw` to return an Exception object as the Mock return value.

When an error occurs during the call, throw a default `RPCException`:

```xml

<dubbo:reference interface="com.foo.BarService" mock="throw"/>
```

When an error occurs during the call, throw a specified Exception:

Custom exceptions must have a constructor with a `String` parameter that will be used to accept the exception message.
```xml

<dubbo:reference interface="com.foo.BarService" mock="throw com.foo.MockException"/>
```

### Use force and fail Keywords to Configure Mock Behavior

`force:` represents enforcing the use of Mock behavior, in which case remote calls will not be made.

`fail:` behaves as default, only using Mock behavior when remote calls fail. That is, it is possible not to use the `fail` keyword in the configuration, directly using `throw` or `return`.

`force:` and `fail:` can both be combined with `throw` or `return`.

Force returning a specified value:

```xml

<dubbo:reference interface="com.foo.BarService" mock="force:return fake"/>
```

Force throwing a specified exception:

```xml

<dubbo:reference interface="com.foo.BarService" mock="force:throw com.foo.MockException"/>
```

Return a specified value on call failure:
```xml

<dubbo:reference interface="com.foo.BarService" mock="fail:return fake"/>

<!-- Equivalent to the following -->
<dubbo:reference interface="com.foo.BarService" mock="return fake"/>
```

Throw an exception on call failure

```xml

<dubbo:reference interface="com.foo.BarService" mock="fail:throw com.foo.MockException"/>

<!-- Equivalent to the following -->
<dubbo:reference interface="com.foo.BarService" mock="throw com.foo.MockException"/>
```

### Configure Mock at the Method Level

Mock can be specified at the method level. Assume `com.foo.BarService` has several methods; we can specifically set Mock behavior for the `sayHello()` method.

The specific configuration is as follows. In this example, whenever `sayHello()` is called, it will force a return of "fake":

```xml

<dubbo:reference id="demoService" check="false" interface="com.foo.BarService">
    <dubbo:parameter key="sayHello.mock" value="force:return fake"/>
</dubbo:reference>
```

### Use with dubbo-admin

* Application consumer side introduce <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-mock-extensions" target="_blank">`dubbo-mock-admin`</a> dependency

* Set the JVM parameter when the application consumer starts: `-Denable.dubbo.admin.mock=true`

* Start dubbo-admin and set the Mock rules under the service Mock -> Rule Configuration menu

Set rules at the level of service methods, dynamically enabling/disabling rules that return mock data


### Use Professional Rate Limiting Components

If you have more advanced and professional rate-limiting requirements, we recommend using professional rate limiting and downgrading components such as [Sentinel](https://sentinelguard.io/zh-cn/docs/open-source-framework-integrations.html) for the best experience. Refer to example practices: [Microservices Governance/Rate Limiting and Downgrading](/en/overview/mannual/java-sdk/tasks/rate-limit/)

Service downgrading refers to emergency handling of services under abnormal conditions.


{{% alert title="Notes" color="primary" %}}

Dubbo will check the configuration at startup, and if the mock property value is misconfigured, the startup will fail. You can troubleshoot based on the error message.

- Configuration format errors, such as `return+null`, will cause errors and be treated as mock types. The text after `return` can be omitted or followed by the return value after a space.
- Type not found errors, such as custom mock classes or throwing custom exceptions, please check whether the types exist or if there are spelling errors.
{{% /alert %}}

