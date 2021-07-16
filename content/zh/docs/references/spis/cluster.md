---
type: docs
title: "集群扩展"
linkTitle: "集群扩展"
weight: 5
---

## 扩展说明

当有多个服务提供方时，将多个服务提供方组织成一个集群，并伪装成一个提供方。

## 扩展接口

`org.apache.dubbo.rpc.cluster.Cluster`

## 扩展配置

```xml
<dubbo:protocol cluster="xxx" />
<!-- 缺省值配置，如果<dubbo:protocol>没有配置cluster时，使用此配置 -->
<dubbo:provider cluster="xxx" />
```

## 已知扩展

* `org.apache.dubbo.rpc.cluster.support.FailoverCluster`
* `org.apache.dubbo.rpc.cluster.support.FailfastCluster`
* `org.apache.dubbo.rpc.cluster.support.FailsafeCluster`
* `org.apache.dubbo.rpc.cluster.support.FailbackCluster`
* `org.apache.dubbo.rpc.cluster.support.ForkingCluster`
* `org.apache.dubbo.rpc.cluster.support.AvailableCluster`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCluster.java (实现Cluster接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Cluster (纯文本文件，内容为：xxx=com.xxx.XxxCluster)
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
