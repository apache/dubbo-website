# Sentinel: The flow sentinel of Dubbo services

In large clusters there may be thousands of Dubbo service instances in production, with continuous traffic coming in. However, in distributed systems, some services may be unavailable due to various of failure such as traffic surge, high system load, and network latency. If no control actions are performed, this may cause cascading failure, affecting the availability of the service. So we need a powerful library - Sentinel, which can guarantee the stability of the service, to protect the Dubbo service.

## Introduction to Sentinel

[Sentinel](https://github.com/alibaba/Sentinel) is a powerful library opensourced by Alibaba Middleware Team. Sentinel takes "**flow**" as the breakthrough point, and covers multiple fields including flow control, concurrency, circuit breaking and load protection to protect service stability.

There are mainly three features in Sentinel:

- **Flow Control**: Sentinel can control the traffic flow of resource calls based on different runtime metrics (such as QPS, number of threads, system load, etc.), for different invocation paths, and adjust random traffic to appropriate shapes (e.g. uniform speed).
- **Circuit Breaking**: When a resource in the invocation chain is unstable (average RT increase or exception ratio increase), Sentinel will fast-fail the call request for this resource to avoid affecting other resources, causing cascade failure.
- **System Load Protection**: Sentinel can be used to protect your server in case the system load goes too high. It helps you to achieve a good balance between system load and incoming requests.

The commonly used circuit breaker/isolation library in production is [Netflix Hystrix](https://github.com/Netflix/Hystrix). Hystrix focuses on the concept of isolation, which isolates dependencies (that is resource in Sentinel) through thread pools or semaphores. The benefit of Hystrix thread pool isolation is that the isolation is thorough, but the downside is that you have to create a lot of thread pools, pre-divide dependencies, and allocate thread pools to each dependency. Sentinel provides another idea for resource isolation: it is controlled by **the number of concurrent threads**. In this way, developer does not need to specify the size of the thread pool in advance, and there is less loss of thread context switching. When the resource is in an unstable state, the response time becomes longer and the number of threads gradually increases. When the number of threads of a resource is raised to a threshold, traffic flow limit is triggered until the stacked thread completes the task and then continues to accept the requests.

Hystrix uses Circuit Breaker Pattern to automatically fast-fail the service when exception ratio exceeds the threshold. Sentinel's circuit breaking feature is more versatile, which supports two metrics: average response time and failure ratio. Sentinel also provides various invocation chain path and flow control effects support, as well as the ability to adjust the traffic in real time according to the system load to protect the system. At the same time, Sentinel also provides a real-time monitoring API and dashboard, which allows developers to quickly understand the current state of the system and understand the stability of the service. The scenarios are more abundant.

## Best Practice for using Dubbo with Sentinel

[Sentinel Dubbo Adapter](https://github.com/dubbo/dubbo-sentinel-support) provides service consumer filter and provider filter for Dubbo services. We can add the following dependency in `pom.xml` (if you are using Maven):

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-dubbo-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

The two filters are enabled by default. Once you add the dependency, the Dubbo services and methods will become protected resources in Sentinel, which can leverage Sentinel's flow control and guard ability when rules are configured. If you don't want to enable the filter, you can manually disable it. For example:

```java
@Bean
public ConsumerConfig consumerConfig() {
    ConsumerConfig consumerConfig = new ConsumerConfig();
    consumerConfig.setFilter("-sentinel.dubbo.consumer.filter");
    return consumerConfig;
}
```

We've provided sereval demos, you can check here: [sentinel-demo-dubbo](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-dubbo)。

### Service Provider

Dubbo service providers provide services for outside world and handle requests from consumers. To protect the service provider from suffering the proliferation of traffic flow, you can set flow rules in **QPS mode** to the service provider. Thus, when the number of requests per second exceeds the threshold, new requests are automatically rejected.

The flow control for Dubbo services has two granularities: service interface and service method.

- Service interface：resourceName format is `interfaceName`，e.g. `com.alibaba.csp.sentinel.demo.dubbo.FooService`
- Service method：resourceName format is `interfaceName:methodSignature`，e.g. `com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String)`

For the detail of flow rule configuration and flow control, please refer to [Flow Control | Sentinel](https://github.com/alibaba/Sentinel/wiki/Flow-Control).

Let's take a look at the effect of the QPS flow control. Assume that we have a service interface `com.alibaba.csp.sentinel.demo.dubbo.FooService`, which contains a method `sayHello(java.lang.String)`. We set flow rule for service provider (QPS count = 10). Then we do RPC 15 times at service consumer continuously in 1s. We can see the blocked metrics in the log. The log of blocked calls is located in `~/logs/csp/sentinel-block.log`：

```
2018-07-24 17:13:43|1|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String),FlowException,default,|5,0
```

Log messages will also appear in provider's metric log：

```
1532423623000|2018-07-24 17:13:43|com.alibaba.csp.sentinel.demo.dubbo.FooService|15|0|15|0|3
1532423623000|2018-07-24 17:13:43|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String)|10|5|10|0|0
```

In many circumstances, it's also significant to control traffic flow based on the **caller**. For example, assuming that there are two services A and B, both of them initiate remote call requests to the service provider. If we want to limit the calls from service B only, we can set the `limitApp` of flow rule as the identifier of service B (e.g. service name). The Sentinel Dubbo Adapter will automatically resolve the Dubbo consumer's *application name* as the caller's name (`origin`), and will bring the caller's name when doing resource protection. If `limitApp` of flow rules is not configured (`default`), flow control will take effects on all callers. If `limitApp` of a flow rule is configured with a caller, then the corresponding flow rule will only take effect on the specific caller.

> Note: Dubbo consumer does not provide its Dubbo application name when doing RPC, so developers should manually put the application name into *attachment* at consumer side, then extract it at provider side. Sentinel Dubbo Adapter has implemented a filter where consumer can carry application name information to provider automatically. If the counsmer does not use Sentinel Dubbo Adapter but requires flow control based on caller, developers can manually put the application name into attachment with the key `dubboApplication`.

The `sentinel-block.log` will also record caller name. For example:

```
2018-07-25 16:26:48|1|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String),FlowException,default,demo-consumer|5,0
```

The `demo-consumer` in the log is the caller name (origin).

### Service Consumer

Dubbo service consumers act as a client to invoke the remote service. Each service may depend on several downstream services. If a service A depends on the downstream service B, and service B is unstable (i.e. the response time becomes longer), the number of threads where service A invokes service B will accumulate, thus may eventually run out of service A's thread pool. We use the thread count to control access to downstream service B. This can ensure service itself not affected by others when downstream services are not stable and reliable. Based on this scenario, it is recommended to set flow rules with **thread count mode** to consumers so that it's not affected by unstable services.

The thread-count-based flow control mode does not require us to explicitly perform thread pool isolation. Sentinel will control the number of threads of the resource, and the excess requests will be rejected directly until the stacked tasks are completed.

### Sentinel Dashboard

For ease of use, Sentinel provides a Dashboard for configuring rules, viewing monitoring metrics, machine discovery, and more. We only need to start the dashborad according to the [Sentinel dashboard documentation](https://github.com/alibaba/Sentinel/wiki/Dashboard), then add the appropriate parameters to the corresponding application and launch it. For example, the startup parameters of the service provider demo in this article is:

```bash
-Djava.net.preferIPv4Stack=true -Dcsp.sentinel.api.port=8720 -Dcsp.sentinel.dashboard.server=localhost:8080 -Dproject.name=dubbo-provider-demo
```

After launching the service provider demo, we can find our application in the Sentinel dashboard. It's convenient to configure the rules in the dashboard：

![Rule List](../../img/blog/sentinel-dashboard-view-rules.png)

Or view real-time metrics：

![Real-time metrics monitoring](../../img/blog/sentinel-dashboard-metrics.png)

## Summary

This blog post only introduces the simplest scenario in Sentinel - Traffic Flow Control. Sentinel can handle more complex scenarios like circuit breaking, cold starting and uniform traffic flow. For more scenarios, you can dig into [Sentinel Wiki](https://github.com/alibaba/Sentinel/wiki).
