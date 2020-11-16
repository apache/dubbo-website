---
type: docs
title: "Cluster Extension"
linkTitle: "Cluster"
weight: 5
---


## Summary

Group service providers in a cluster, and treat them as one single provider.

## Extension Interface

`org.apache.dubbo.rpc.cluster.Cluster`

## Extension Configuration

```xml
<dubbo:protocol cluster="xxx" />
<!-- default configuration, will take affect if cluster attribute is not configured in <dubbo:protocol>  -->
<dubbo:provider cluster="xxx" />
```

## Existing Extensions

* `org.apache.dubbo.rpc.cluster.support.FailoverCluster`
* `org.apache.dubbo.rpc.cluster.support.FailfastCluster`
* `org.apache.dubbo.rpc.cluster.support.FailsafeCluster`
* `org.apache.dubbo.rpc.cluster.support.FailbackCluster`
* `org.apache.dubbo.rpc.cluster.support.ForkingCluster`
* `org.apache.dubbo.rpc.cluster.support.AvailableCluster`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCluster.java (Cluster implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Cluster (plain text file with the content: xxx=com.xxx.XxxCluster)
```

XxxCluster.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.Cluster;
import org.apache.dubbo.rpc.cluster.support.AbstractClusterInvoker;
import org.apache.dubbo.rpc.cluster.Directory;
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxCluster implements Cluster {
    public <T> Invoker<T> merge(Directory<T> directory) throws RpcException {
        return new AbstractClusterInvoker<T>(directory) {
            public Result doInvoke(Invocation invocation, List<Invoker<T>> invokers, LoadBalance loadbalance) throws RpcException {
                // ...
            }
        };
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.Cluster：

```properties
xxx=com.xxx.XxxCluster
```
