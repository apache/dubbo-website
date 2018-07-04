# Cluster Extension

## Summary

Group service providers in a cluster, and treat them as one single provider.

## Extension Interface

`com.alibaba.dubbo.rpc.cluster.Cluster`

## Extension Configuration

```xml
<dubbo:protocol cluster="xxx" />
<!-- default configuration, will take affect if cluster attribute is not configured in <dubbo:protocol>  -->
<dubbo:provider cluster="xxx" />
```

## Existing Extensions

* `com.alibaba.dubbo.rpc.cluster.support.FailoverCluster`
* `com.alibaba.dubbo.rpc.cluster.support.FailfastCluster`
* `com.alibaba.dubbo.rpc.cluster.support.FailsafeCluster`
* `com.alibaba.dubbo.rpc.cluster.support.FailbackCluster`
* `com.alibaba.dubbo.rpc.cluster.support.ForkingCluster`
* `com.alibaba.dubbo.rpc.cluster.support.AvailableCluster`

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
                |-com.alibaba.dubbo.rpc.cluster.Cluster (plain text file with the content: xxx=com.xxx.XxxCluster)
```

XxxCluster.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.cluster.Cluster;
import com.alibaba.dubbo.rpc.cluster.support.AbstractClusterInvoker;
import com.alibaba.dubbo.rpc.cluster.Directory;
import com.alibaba.dubbo.rpc.cluster.LoadBalance;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.Invocation;
import com.alibaba.dubbo.rpc.Result;
import com.alibaba.dubbo.rpc.RpcException;
 
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

META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.Cluster：

```properties
xxx=com.xxx.XxxCluster
```
