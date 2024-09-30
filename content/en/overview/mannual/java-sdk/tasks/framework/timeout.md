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
* In any case, as long as A waits 5 seconds without receiving a response, the entire call chain can be terminated (if C is running at this time, then `C -> D` has no meaning to initiate).
* Theoretically, both `B -> C` and `C -> D` have their own independent timeout settings and the timeout counting is also calculated independently; they do not know whether A as the caller has timed out.

In the Dubbo framework, the call `A -> B` acts like a switch; once activated, the entire `A -> B -> C -> D` call chain will be executed completely, even if the caller A has already timed out, subsequent calling actions will continue. This can be meaningless in some scenarios, especially in long chains as it leads to unnecessary resource consumption. The deadline is designed to solve this problem by passing a deadline through the call chain (the initial value of the deadline equals the timeout, decreasing as time passes). This ensures the call chain only executes within its validity period; once the deadline is exhausted, other unexecuted tasks in the call chain will be canceled.

Thus, the deadline mechanism treats `B -> C -> D` as a whole, and this series of actions must be completed within 5 seconds. As time passes, the deadline will decrease from 5 seconds. For each subsequent call, the actual available timeout is the current deadline value; for example, if `C` receives the request 3 seconds later, then the timeout for `C -> D` only has 2 seconds left.

<img style="max-width:600px;height:auto;" src="/imgs/v3/tasks/framework/timeout-deadline.png"/>

The deadline mechanism is off by default. To enable the deadline mechanism, configure the following parameters:
```yaml
dubbo:
  provider:
    timeout: 5000
    parameters.enable-timeout-countdown: true
```

You can also enable the deadline mechanism for a specific service call:
```java
@DubboReference(timeout=5000, parameters={"enable-timeout-countdown", "true"})
private DemoService demoService;
```
