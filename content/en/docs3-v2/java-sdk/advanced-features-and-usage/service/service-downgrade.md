---
type: docs
title: "Service Downgrade"
linkTitle: "Service Downgrade"
weight: 3
description: "Downgrade Dubbo service"
---

## Feature description
It is recommended to use relevant current limiting and downgrading components (such as [Sentinel](https://sentinelguard.io/zh-cn/docs/open-source-framework-integrations.html)) to achieve the best experience. Reference example practice: [Microservice Governance/Limit and Downgrade](/zh-cn/overview/tasks/ecosystem/rate-limit/)

Service degradation refers to the emergency treatment of service degradation under abnormal circumstances.

## scenes to be used

- When the load of a certain service or interface exceeds the maximum carrying capacity range, downgrade emergency treatment is required to avoid system crash
- When a non-critical service or interface called is temporarily unavailable, simulated data or null is returned, and the business can continue to be available
- Downgrade non-core business services or interfaces, free up system resources, and try to ensure the normal operation of core business
- When an upstream basic service times out or is unavailable, execute a downgrade plan that can respond quickly to avoid the overall avalanche of services

## How to use

Take xml configuration as an example: (configuration through annotations is similar)

### 1. Configure `mock="true"`
example:
```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="true" />
```
This method requires an implementation class with the class name + `Mock` suffix under the same package, that is, there is a `DemoServiceMock` class under the `com.xxx.service` package.

### 2. Configure `mock="com.xxx.service.DemoServiceMock"`
example:
```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="com.xxx.service.DemoServiceMock" />
```
This method specifies the full path of the Mock class.

### 3. Configure `mock="[fail|force]return|throw xxx"`

* The fail or force keyword is optional, indicating that the call fails or does not call to enforce the mock method, if no keyword is specified, the default is fail
* return indicates the specified return result, and throw indicates that the specified exception is thrown
* xxx is parsed according to the return type of the interface, you can specify the return value or throw a custom exception

example:
```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="return" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="return null" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="fail:return aaa" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="force:return true" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="fail:throw" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="force:throw java.lang.NullPointException" />
```

### 4. Use with dubbo-admin

* Introduce <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-mock-extensions" target="_blank">`dubbo-mock-admin`< /a>dependency

* Set the JVM parameters when the application consumer starts, `-Denable.dubbo.admin.mock=true`

* Start dubbo-admin, set the Mock rule under the service Mock->rule configuration menu

Set rules in the dimension of service methods, set return mock data, and dynamically enable/disable rules

## Precautions

When Dubbo starts, it will check the configuration. When the configuration of the mock attribute value is wrong, it will fail to start. You can troubleshoot according to the error message

- The configuration format is wrong, such as `return+null` will report an error, and it will be treated as a mock type. `return` can be omitted or followed by a space followed by the return value

- Type not found error, such as custom mock class, throw custom exception, please check if the type exists or if there is a typo