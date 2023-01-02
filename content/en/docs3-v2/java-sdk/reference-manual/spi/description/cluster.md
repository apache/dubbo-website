---
type: docs
title: "Cluster Expansion"
linkTitle: "Cluster Expansion"
weight: 5
---

## Expansion Description

When there are multiple service providers, organize multiple service providers into a cluster and pretend to be one provider.

## Extension ports

`org.apache.dubbo.rpc.cluster.Cluster`

## Extended configuration

```xml
<dubbo:protocol cluster="xxx" />
<!-- Default value configuration, if <dubbo:protocol> is not configured with cluster, use this configuration -->
<dubbo:provider cluster="xxx" />
```

## Known extensions

* `org.apache.dubbo.rpc.cluster.support.wrapper.MockClusterWrapper`
* `org.apache.dubbo.rpc.cluster.support.FailoverCluster`
* `org.apache.dubbo.rpc.cluster.support.FailfastCluster`
* `org.apache.dubbo.rpc.cluster.support.FailsafeCluster`
* `org.apache.dubbo.rpc.cluster.support.FailbackCluster`
* `org.apache.dubbo.rpc.cluster.support.ForkingCluster`
* `org.apache.dubbo.rpc.cluster.support.AvailableCluster`
* `org.apache.dubbo.rpc.cluster.support.MergeableCluster`
* `org.apache.dubbo.rpc.cluster.support.BroadcastCluster`
* `org.apache.dubbo.rpc.cluster.support.registry.ZoneAwareCluster`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCluster.java (implements the Cluster interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Cluster (plain text file, content: xxx=com.xxx.XxxCluster)
```

XxxCluster.java:

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
                //...
            }
        };
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.Cluster:

```properties
xxx=com.xxx.XxxCluster
```