---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/cluster/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/cluster/
description: Cluster extension
linkTitle: Cluster extension
title: Cluster extension
type: docs
weight: 5
---






## Extension Description

When there are multiple service providers, organize them into a cluster and masquerade as a single provider.

## Extension Interface

`org.apache.dubbo.rpc.cluster.Cluster`

## Extension Configuration

```xml
<dubbo:protocol cluster="xxx" />
<!-- Default configuration; if <dubbo:protocol> does not configure cluster, this configuration will be used -->
<dubbo:provider cluster="xxx" />
```

## Known Extensions

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

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCluster.java (implements Cluster interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Cluster (plain text file with content: xxx=com.xxx.XxxCluster)
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
                // ...
            }
        };
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.Cluster:

```properties
xxx=com.xxx.XxxCluster
```

