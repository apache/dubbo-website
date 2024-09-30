---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/load-balance/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/load-balance/
description: Load Balance Extension
linkTitle: Load Balance Extension
title: Load Balance Extension
type: docs
weight: 7
---






## Extension Description

Select one from multiple service providers for invocation.

## Extension Interface

`org.apache.dubbo.rpc.cluster.LoadBalance`

## Extension Configuration

```xml
<dubbo:protocol loadbalance="xxx" />
<!-- Default value settings, when <dubbo:protocol> does not configure loadbalance, this configuration is used -->
<dubbo:provider loadbalance="xxx" />
```

## Known Extensions

* `org.apache.dubbo.rpc.cluster.loadbalance.RandomLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.LeastActiveLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.ConsistentHashLoadBalance`
* `org.apache.dubbo.rpc.cluster.loadbalance.ShortestResponseLoadBalance`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoadBalance.java (implements LoadBalance interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.LoadBalance (plain text file, content: xxx=com.xxx.XxxLoadBalance)
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
