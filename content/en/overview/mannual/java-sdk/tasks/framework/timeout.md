---
aliases:
    - /en/overview/tasks/develop/async/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async-call/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async-execute-on-provider/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async/
description: In some cases, you may want the Dubbo interface to call asynchronously to avoid unnecessary waiting.
linkTitle: Timeout Duration
title: Specify timeout duration for service calls
type: docs
weight: 3
---

Setting a timeout for RPC calls can improve the overall stability of the cluster, avoiding resource occupation caused by waiting indefinitely for response results (e.g., a large number of long-running unresponsive requests occupying the thread pool). In cases of no response, for example, after 5 seconds, the Dubbo framework will automatically terminate the call wait process (throwing a TimeoutException) and release the resources occupied by this call.

## Usage
There are multiple ways to configure the RPC call timeout, from coarse-grained global defaults to independent configurations at the specific service or method level:

Configure the global default timeout to 5 seconds (without configuration, the default timeout for all services is 1 second).
```yaml
dubbo:
  provider:
    timeout: 5000
```

At the consumer side, specify the timeout for DemoService calls to 5 seconds.
```java
@DubboReference(timeout=5000)
private DemoService demoService;
```

At the provider side, specify the timeout for DemoService calls to 5 seconds (can serve as the default for all consumers, but has a lower priority if the consumer specifies its own).
```java
@DubboService(timeout=5000)
public class DemoServiceImpl implements DemoService{}
```

At the consumer side, specify the timeout for the DemoService sayHello method call to 5 seconds.
```java
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000)})
private DemoService demoService;
```

At the provider side, specify the timeout for the DemoService sayHello method call to 5 seconds (can serve as the default for all consumers, but has a lower priority if the consumer specifies its own).
```java
@DubboService(methods = {@Method(name = "sayHello", timeout = 5000)})
public class DemoServiceImpl implements DemoService{}
```

The priority of the above configuration forms from high to low is: `method-level configuration > service-level configuration > global configuration > default value`.

## Deadline Mechanism
<img style="max-width:600px;height:auto;" src="/imgs/v3/tasks/framework/timeout.png"/>

Let's analyze the above calling chain and the possible timeout situations:
* A calls B and sets a timeout of 5 seconds, therefore the total time for `B -> C -> D` should not exceed 5 seconds, otherwise A will receive a timeout exception.
* Theoretically, both `B -> C` and `C -> D` have their own independent timeout settings and the timeout counting is also calculated independently; they do not know whether A as the caller has timed out.
* In any case, once A has waited for 5s without a response, the entire chain can be terminated. If C is still running at that point, initiating `C -> D` becomes meaningless and wastes resources, a problem that is particularly evident in long-chain scenarios.

To address this, Dubbo introduced the **Deadline mechanism**. By passing a "deadline" (initially equal to the timeout) along the invocation chain, the entire process is constrained within a unified time window. As the call deepens, the deadline is continuously decremented; subsequent services use the remaining time as their effective timeout. If the deadline is exhausted, any remaining tasks in the chain are canceled.

**Example:**

- When A initiates a call with timeout = 5000ms, the initial deadline is 5000ms.

- By the time C initiates its request, if the chain has already consumed 3000ms, the call C -> D is restricted to a maximum of 2000ms.

<img style="max-width:600px;height:auto;" src="/imgs/v3/tasks/framework/timeout-deadline.png"/>

The Deadline mechanism is disabled by default and must be explicitly enabled. Use the following application-level configuration:

```yaml
dubbo:
  provider:
    timeout: 5000
    parameters.enable-timeout-countdown: true
```

Alternatively, you can configure it for a specific service:
```java
@DubboReference(timeout=5000, parameters={"enable-timeout-countdown", "true"})
private DemoService demoService;
```

In a Dubbo chain, once an upstream service enables enable-timeout-countdown=true, all subsequent nodes **inherit and propagate** the deadline by default (no additional configuration needed), unless a node explicitly sets it to false to break the chain. This constraint covers all synchronous and asynchronous calls initiated by **Dubbo threads**. However, it cannot be automatically propagated by non-Dubbo threads (e.g., custom thread pools, CompletableFuture.supplyAsync),example:
```Java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return service.invoke("hello");
});
```