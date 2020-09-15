# Parallel control

## Example of configuration

* Example 1: Control the concurrency of all method for a specified service interface at server-side

Limit each method of `com.foo.BarService` to no more than 10 concurrent server-side executions (or take up thread pool threads):

```xml
<dubbo:service interface="com.foo.BarService" executes="10" />
```

* Example 2: Control the concurrency of specified method for a specified service interface at server-side

Limit the `sayHello` method of `com.foo.BarService` to no more than 10 concurrent server-side executions(or take up thread pool threads):

```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" executes="10" />
</dubbo:service>
```

* Example 3: Control the concurrency of all method for a specified service interface at client-side
Limit each method of `com.foo.BarService` to no more than 10 concurrent client-side executions (or take up thread pool threads):
```xml
<dubbo:service interface="com.foo.BarService" actives="10" />
```
OR
```xml
<dubbo:reference interface="com.foo.BarService" actives="10" />
```

* Example 4: Control the concurrency of specified method for a specified service interface at client-side
Limit the `sayHello` method of `com.foo.BarService` to no more than 10 concurrent client-side executions(or take up thread pool threads):
```xml
<dubbo:service interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

OR

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="sayHello" actives="10" />
</dubbo:service>
```

If `<dubbo:service>` and `<dubbo:reference>` are both configured with `actives`,`<dubbo:reference>` is preferred.Ref to:[Configuration coverage strategy](./config-rule.md).

## Load Balance
You can config the `loadbalance` attribute with `leastactive` at server-side or client-side,then the framework will make consumer call the minimum number of concurrent one.

```xml
<dubbo:reference interface="com.foo.BarService" loadbalance="leastactive" />
```
OR
```xml
<dubbo:service interface="com.foo.BarService" loadbalance="leastactive" />
```
