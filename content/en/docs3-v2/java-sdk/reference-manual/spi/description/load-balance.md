---
type: docs
title: "Load Balancing Extension"
linkTitle: "Load Balancing Extension"
weight: 7
---

## Expansion Description

Select one of multiple service providers to call

## Extension ports

`org.apache.dubbo.rpc.cluster.LoadBalance`

## Extended configuration

```xml
<dubbo:protocol loadbalance="xxx" />
<!-- Default value setting, when <dubbo:protocol> does not configure loadbalance, use this configuration -->
<dubbo:provider loadbalance="xxx" />
```

## Known extensions

* `org.apache.dubbo.rpc.cluster.loadbalance.RandomLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.LeastActiveLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.ConsistentHashLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.ShortestResponseLoadBalance`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoadBalance.java (implements the LoadBalance interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.LoadBalance (plain text file, content: xxx=com.xxx.XxxLoadBalance)
```

XxxLoadBalance.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxLoadBalance implements LoadBalance {
    public <T> Invoker<T> select(List<Invoker<T>> invokers, Invocation invocation) throws RpcException {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.LoadBalance:

```properties
xxx=com.xxx.XxxLoadBalance
```