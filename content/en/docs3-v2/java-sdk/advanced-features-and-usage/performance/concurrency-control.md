---
type: docs
title: "Concurrency Control"
linkTitle: "Concurrency Control"
weight: 28
description: "Concurrency Control in Dubbo"
---

## Configuration example

### Example 1

To limit each method of `com.foo.BarService`, the concurrent execution on the server side (or the number of threads in the thread pool) cannot exceed 10:

```xml
<dubbo:service interface="com.foo.BarService" executes="10" />
```

### Example 2

To limit the `sayHello` method of `com.foo.BarService`, the concurrent execution on the server side (or the number of threads in the thread pool) cannot exceed 10:

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" executes="10" />
</dubbo:service>
```
### Example 3

Limit each method of `com.foo.BarService` to no more than 10 concurrent executions per client (or the number of requests occupying a connection):

```xml
<dubbo:service interface="com.foo.BarService" actives="10" />
```

or

```xml
<dubbo:reference interface="com.foo.BarService" actives="10" />
```

### Example 4

Limit the `sayHello` method of `com.foo.BarService` to no more than 10 concurrent executions (or the number of requests that occupy a connection) per client:

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

If both `<dubbo:service>` and `<dubbo:reference>` are configured with actives, `<dubbo:reference>` takes precedence, see: [Configuration override strategy](../../../reference- manual/config/principle/).

## Load Balance

The `loadbalance` attribute of the client side of the configuration service is `leastactive`, and this Loadbalance will call the Provider with the smallest number of concurrency (Consumer-side concurrency).

```xml
<dubbo:reference interface="com.foo.BarService" loadbalance="leastactive" />
```

or

```xml
<dubbo:service interface="com.foo.BarService" loadbalance="leastactive" />
```