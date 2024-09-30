---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/concurrency-control/
description: Concurrency control in Dubbo
linkTitle: Concurrency Control
title: Concurrency Control
type: docs
weight: 28
---


## Function Description
Multiple concurrency control features help users manage their applications and services.

## Use Cases
Limit the number of concurrent requests from the same client to the same service, preventing malicious requests from overloading the server, ensuring service stability, and preventing excessive resource usage.

Control the maximum number of concurrent requests for certain services, ensuring the availability of resources for other services. System overload and ensuring system stability.

Allow for smoother scaling of services when demand increases.

Ensure services remain reliable and stable during peak usage times.

This method requires users to accurately evaluate in advance the concurrency level the system can handle, and accurately assessing system capacity is not an easy task. Therefore, Dubbo also provides an adaptive flow control mode that automatically identifies system health based on system load and implements flow control protection. You can [view the documentation here](../adaptive-concurrency-control).

## Usage
### Example 1

> Limit each method of `com.foo.BarService`, with no more than 10 concurrent executions (or occupied thread pool threads) on the server side.

```xml
<dubbo:service interface="com.foo.BarService" executes="10" />
```

### Example 2

> Limit the `sayHello` method of `com.foo.BarService`, with no more than 10 concurrent executions (or occupied thread pool threads) on the server side.

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" executes="10" />
</dubbo:service>
```
### Example 3

> Limit each method of `com.foo.BarService`, with no more than 10 concurrent executions (or occupied connection requests) per client.

```xml
<dubbo:service interface="com.foo.BarService" actives="10" />
```

**Or**

```xml
<dubbo:reference interface="com.foo.BarService" actives="10" />
```

### Example 4

> Limit the `sayHello` method of `com.foo.BarService`, with no more than 10 concurrent executions (or occupied connection requests) per client.

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

or

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

> If both `<dubbo:service>` and `<dubbo:reference>` are configured with actives, the `<dubbo:reference>` takes precedence. See: [Configuration Overriding Policy](/en/overview/mannual/java-sdk/reference-manual/config/principle/) .

### Load Balance

Configure the `loadbalance` attribute of the service's client to `leastactive`, which will call the Provider with the smallest number of concurrent requests (on the Consumer side).

```xml
<dubbo:reference interface="com.foo.BarService" loadbalance="leastactive" />
```

**Or**

```xml
<dubbo:service interface="com.foo.BarService" loadbalance="leastactive" />
```

