# LoadBalance Extension

## Summary

Pick one from service providers and fire the invocation.

## Extension Interface

`com.alibaba.dubbo.rpc.cluster.LoadBalance`

## Extension Configuration

```xml
<dubbo:protocol loadbalance="xxx" />
<!-- default configuration, will take effect when loadbalance is not configured in <dubbo:protocol> -->
<dubbo:provider loadbalance="xxx" />
```

## Existing Extension

* `com.alibaba.dubbo.rpc.cluster.loadbalance.RandomLoadBalance`
* `com.alibaba.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance`
* `com.alibaba.dubbo.rpc.cluster.loadbalance.LeastActiveLoadBalance`

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
                |-com.alibaba.dubbo.rpc.cluster.LoadBalance (plain text file with the content: xxx=com.xxx.XxxLoadBalance)
```

XxxLoadBalance.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.cluster.LoadBalance;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.Invocation;
import com.alibaba.dubbo.rpc.RpcException; 
 
public class XxxLoadBalance implements LoadBalance {
    public <T> Invoker<T> select(List<Invoker<T>> invokers, Invocation invocation) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.LoadBalance：

```properties
xxx=com.xxx.XxxLoadBalance
```
