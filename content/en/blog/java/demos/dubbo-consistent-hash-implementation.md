---
title: "Analysis of Dubbo Consistent Hash Load Balancing Implementation"
linkTitle: "Analysis of Dubbo Consistent Hash Load Balancing Implementation"
tags: ["Java"]
date: 2019-05-01
description: >
    This article uses a general consistent hash implementation as a preface to analyze in detail the implementation of Dubbo's consistent hash load balancing algorithm.
---

It should be emphasized that Dubbo's hash mapping model differs from the **circular queue hash mapping model** described in most online materials. For me, the circular queue hash mapping model is not sufficient for a thorough understanding of consistent hashing. It was only after comprehending Dubbo's consistent hash implementation that I felt enlightened.

### 1. Circular Queue Hash Mapping Model

This solution is fundamentally based on the modulus operation. Taking modulo 2^32, the range of hash values is [0, 2^32-1]. The next steps include two parts:

#### **a. Mapping Services**

Service addresses (ip+port) are constructed into specific identifiers (e.g., md5 codes) according to certain rules, and then the identifiers are used to modulo 2^32 to determine the service's corresponding position in the hash value range. Assume we have services Node1, Node2, Node3, the mapping is as follows:

![Init](/imgs/blog/consistenthash/consistent-hash-init-model.jpg)

#### **b. Mapping Requests and Locating Services**

When initiating a request, we often include parameters, which can be used to determine which service to call. Assume there are requests R1, R2, R3, after calculating specific identifiers and modulating, the mapping is as follows:

![Request](/imgs/blog/consistenthash/consistent-hash-request-model.jpg)

From the image, we can see that the R1 request maps between 0-Node1, R2 maps between Node1-Node2, and R3 maps between Node2-Node3. We take the **first service whose hash value is greater than or equal to the request hash value** as the actual service to call. In other words, the R1 request will call Node1 service, the R2 request will call Node2 service, and the R3 request will call Node3 service.

#### **c. Adding Service Nodes**

Assuming a new service Node4 is added, mapped before Node3 and coincidentally disrupts the original mapping:

![New Node](/imgs/blog/consistenthash/consistent-hash-new-node-model.jpg)

Thus, the R3 request will actually call service Node4, while requests R1 and R2 remain unaffected.

#### **d. Deleting Service Nodes**

Assuming service Node2 crashes, the R2 request will map to Node3:

![Delete Node](/imgs/blog/consistenthash/consistent-hash-delete-node-model.jpg)

Original R1 and R3 requests remain unaffected.

> It can be seen that when services are added or deleted, the affected requests are limited. Unlike simple modulo mapping, where changes in services require adjustments to global mappings.

#### **e. Balance and Virtual Nodes**

In our assumptions, we have Node1, Node2, Node3 evenly dividing the circle through hash mapping, resulting in balanced request distribution. However, in reality, calculating service hash values rarely aligns so favorably. Mapping may look something like this:

![Balance](/imgs/blog/consistenthash/consistent-hash-balance-model.jpg)

This would lead to most requests mapped to Node1. Thus, the concept of virtual nodes comes into play.

Virtual nodes are created by not only hashing the service's address but also processing its address (for example, in Dubbo, appending counting symbols 1, 2, 3... to the ip+port string, representing virtual nodes 1, 2, 3) to achieve multiple nodes mapping for the same service. By introducing virtual nodes, request distribution can be made more balanced.

### 2. Using Dubbo Consistent Hash and Introduction of Load Balancing Strategies

#### **a. How to use consistent hash as Dubbo's load balancing strategy?**

The configuration items dubbo:service, dubbo:reference, dubbo:provider, dubbo:consumer, and dubbo:method can all set Dubbo's load balancing strategy, where the property value for consistent hash is **consistenthash**.

Taking dubbo:reference as an example:

**XML Configuration:**

> <dubbo:reference loadbalance="consistenthash" /\>

**Properties Configuration:**

> dubbo.reference.loadbalance=consistenthash

**Annotations:**

> @Reference(loadbalance = "consistenthash")

#### **b. Introduction phase of Dubbo load balancing strategies**

Dubbo implements client-side load balancing. The implementation of service interface proxy classes will not be described in detail here but can be referred to in the official documentation:

> Service introduction: /zh-cn/docs/source_code_guide/refer-service.html

After the interface proxy class is generated and configured, the service invocation process is approximately: proxy -> MockClusterInvoker -> cluster strategy (e.g., FailoverClusterInvoker) -> initialize load balancing strategy -> determine Invoker according to the selected load balancing strategy.

**Load balancing strategy initialization** occurs in the initLoadBalance method of AbstractClusterInvoker:

```java
protected LoadBalance initLoadBalance(List<Invoker<T>> invokers, Invocation invocation) {
    if (CollectionUtils.isNotEmpty(invokers)) {
        return ExtensionLoader.getExtensionLoader(LoadBalance.class).getExtension(invokers.get(0).getUrl()
                .getMethodParameter(RpcUtils.getMethodName(invocation), LOADBALANCE_KEY, DEFAULT_LOADBALANCE));
    } else {
        return ExtensionLoader.getExtensionLoader(LoadBalance.class).getExtension(DEFAULT_LOADBALANCE);
    }
}
```

The logic here is divided into two parts:

1. Retrieve the value of the LOADBALANCE_KEY attribute configured for the calling method; the actual value of LOADBALANCE_KEY is: loadbalance, which is our configured property;

2. Utilize the SPI mechanism to initialize and load the load balancing strategy represented by that value.

All load balancing strategies inherit from the LoadBalance interface. In various cluster strategies, the final call will reach the select method of AbstractClusterInvoker, and AbstractClusterInvoker will call LoadBalance's select method in doSelect, **which begins the execution of the load balancing strategy.**

### 3. Implementation of Dubbo Consistent Hash Load Balancing

One point to clarify is that what I refer to as the **execution of the load balancing strategy** means selecting one from all Providers as the remote call object for the current Consumer. In the code, Providers are encapsulated as Invoker entities, so in direct terms, the execution of the load balancing strategy is selecting an Invoker from the Invoker list.

Thus, comparing with the ordinary consistent hash implementation, Dubbo's consistent hash algorithm can also be divided into two steps:

**1. Mapping Providers to the hash value range (the actual mapping is Invoker);**  

**2. Mapping requests and finding the first Invoker whose hash value is greater than or equal to the request hash value.**

#### **a. Mapping Invokers**

All load balancing implementation classes in Dubbo inherit from AbstractLoadBalance. When calling the select method of LoadBalance, it actually calls the implementation in AbstractLoadBalance:

```java
@Override
public <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) {
    if (CollectionUtils.isEmpty(invokers)) {
        return null;
    }
    if (invokers.size() == 1) {
        return invokers.get(0);
    }
    // doSelect here enters the specific load balancing algorithm execution logic
    return doSelect(invokers, url, invocation);
}
```

From here we see the call to doSelect; the specific implementation class of Dubbo's consistent hash is **ConsistentHashLoadBalance**. Let's see what its doSelect method does:

```java
@Override
protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
    String methodName = RpcUtils.getMethodName(invocation);
    // key format: interface name.method name
    String key = invokers.get(0).getUrl().getServiceKey() + "." + methodName;
    // identityHashCode is used to identify if invokers have changed
    int identityHashCode = System.identityHashCode(invokers);
    ConsistentHashSelector<T> selector = (ConsistentHashSelector<T>) selectors.get(key);
    if (selector == null || selector.identityHashCode != identityHashCode) {
        // If the selector for "interface.method name" does not exist, or if the Invoker list has changed, initialize a new selector
        selectors.put(key, new ConsistentHashSelector<T>(invokers, methodName, identityHashCode));
        selector = (ConsistentHashSelector<T>) selectors.get(key);
    }
    return selector.select(invocation);
}
```

Here is an important concept: **selector**. It is the data structure that carries the entire mapping relationship in Dubbo's consistent hash implementation. It primarily has the following parameters:

```java
/**
 * TreeMap storing the mapping of hash values to nodes
 */
private final TreeMap<Long, Invoker<T>> virtualInvokers;

/**
 * Number of nodes
 */
private final int replicaNumber;

/**
 * Hash code to identify if the Invoker list has changed
 */
private final int identityHashCode;

/**
 * Indices of the parameters used for hash mapping in the request
 */
private final int[] argumentIndex;
```

When initializing the ConsistentHashSelector object, it will traverse all Invoker objects, calculate the md5 code of their addresses (ip+port), and initialize service nodes and all virtual nodes according to the configured number of nodes replicaNumber:

```java
ConsistentHashSelector(List<Invoker<T>> invokers, String methodName, int identityHashCode) {
    this.virtualInvokers = new TreeMap<Long, Invoker<T>>();
    this.identityHashCode = identityHashCode;
    URL url = invokers.get(0).getUrl();
    // Get the configured number of nodes
    this.replicaNumber = url.getMethodParameter(methodName, HASH_NODES, 160);
    // Get the configured indices for parameters used for hash mapping
    String[] index = COMMA_SPLIT_PATTERN.split(url.getMethodParameter(methodName, HASH_ARGUMENTS, "0"));
    argumentIndex = new int[index.length];
    for (int i = 0; i < index.length; i++) {
        argumentIndex[i] = Integer.parseInt(index[i]);
    }
    // Traverse all Invoker objects
    for (Invoker<T> invoker : invokers) {
        // Get Provider's ip+port
        String address = invoker.getUrl().getAddress();
        for (int i = 0; i < replicaNumber / 4; i++) {
            byte[] digest = md5(address + i);
            for (int h = 0; h < 4; h++) {
                long m = hash(digest, h);
                virtualInvokers.put(m, invoker);
            }
        }
    }
}
```

It is worth noting that, using a default value of 160 for replicaNumber, if the currently traversed Invoker address is 127.0.0.1:20880, it will successively obtain the md5 summaries of “127.0.0.1:208800”, “127.0.0.1:208801”, ..., “127.0.0.1:2088040”, and after getting each summary, it will perform four levels of hashing on that summary. The purpose is likely to enhance the hashing effect. (I hope someone can tell me the theoretical basis for this.)

In the code, **virtualInvokers.put(m, invoker)** is where the mapping relationship between the computed hash value and the Invoker is stored.

This code essentially creates replicaNumber nodes for each Invoker, and the mapping relationship of Hash values to Invokers signifies a node, which is stored in the TreeMap.

#### **b. Mapping Requests**

Let's return to the **doSelect** method of ConsistentHashLoadBalance; if no selector is found, a new selector is created, and upon finding the selector, its select method is called:

```java
public Invoker<T> select(Invocation invocation) {
    // Determine key based on invocation's [parameter value], default uses the first parameter for hash calculation
    String key = toKey(invocation.getArguments());
    // Get [parameter value]'s md5 encoding
    byte[] digest = md5(key);
    return selectForKey(hash(digest, 0));
}

// Get parameters based on indices and concatenate all parameters into a string
private String toKey(Object[] args) {
    StringBuilder buf = new StringBuilder();
    for (int i : argumentIndex) {
        if (i >= 0 && i < args.length) {
            buf.append(args[i]);
        }
    }
    return buf.toString();
}

// Find Invoker based on the md5 encoding of the parameter string
private Invoker<T> selectForKey(long hash) {
    Map.Entry<Long, Invoker<T>> entry = virtualInvokers.ceilingEntry(hash);
    if (entry == null) {
        entry = virtualInvokers.firstEntry();
    }
    return entry.getValue();
}
```

argumentIndex is initialized at the same time as the Selector, representing which request parameters are used for hash mapping to obtain the Invoker. For example, with the method methodA(Integer a, Integer b, Integer c), if the value of argumentIndex is {0,2}, the hash value is calculated using the concatenated string of a and c.

We know that virtualInvokers is a TreeMap, and the underlying implementation of TreeMap is a red-black tree. The role of the ceilingEntry(hash) method in TreeMap is to **retrieve the first element that is greater than or equal to the input value**. As seen, this is identical to the handling logic of a general consistent hash algorithm.

However, the wrap-around logic here is slightly different. For modulo operations, exceeding the maximum value automatically wraps back to 0, while here, the logic is: if there are no elements greater than the value input in the ceilingEntry() method, virtualInvokers.ceilingEntry(hash) will definitely yield null, so virtualInvokers.firstEntry() is used to get the first element of the entire TreeMap.

After obtaining the Invoker from selectForKey, the load balancing strategy execution is considered complete. The subsequent processes for obtaining remote calling clients and other invocation processes are omitted.

