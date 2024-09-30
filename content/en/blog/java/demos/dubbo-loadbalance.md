---
title: "Dubbo Load Balancing"
linkTitle: "Dubbo Load Balancing"
tags: ["Java"]
date: 2018-08-10
description: >
    This article introduces relevant concepts of load balancing as well as the implementation of load balancing strategies in Dubbo.
---

## Background

Dubbo is a distributed service framework that avoids single points of failure and supports horizontal scaling of services. A service usually has multiple instances deployed. The strategy for selecting one from a cluster of service providers involves load balancing.

## Several Concepts

Before discussing load balancing, I’d like to explain these three concepts.

1. Load Balancing
2. Cluster Fault Tolerance
3. Service Routing

These concepts can be easily confused. They all describe how to select one from multiple providers to make a call. So what are the differences? Here’s a simple example to clarify these concepts.

There is a Dubbo user service with 10 instances in Beijing and 20 in Shanghai. A service consumer in Hangzhou initiates a call, and the following happens:

1. According to the configured routing rules, the call from Hangzhou routes to the closer 20 providers in Shanghai.
2. Based on a configured random load balancing strategy, one is randomly selected from the 20 providers, say the 7th provider.
3. The call to the 7th provider fails.
4. According to the configured Failover cluster fault tolerance mode, it retries with other servers.
5. Retried the 13th provider, and the call is successful.

Steps 1, 2, and 4 correspond to routing, load balancing, and cluster fault tolerance, respectively. In Dubbo, routing first selects a subset from multiple providers based on routing rules. Then load balancing selects one provider from that subset for the call. If the call fails, the cluster fault tolerance strategy will retry, resend at intervals, or fail fast, etc. It can be seen that routing, load balancing, and cluster fault tolerance occur at different stages of a single RPC call. First is routing, then load balancing, and finally cluster fault tolerance. This document discusses only load balancing; routing and cluster fault tolerance are explained in other documents.

## Built-in Load Balancing Strategies in Dubbo

Dubbo has four built-in load balancing strategies:

1. RandomLoadBalance: Random load balancing. Randomly selects one. This is Dubbo’s **default** load balancing strategy.
2. RoundRobinLoadBalance: Round-robin load balancing. Selects one in a round-robin manner.
3. LeastActiveLoadBalance: Least active calls, randomly among those with the same count. Active count refers to the difference in call counts before and after. Slower providers will receive fewer requests because their count difference will be larger.
4. ConsistentHashLoadBalance: Consistent hashing load balancing. Requests with the same parameters always go to the same machine.

### 1. Random Load Balancing

As the name suggests, random load balancing randomly selects one from multiple providers. However, in Dubbo, there is a concept of weight, meaning the random probability is set according to weights. For example, if there are 10 providers, it doesn't mean each provider has an equal probability, but rather the probability is assigned based on the weights of these 10 providers.

In Dubbo, you can set weights for providers. For example, for machines with better performance, you can assign a larger weight, while for those with poorer performance, you can assign a smaller one. Weights will affect load balancing and can be configured in Dubbo Admin.

**Weight-based Load Balancing Algorithm**

The random strategy will first check if all invokers have the same weight; if they do, the process is simpler. Using `random.nextInt(length)` can randomly generate an index for an invoker. If no weights are set in Dubbo Admin for the service providers, then all invokers will have the same weight, defaulting to 100. If the weights are different, the random probability needs to be set based on weights. The algorithm is roughly as follows: Suppose there are 4 invokers.

| invoker | weight |
| ------- | ------ |
| A       | 10     |
| B       | 20     |
| C       | 20     |
| D       | 30     |

The total weight of A, B, C, and D is 10 + 20 + 20 + 30 = 80. Distribute these 80 numbers as follows:

```
+-----------------------------------------------------------------------------------+
|          |                    |                    |                              |
+-----------------------------------------------------------------------------------+
1          10                   30                   50                             80

|-----A----|---------B----------|----------C---------|---------------D--------------|
```

In the diagram, there are 4 areas with lengths corresponding to the weights of A, B, C, and D. Use `random.nextInt(80)` to randomly select one from the total of 80 numbers. Then check which area the number falls into. For example, if 37 is selected, it falls into the C area, so invoker C is chosen. 

**Random Load Balancing Source Code**

Here’s the source code for random load balancing, with irrelevant parts removed for ease of reading.

```
public class RandomLoadBalance extends AbstractLoadBalance {

    private final Random random = new Random();

    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        int length = invokers.size();      // Total number of Invokers
        int totalWeight = 0;               // Sum of all Invokers' weights

        boolean sameWeight = true;
        for (int i = 0; i < length; i++) {
            int weight = getWeight(invokers.get(i), invocation);
            totalWeight += weight; 
            if (sameWeight && i > 0 && weight != getWeight(invokers.get(i - 1), invocation)) {
                sameWeight = false;
            }
        }

        if (totalWeight > 0 && !sameWeight) {
            int offset = random.nextInt(totalWeight);
            for (int i = 0; i < length; i++) {
                offset -= getWeight(invokers.get(i), invocation);
                if (offset < 0) {
                    return invokers.get(i);
                }
            }
        }
        return invokers.get(random.nextInt(length));
    }
}
```

### 2. Round Robin Load Balancing

Round robin load balancing sequentially calls all providers. Like the random load balancing strategy, round robin load balancing also incorporates the concept of weight. The round robin balancing algorithm can allocate calls strictly according to the set proportions, regardless of whether it is a small or large number of calls. However, the round robin algorithm also has its drawbacks, such as the accumulation of requests on slower providers. For instance, if the second machine is slow but not down, when requests go to it, they get stuck, and over time, all requests may get stuck on that machine, causing the entire system to slow down.

### 3. Least Active Load Balancing

Official Explanation:

> Least active calls, randomly among those with the same count. The active count refers to the difference in call counts before and after, allowing slower machines to receive fewer requests.

This explanation might not be very clear. The goal is to let the slower machines receive fewer requests, but the specific implementation isn't explicitly clear. For example, each service maintains a counter for active counts. When machine A starts processing a request, the counter increments by 1, and if it finishes, the counter decrements. If machine B receives a request and finishes quickly, then A and B’s active counts are 1 and 0, respectively. When a new request is generated, B is selected for execution (B has the least active count), thus allowing the slower machine A to receive fewer requests.

When processing a new request, the consumer checks all providers' active counts. If there is only one invoker with the least active count, it directly returns that invoker:

```
if (leastCount == 1) {
    return invokers.get(leastIndexs[0]);
}
```

If there are multiple invokers with the least active count and their weights are not equal while the total weight is greater than 0, a random weight is generated in the range (0, totalWeight). Finally, the invoker is chosen based on the generated weight.

```
if (! sameWeight && totalWeight > 0) {
    int offsetWeight = random.nextInt(totalWeight);
    for (int i = 0; i < leastCount; i++) {
        int leastIndex = leastIndexs[i];
        offsetWeight -= getWeight(invokers.get(leastIndex), invocation);
        if (offsetWeight <= 0)
            return invokers.get(leastIndex);
    }
}
```

### 4. Consistent Hash Algorithm

Using consistent hashing allows requests with the same parameters to always go to the same provider. When a provider crashes, the requests originally directed to that provider are redistributed to other providers based on virtual nodes without causing drastic changes. For more on the algorithm, refer to: <http://en.wikipedia.org/wiki/Consistent_hashing>.

By default, only the first parameter is hashed. To modify this, configure:

```
<dubbo:parameter key="hash.arguments" value="0,1" />
```

By default, there are 160 virtual nodes. To modify this, configure:

```
<dubbo:parameter key="hash.nodes" value="320" />
```

The consistent hash algorithm can be combined with a caching mechanism. For instance, a service `getUserInfo(String userId)` can be setup to ensure that requests with the same userId are directed to the same provider. This provider can cache user data in memory, reducing the number of accesses to the database or distributed cache. If inconsistency in this data is acceptable for a period in the business context, this approach may be considered to reduce reliance on middleware like databases and caches while also reducing network IO operations and improving system performance. 

## Load Balancing Configuration

If no load balancing strategy is specified, random load balancing is used by default. We can also specify a load balancing strategy explicitly according to our needs. Load balancing can be configured in several places, such as at the provider end, consumer end, service level, method level, etc.

### Server-side Service Level

```
<dubbo:service interface="..." loadbalance="roundrobin" />
```

All methods of this service use round robin load balancing.

### Client-side Service Level

```
<dubbo:reference interface="..." loadbalance="roundrobin" />
```

All methods of this service use round robin load balancing.

### Server-side Method Level

```
<dubbo:service interface="...">
    <dubbo:method name="hello" loadbalance="roundrobin"/>
</dubbo:service>
```

Only the hello method of this service uses round robin load balancing.

### Client-side Method Level

```
<dubbo:reference interface="...">
    <dubbo:method name="hello" loadbalance="roundrobin"/>
</dubbo:reference>
```

Only the hello method of this service uses round robin load balancing.

Similar to Dubbo's other configurations, multiple configurations have an overriding relationship:

1. Method level takes priority, followed by service level, then global configuration.
2. If levels are the same, the consumer takes priority, followed by the provider.

Thus, the priority of the above four configurations is:

1. Client-side method level configuration.
2. Client-side service level configuration.
3. Server-side method level configuration.
4. Server-side service level configuration.

## Extending Load Balancing

The four load balancing implementations in Dubbo can satisfy requirements in most cases. Sometimes, due to business needs, we may need to implement our own load balancing strategy. This chapter only explains how to configure the load balancing algorithm. For more on Dubbo's extension mechanism, please refer to [Practical Extension Mechanism of Dubbo](/en/blog/2019/04/25/dubbo可扩展机制实战/) .

1. Implement the LoadBalance interface, here is Dubbo's LoadBalance interface:

```
@SPI(RandomLoadBalance.NAME)
public interface LoadBalance {
    @Adaptive("loadbalance")
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```

This is the SPI interface; the parameters of the select method are as follows:

- invokers: All service provider lists.
- url: Some configuration information, such as interface name, check flag, serialization method.
- invocation: RPC call information, including method name, method parameter types, and method parameters. Below is a simple implementation of a LoadBalance, choosing the first invoker:

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

2. Add Resource File Add the file: `src/main/resource/META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.LoadBalance`. This is a simple text file. The file content is as follows:

```
demo=my=com.demo.dubbo.DemoLoadBalance
```

3. Configure to use Custom LoadBalance

```
<dubbo:reference id="helloService" interface="com.demo.dubbo.api.IHelloService" loadbalance="demo" />
```

In the consumer end's `dubbo:reference`, configure `<loadbalance="demo">`.

After completing these three steps, we've written a custom LoadBalance and told Dubbo to use it. When Dubbo is started, we can see that it has utilized the custom DemoLoadBalance.

