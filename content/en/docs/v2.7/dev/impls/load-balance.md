---
type: docs
title: "LoadBalance Extension"
linkTitle: "LoadBalance"
weight: 7
---

## Summary

Pick one from service providers and fire the invocation.

## Extension Interface

`org.apache.dubbo.rpc.cluster.LoadBalance`

## Extension Configuration

```xml
<dubbo:protocol loadbalance="xxx" />
<!-- default configuration, will take effect when loadbalance is not configured in <dubbo:protocol> -->
<dubbo:provider loadbalance="xxx" />
```

## Existing Extension

* `org.apache.dubbo.rpc.cluster.loadbalance.RandomLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.LeastActiveLoadBalance`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoadBalance.java (LoadBalance implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.LoadBalance (plain text file with the content: xxx=com.xxx.XxxLoadBalance)
```

XxxLoadBalance.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.RpcException; 
 
public class XxxLoadBalance implements LoadBalance {
    public <T> Invoker<T> select(List<Invoker<T>> invokers, Invocation invocation) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.LoadBalance：

```properties
xxx=com.xxx.XxxLoadBalance
```
