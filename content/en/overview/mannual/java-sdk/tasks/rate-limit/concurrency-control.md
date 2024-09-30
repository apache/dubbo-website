---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/concurrency-control/
description: "Dubbo framework's built-in concurrent control or rate limiting strategy prevents malicious requests from overloading the server by limiting the number of concurrent requests from the same client to the same service, ensuring service stability and preventing excessive resource usage."
linkTitle: Built-in Rate Limiting
title: Dubbo Framework's Built-in Concurrent Control Strategy
type: docs
weight: 2
---

Dubbo has implemented a built-in concurrency control strategy through the Filter interceptor mechanism. It limits the number of concurrent requests from the same client to the same service, preventing malicious requests from overloading the server, ensuring service stability, and preventing excessive resource usage.

* Control the maximum concurrent requests for certain services to ensure the availability of resources for other services. Prevent system overload and ensure system stability.
* Allow for smoother service scaling when demand increases.
* Ensure service reliability and stability during peak usage times.

{{% alert title="Note" color="warning" %}}
This method requires users to accurately pre-assess the number of concurrent requests the system can handle, and accurately determining system capabilities is not an easy task. Therefore, Dubbo also provides an adaptive rate limiting mode, which automatically identifies system health based on system load and provides rate limiting protection. You can view the [adaptive rate limiting mode documentation](../adaptive-concurrency-control) here.
{{% /alert %}}

## Rate Limiting Strategy Configuration
### Limit Server-Side Concurrent Execution (Service Granularity)

Limit the concurrent execution (or occupied thread pool threads) for each method of `com.foo.BarService` to a maximum of 10.

XML format:
```xml
<dubbo:service interface="com.foo.BarService" executes="10" />
```

Annotation format:
```java
@DubboService(executes=10)
private DemoServiceImpl implements DemoService{}
```

### Limit Server-Side Concurrent Execution (Method Granularity)

Limit the `sayHello` method of `com.foo.BarService` to a maximum of 10 concurrent executions (or occupied thread pool threads).

XML format:
```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" executes="10" />
</dubbo:service>
```

Annotation format:
```java
@DubboService(executes=10, methods = {@Method(name="sayHello",executes=10)})
private DemoServiceImpl implements DemoService{}
```

### Limit Consumer-Side Concurrent Calls (Service Granularity)

Limit the concurrent execution (or occupied connection requests) for each method of `com.foo.BarService` to a maximum of 10 per client.

XML format:
```xml
<dubbo:service interface="com.foo.BarService" actives="10" />
```

Annotation format:
```java
@DubboReference(actives=10)
private DemoService demoService;
```

### Limit Consumer-Side Concurrent Calls (Method Granularity)

Limit the `sayHello` method of `com.foo.BarService` to a maximum of 10 concurrent executions (or occupied connection requests) per client.

XML format:
```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

Annotation format:
```java
@DubboReference(actives=10, methods = {@Method(name="sayHello",executes=10)})
private DemoService demoService;
```

> If both the provider `@DubboService` and the consumer `@DubboReference` are configured with actives, the consumer's configuration value takes precedence. See: [Configuration Override Strategy](https://dubbo.apache.org/zh-cn/overview/mannual/java-sdk/reference-manual/config/principle/) .

## Minimum Concurrent Load Balancing

Set the `loadbalance` attribute of the service’s client to `leastactive`, this Loadbalance will call the provider with the least number of concurrent requests.

```xml
<dubbo:reference interface="com.foo.BarService" loadbalance="leastactive" />
```

**Or**

```xml
<dubbo:service interface="com.foo.BarService" loadbalance="leastactive" />
```
