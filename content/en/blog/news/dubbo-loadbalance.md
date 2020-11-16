---
title: "Dubbo's Load Balance"
linkTitle: "Dubbo's Load Balance"
date: 2018-08-10
description: >
    This article introduces you what is load balance and how load balance strategy is implemented in Dubbo.
---


## Background

Dubbo is a distributed service framework that avoids single point of failure and horizontal expansion of support services. A service typically deploys multiple instances. How to select a call from a cluster of multiple service providers involves a load balancing strategy.

## Concepts

Before discussing load balancing, I will explain these three concepts first.

1. Load Balancing
2. Fault-tolerant Cluster
3. Service Route

These three concepts are confusing. They all describe how to choose from multiple Providers to make calls. So what is the difference between them? Let me give a simple example and explain these concepts clearly.

There is a Dubbo user service, 10 deployed in Beijing and 20 deployed in Shanghai. A service consumer in Hangzhou initiated a call and then the following steps executed:

1. According to the configured routing rule, if the call is initiated by Hangzhou, it will be routed to the nearest 20 Providers in Shanghai.
2. According to the configured random load balancing strategy, one of the 20 Providers is randomly selected to be called, assuming that the 7th Provider is randomly selected.
3. As a result, calling the 7th Provider failed.
4. Retried other servers according to the configured Fault-tolerant Cluster mode.
5. The call to the 13th Provider was successful.

Steps 1, 2, and 4 above correspond to routing, load balancing, and fault-tolerant cluster. In Dubbo, a subset is selected by routing from multiple Providers according to routing rules, then a Provider selected from the subset according to load balancing to make this call. If the call fails, Dubbo retry or schedule retransmission or fail-fast according to the Fault-tolerant Cluster policy. You can see the routes in Dubbo, load balancing and Fault-tolerant Cluster exectute at different stages of an RPC call. The first stage is routing, then load balancing, and finally cluster fault tolerance. This document only discusses load balancing, routing and cluster fault tolerance are described in other documents.

## Dubbo's Internal Load Balancing Strategy

Dubbo has four Internal Load Balancing Strategies:

1. RandomLoadBalance: Random load balancing. Choose a Provider randomly. It is Dubbo's default load balancing strategy.
2. Round Robin Load Balancing: Polling load balancing, then chooses one Provider.
3. LeastActiveLoadBalance: The minimum number of active calls, the random number of the same active number. The active number refers to the difference before and after the call. Make slow providers receive fewer requests, because the slower Provider before and after the difference of calls will be larger.
4. ConsistentHashLoadBalance: Consistent hash load balancing. Requests with the same parameters always fall on the same machine.

### 1. Random Load Balancing

As the name implies, the random load balancing strategy is to select one from multiple Providers randomly. However, random load balancing in Dubbo has a weighting concept that sets the random probability according to the weight. For example, there are 10 Providers, it's not to say that the probability of each Provider is the same, but to assign the probability by combining the weights of these 10 providers.

In Dubbo, you can set weights on the Provider. For example, if the performance of the machine is better, you can set a larger weight. If the performance is poorer, you can set a smaller weight. Weights have an impact on load balancing. The weight of provider can be set in Dubbo Admin.

#### Weight-based Load Balancing Algorithm

The stochastic strategy will determine whether the weights of all the invokers are the same at first. If they are all the same, then the processing is relatively simple. Using `random.nexInt(length)`, you can randomly generate an invoker serial number, and select the corresponding invoker according to the serial number. If the service provider not set weight in Dubbo Admin, then all the invokers have the same weight, the default is 100. If the weights are different, then you need to combine the weights to set the random probability. The algorithm is probably as follows: If there are 4 invokers

| Invoker | Weight |
| ------- | ------ |
| A       | 10     |
| B       | 20     |
| C       | 20     |
| D       | 30     |

The total weight of A, B, C and D is 10 + 20 + 20 + 30 = 80. Spread 80 numbers in the following diagram:

```
+-----------------------------------------------------------------------------------+
|          |                    |                    |                              |
+-----------------------------------------------------------------------------------+
1          10                   30                   50                             80

|-----A----|---------B----------|----------C---------|---------------D--------------|


---------------------15

-------------------------------------------37

-----------------------------------------------------------54
```

There are four areas in the above picture, and the lengths are the weights of A, B, C and D, respectively. Use `random.nextInt(10 + 20 + 20 + 30)` to randomly select one of the 80 numbers. Then determine which area the number is distributed in. For example, if random to 37, 37 is distributed in the C region, then select inboker C. 15 is in the B area, 54 is in the D area.

#### Random load balancing Source code

Below is the source code for random load balancing. For ease of reading and understanding, I removed the extraneous parts.

```
public class RandomLoadBalance extends AbstractLoadBalance {

    private final Random random = new Random();

    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        int length = invokers.size();      // total invoker
        int totalWeight = 0;               // Sum of invokers' weights

        // Determine if all the invokers have the same weight
        // If the weights are the same, it is simple to generate an index directly from Random.
        boolean sameWeight = true;
        for (int i = 0; i < length; i++) {
            int weight = getWeight(invokers.get(i), invocation);
            totalWeight += weight; // Sum
            if (sameWeight && i > 0 && weight != getWeight(invokers.get(i - 1), invocation)) {
                sameWeight = false;
            }
        }

        if (totalWeight > 0 && !sameWeight) {
            // If not all of the invoker weights are the same, load balancer will randomly choose invoker based on its weight. The greater the weight, the greater the probability of being selected
            int offset = random.nextInt(totalWeight);
            for (int i = 0; i < length; i++) {
                offset -= getWeight(invokers.get(i), invocation);
                if (offset < 0) {
                    return invokers.get(i);
                }
            }
        }
        // If all invokers have the same weight
        return invokers.get(random.nextInt(length));
    }
}
```

### 2. Round Robin Load Balancing

Round Robin Load Balancing, is to call all Providers in turn. As with random load balancing strategies, Round Robin Load Balancing policies also has a weighting concept. The Round Robin Load Balancing algorithm allows RPC calls to be allocated exactly as we set. Whether it is a small or large number of calls. However, there are also some shortcomings in the Round Robin Load Balancing algorithm. There is a problem that the slow provider accumulates the request. For example, the second machine is slow, but it is not crashed. When the request is transferred to the second machine, it is stuck. Over time, all The request get stuck on the second machine, causing the entire system to slow down.
### 3. Minimum Active Call Load Balancing
Official explanation:
> The active number refers to the difference between the counts before and after the call. Select the machine with the minimum number of active calls or choose a random one among machines with the same active number, so that the slower machine can receives less requests.

This explanation seems to be ambigious. We know the purpose is to ensure the slower machine receive less requests, but it is not clear how to achieve it. An example is here: each service maintains an active number counter. When A machine starts processing the request, the counter is incremented by 1. At this time, A is still processing. If the processing is completed, the counter is decremented by 1. B machine processes very quickly after receiving the request. Then the active numbers of A and B are 1,0 respectively. When a new request is generated, the B machine is selected for execution (as B has the minimum active number), so that the slower machine A receives fewer requests.

When processing a new request, Consumer will check the active number of all Providers. If there is only one Invoker with the minimum active number, the Invoker is returned directly.

```
if (leastCount == 1) {
    // if there is only one minimum value then return directly
    return invokers.get(leastIndexs[0]);
}
```

If there are multiple Invokers with the minimum active number, plus the weights are not equal and the total weight is greater than 0, then generate a random weight ranging from 0 to totalWeight. Finally, the Invoker is selected based on the randomly generated weights.

```
if (! sameWeight && totalWeight > 0) {
    // if the weights are not equal and the toatl weight is greater than 0 then choose randomly according to total weight

    int offsetWeight = random.nextInt(totalWeight);

    // and determine which segment the random value falls on.

    for (int i = 0; i < leastCount; i++) {
        int leastIndex = leastIndexs[i];
        offsetWeight -= getWeight(invokers.get(leastIndex), invocation);
        if (offsetWeight <= 0)
            return invokers.get(leastIndex);
    }
}
```


### 4. Consistent Hash Algorithm

Use consistent hash algorithm to ensure that requests with same parameters are always sent to the same Provider. When a Provider crashes, requests originally sent to the Provider is spread evenly to other Providers based on the virtual node without causing drastic changes. The algorithm can be seen at: http://en.wikipedia.org/wiki/Consistent_hashing

By default, only the first parameter is hashed. Configure if you would like to modify it:
```
<dubbo:parameter key="hash.arguments" value="0,1" />
```

By default, 160 virtual nodes are used. Configure if you would like to modify it:
```
<dubbo:parameter key="hash.nodes" value="320" />
```

Consistent hash algorithms can be used in conjunction with caching mechanisms. For example, there is a service getUserInfo(String userId). After the hash algorithm is set, the same userId call is sent to the same Provider. This Provider can cache user data in memory, reducing the number of accesses to the database or distributed cache. If this part of the data is allowed to be inconsistent for some time, this approach can be considered. The number of dependencies and accesses to middleware such as databases, caches, etc. and network IO operations is reduced, while the system performance is improved.




## Load Balancing Configuration

If load balancing is not specified, random load balancing is used by default. Load balancing can also be explicitly specified based on our needs. Load balancing can be configured in multiple local classes, such as Provider Side, Consumer Side, Service Level, and Method Level.

### Server Side Service Level
```
<dubbo:service interface="..." loadbalance="roundrobin" />
```
All methods of the service use roundrobin load balancing.

### Client Side Service Level
```
<dubbo:reference interface="..." loadbalance="roundrobin" />
```
All methods of the service use roundrobin load balancing.

### Server Side Method Level
```
<dubbo:service interface="...">
    <dubbo:method name="hello" loadbalance="roundrobin"/>
</dubbo:service>
```
Only the hello method of the service uses roundrobin load balancing.

### Client Side Method Level
```
<dubbo:reference interface="...">
    <dubbo:method name="hello" loadbalance="roundrobin"/>
</dubbo:reference>
```
Only the hello method of the service uses roundrobin load balancing.

Similar to other Dubbo configurations, multiple configurations are covered:

1. The method level takes precedence, the interface level is next, and the global configuration comes last.
2. If the level is the same, the Consumer is given priority and the Provider is next

Therefore, the priority of the above four configurations is:

1. Client side method level configuration.
2. Client side interface level configuration.
3. Server side method level configuration.
4. Server side interface level configuration.




## Extended Load Balancing

Four load balancing implementations of Dubbo meet the requirements in most cases. Sometimes, we may need to implement our own load balancing strategy because of the needs of the business. This chapter only explains how to configure the load balancing algorithm. For more on the Dubbo extension mechanism, go to the Dubbo extension mechanism practice.

1. Implementing the LoadBalance interface

The following is Dubbo's LoadBalance interface:
```
@SPI(RandomLoadBalance.NAME)
public interface LoadBalance {
    @Adaptive("loadbalance")
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```

This is the interface of the SPI. The parameters of the select method are as follows:

* invokers: A list of all service Providers.
* url: Some configuration information, such as interface name, check or not, serialization.
* invocation: Information called by the RPC, including the method name, method parameter type, and method parameters. Here is a LoadBalance implemented by us. The implementation is very simple - Choose the first Invoker:
```
package com.demo.dubbo;
public class DemoLoadBalance implements LoadBalance {
    @Override
    public <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException {
        System.out.println("[DemoLoadBalance]Select the first invoker...");
        return invokers.get(0);
    }
}
```

2. Add a resource file

Add a file:
``src/main/resource/META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.LoadBalance``
This is a simple text file. The file contents are as follows:
```
demo=my=com.demo.dubbo.DemoLoadBalance
```

3. Configure to use custom LoadBalance

```
<dubbo:reference id="helloService" interface="com.demo.dubbo.api.IHelloService" loadbalance="demo" />
```

Configure  ``<loadbalance="demo">`` in ``dubbo:reference`` at the Consumer side.

After 3 steps above, we wrote a custom LoadBalance and told Dubbo to use it. Start Dubbo and we can see that Dubbo has used a custom DemoLoadBalance.
