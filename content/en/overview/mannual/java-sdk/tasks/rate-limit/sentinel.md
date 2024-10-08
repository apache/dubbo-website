---
aliases:
    - /en/overview/tasks/ecosystem/rate-limit/
    - /en/overview/what/ecosystem/rate-limit/
    - /en/overview/what/ecosystem/rate-limit/sentinel/
    - /en/overview/tasks/rate-limit/sentinel/
    - /en/overview/tasks/rate-limit/sentinel/
description: "Use Sentinel to protect your Dubbo application from stability issues due to surging traffic for individual services."
linkTitle: Sentinel Rate Limiting
title: Use Sentinel to Handle Surging Traffic and Protect Your Application
type: docs
weight: 1
---

In complex production environments, thousands of Dubbo service instances may be deployed, with continuous incoming traffic and inter-service calls. However, distributed systems may experience unavailability of certain services due to a surge in traffic, high system load, network latency, etc. If appropriate controls are not in place, it can lead to cascading failures that impact service availability. Therefore, how to reasonably control traffic has become key to ensuring service stability.

[Sentinel](https://github.com/alibaba/Sentinel) is an open-source lightweight traffic control product developed by Alibaba's middleware team, aimed at distributed service architecture. It primarily focuses on traffic control, circuit breaking, and system load protection to help users protect service stability.

This article provides best practices for Dubbo integration with Sentinel for traffic limiting and degradation.

## Quick Access to Sentinel

Sentinel improves service availability under extreme scenarios by limiting traffic on both service providers and consumers. Next, let's look at the technical implementation of traffic limiting for service providers and consumers.

When using it, we only need to introduce the following module (taking Maven as an example):

```xml
<dependency>
	<groupId>com.alibaba.csp</groupId>
	<artifactId>sentinel-apache-dubbo3-adapter</artifactId>
	<version>1.8.6</version>
</dependency>
<!-- optional -->
<dependency>
	<groupId>com.alibaba.csp</groupId>
	<artifactId>sentinel-transport-simple-http</artifactId>
	<version>1.8.6</version>
</dependency>
```

After introducing this dependency, Dubbo service interfaces and methods (including both client and server) will become resources in Sentinel, and upon configuring rules, you can automatically enjoy the protective capabilities of Sentinel.

> The `sentinel-apache-dubbo3-adapter` includes the Sentinel Filter implementation, which will be automatically enabled after adding the dependency. If you do not wish to enable a specific filter in Sentinel Dubbo Adapter, you can disable it through configuration, for example, `dubbo.provider.filter="-sentinel.dubbo.consumer.filter"`.


## Example Details

Here you can view the [complete source code of the example](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-sentinel).

### Traffic Limiting on the Provider Side

Traffic control for service providers can be divided into **the self-protection capability of the service provider** and **the request allocation capability of the service provider towards service consumers**.

#### Limit Based on QPS
To protect the Provider from being overwhelmed by surging traffic, you can configure **QPS mode** limiting. This way, when the number of requests per second exceeds the set threshold, it will automatically reject excess requests.

The following is the **service-level** QPS limit configuration with a maximum QPS of 10:

```java
// Limit DemoService to 10 QPS
FlowRule flowRule = new FlowRule();
// Note: the resource name here is the interface name.
flowRule.setResource(DemoService.class.getName());
flowRule.setCount(10);
flowRule.setLimitApp("default");
flowRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
FlowRuleManager.loadRules(Collections.singletonList(flowRule));
```

The following is the **method-level** QPS limit configuration, with a maximum QPS of 5:

```java
// Limit sayHelloAgain method to 10 QPS
FlowRule flowRule = new FlowRule();
// Note: the resource name here includes the method signature.
flowRule.setResource(DemoService.class.getName() + ":sayHelloAgain(java.lang.String)");
flowRule.setCount(5);
flowRule.setLimitApp("default");
flowRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
FlowRuleManager.loadRules(Collections.singletonList(flowRule));
```

Start the consumer process and continue to make calls. The following is the log printed by the provider after flow control is effective:

```
2018-07-24 17:13:43|1|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String),FlowException,default,|5,0
```

Records of the metrics log corresponding to the Provider are also available:

```
1532423623000|2018-07-24 17:13:43|com.alibaba.csp.sentinel.demo.dubbo.FooService|15|0|15|0|3
1532423623000|2018-07-24 17:13:43|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String)|10|5|10|0|0
```

#### QPS Limiting (for Specific Consumers)
The QPS limiting value in the previous section applies to all consumer traffic, but you can also limit QPS for specific consumers (identified by the Dubbo application name) by setting `flowRule.setLimitApp("sentinel-consumer");` where `sentinel-consumer` is the name of the calling consumer application:

```java
//......
// Note: this will take effect only for the specific consumer whose app name is "sentinel-consumer".
flowRule.setLimitApp("sentinel-consumer");
flowRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
FlowRuleManager.loadRules(Collections.singletonList(flowRule));
```

In the flow limiting log, the name of the caller will also be recorded, as shown in the log below where `sentinel-consumer` is the caller name:

```
2018-07-25 16:26:48|1|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String),FlowException,default,demo-consumer|5,0
```

> Note: To make `limitApp` effective, developers need to call `RpcContext.getContext.setAttachment("dubboApplication", "sentinel-consumer")` to identify their identity. If the consumer has introduced `sentinel-apache-dubbo3-adapter`, there is no need for an additional call.

#### Set Callback Method After Limiting Occurs

Calling `DubboAdapterGlobalConfig.setProviderFallback()` can set a method callback that executes after traffic limiting occurs, allowing for more customized actions post-limiting.

```java
DubboAdapterGlobalConfig.setProviderFallback((invoker, invocation, ex) -> {
	System.out.println("Blocked by Sentinel: " + ex.getClass().getSimpleName() + ", " + invocation);
	return AsyncRpcResult.newDefaultAsyncResult(ex.toRuntimeException(), invocation);
});
```

### Traffic Limiting on the Consumer Side

Traffic control for service consumers can be divided into **controlling concurrent thread counts** and **service degradation**.

#### Thread Count Limiting
It is recommended to configure a **thread count mode** limit for the consumer to ensure it is not affected by unstable services. After adopting the thread count limiting mode, you no longer need to explicitly isolate thread pools. Sentinel will control the thread count of resources, rejecting excess requests directly until the backlog is processed, achieving a **semaphore isolation** effect.

The following method sets the maximum concurrent thread count for the consumer side, where concurrent calls to the method `sayHelloConsumerFlowControl` will trigger flow limiting upon exceeding 3 threads:

```java
FlowRule flowRule = new FlowRule();
flowRule.setResource("org.apache.dubbo.samples.sentinel.DemoService:sayHelloConsumerFlowControl(java.lang.String)");
flowRule.setCount(3);
flowRule.setGrade(RuleConstant.FLOW_GRADE_THREAD);
FlowRuleManager.loadRules(Collections.singletonList(flowRule));
```

By calling the following method, you can set a callback method that executes when limiting occurs (optional):

```java
DubboAdapterGlobalConfig.setConsumerFallback((invoker, invocation, ex) -> {
	System.out.println("Blocked by Sentinel: " + ex.getClass().getSimpleName() + ", " + invocation);
	return AsyncRpcResult.newDefaultAsyncResult(ex.toRuntimeException(), invocation);
});
```

#### Service Circuit Breaking and Degradation
When a service depends on multiple downstream services, if one downstream service call is very slow, it can severely impact the current service call. Here, we can utilize Sentinel's circuit breaking and degradation feature to configure degradation rules based on average RT for the calling side. When the average RT of a service call in the call chain rises and exceeds the configured RT threshold within a certain number of attempts, Sentinel will perform degradation on that calling resource, and subsequent calls will be immediately rejected until a predefined time has passed to restore it, thereby protecting the service from the shortcomings of the caller. Additionally, it can be used in conjunction with the fallback feature to provide corresponding handling logic during degradation.

The following method sets the degradation policy for `sayHelloConsumerDowngrade`. When the failure rate of the interface call reaches 70%, the method call will automatically degrade:

```java
@Component
static class SentinelDowngradeConfig implements CommandLineRunner {
	@Override
	public void run(String... args) {
		List<DegradeRule> rules = new ArrayList<>();
		DegradeRule rule = new DegradeRule();
		rule.setResource("org.apache.dubbo.samples.sentinel.DemoService:sayHelloConsumerDowngrade(java.lang.String)");
		rule.setGrade(CircuitBreakerStrategy.ERROR_RATIO.getType());
		rule.setCount(0.7); // Threshold is 70% error ratio
		rule.setMinRequestAmount(100);
		rule.setStatIntervalMs(30000); // 30s
		rule.setTimeWindow(10);
		rules.add(rule);
		DegradeRuleManager.loadRules(rules);
	}
}
```

## Sentinel Console

The Sentinel console serves as a unified configuration and management entry for traffic control and circuit breaking rules, providing users with monitoring capabilities across multiple dimensions. On the Sentinel console:
* Dynamically issue configuration rules and view real-time traffic control effects
* View machine lists and health status

### How to Connect Applications to the Console
The steps to integrate with the Sentinel console are as follows (**none can be omitted**):

1. Start the console according to the [Sentinel console documentation](https://github.com/alibaba/Sentinel/wiki/%E6%8E%A7%E5%88%B6%E5%8F%B0)
2. The application must include the `sentinel-transport-simple-http` dependency so that the console can pull related information about the application
3. Add relevant startup parameters to the application and start it. The parameters that need to be configured include:
   - `-Dcsp.sentinel.api.port`: The port for the client to report related information (default is 8719)
   - `-Dcsp.sentinel.dashboard.server`: The console address
   - `-Dproject.name`: The application name that will be displayed in the console

Thus, after starting the application, you can find the corresponding application in the console.

### Overview of Console Features

- **Single Device Monitoring**: When you see your machine in the machine list, it means that you have successfully connected to the console and can view the device name, IP address, port number, health status, and heartbeat time of a single device.

![sentinel-dashboard](/imgs/v3/tasks/sentinel/dashboard-1.png)

- **Link Monitoring**: The cluster point links can fetch real-time execution conditions of specified client resources. It provides two display modes: one presents the resource call link in a tree structure; the other does not distinguish the call link to display resource execution status. Through link monitoring, you can view the historical status of flow control and degradation for each resource.

Tree Structure Link

![sentinel-dashboard](/imgs/v3/tasks/sentinel/dashboard-2.png)

Flat Link

![sentinel-dashboard](/imgs/v3/tasks/sentinel/dashboard-3.png)

- **Aggregate Monitoring**: Information about all machines under the same service is aggregated for real-time monitoring, with accuracy reaching the second level.

![sentinel-dashboard](/imgs/v3/tasks/sentinel/dashboard-4.png)

- **Rule Configuration**: You can view existing flow limiting, degradation, and system protection rules and configure them in real-time.

![sentinel-dashboard](/imgs/v3/tasks/sentinel/dashboard-5.png)

## Reference Links

For more ways to use Sentinel, please refer to the [Sentinel official website](https://sentinelguard.io/zh-cn/index.html)

