---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/loadbalance/
description: "Load balancing strategies and their usage methods supported by Dubbo"
linkTitle: Load Balancing
title: Load Balancing Strategies and Configuration Details
type: docs
weight: 1
---

Dubbo has a built-in client-based load balancing mechanism. Below are the currently supported load balancing algorithms. With the automatic service discovery mechanism mentioned earlier, the consumer will automatically use the `Weighted Random LoadBalance` strategy for service calls.

If you want to adjust the load balancing algorithm, the following are built-in load balancing strategies in the Dubbo framework:

| Algorithm                    | Features                | Remarks                                         | Configuration Value                              |
| :--------------------------- | :--------------------- | :---------------------------------------------- | :---------------------------------------------- |
| Weighted Random LoadBalance  | Weighted Random        | Default algorithm, same default weight         | random (default)                                |
| RoundRobin LoadBalance       | Weighted Round Robin   | Based on Nginx's smooth weighted round-robin algorithm, same default weight | roundrobin                                      |
| LeastActive LoadBalance      | Least Active + Weighted Random | Based on the "to each according to their ability" concept | leastactive                                     |
| Shortest-Response LoadBalance | Shortest Response + Weighted Random | More focused on response speed                | shortestresponse                                |
| ConsistentHash LoadBalance   | Consistent Hash       | Deterministic input, deterministic provider, suitable for stateful requests | consistenthash                                  |
| P2C LoadBalance              | Power of Two Choice   | Randomly selects two nodes and then chooses the one with fewer connections. | p2c                                             |
| Adaptive LoadBalance         | Adaptive Load Balancing | Based on P2C algorithm, chooses the node with the least load among the two | adaptive                                        |

## Global Configuration
The default strategy of the Dubbo framework is `random` weighted random load balancing. To adjust the strategy, simply set the corresponding `loadbalance` value. For each load balancing strategy value, refer to the table at the top of this document.

Specify global configuration for all service calls:
```yaml
dubbo:
  consumer:
    loadbalance: roundrobin
```

## Interface Level Configuration
Different load balancing strategies can be specified for each service.

Set on the provider side as the default value for the consumer:
```java
@DubboService(loadbalance = "roundrobin")
public class DemoServiceImpl implements DemoService {}
```

Set on the consumer side, which has higher priority:
```java
@DubboReference(loadbalance = "roundrobin")
private DemoService demoService;
```

## Method Level Configuration
Load balancing strategies can also be specified at the method level.

In Spring Boot development mode, there are the following ways to configure method-level parameters:

**JavaConfig**
```java
@Configuration
public class DubboConfiguration {
    @Bean
    public ServiceBean demoService() {
        MethodConfig method = new MethodConfig();
        method.setName("sayHello");
        method.setLoadbalance("roundrobin");

        ServiceBean service = new ServiceBean();
        service.setInterface(DemoService.class);
        service.setRef(new DemoServiceImpl());
        service.addMethod(method);
        return service;
    }
}
```

```java
@Autowired
private DemoService demoService;

@Configuration
public class DubboConfiguration {
    @Bean
    public ReferenceBean demoService() {
        MethodConfig method = new MethodConfig();
        method.setName("sayHello");
        method.setLoadbalance("roundrobin");

        ReferenceBean<DemoService> reference = new ReferenceBean<>();
        reference.setInterface(DemoService.class);
        reference.addMethod(method);
        return reference;
    }
}
```

**dubbo.properties**
```properties
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.loadbalance=roundrobin
```

## Consistent Hash Configuration

By default, the first parameter is used as the hash key. If you need to switch parameters, you can specify the `hash.arguments` property.

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<DemoService>();
// ... init
Map<String, String> parameters = new HashMap<String, String>();
parameters.put("hash.arguments", "1");
parameters.put("sayHello.hash.arguments", "0,1");
referenceConfig.setParameters(parameters);
referenceConfig.setLoadBalance("consistenthash");
referenceConfig.get();
```

## Adaptive Load Balancing Configuration

Simply set `loadbalance` to `p2c` or `adaptive` on the consumer or provider side. You can refer to [Working Principle](/en/overview/reference/proposals/heuristic-flow-control).

