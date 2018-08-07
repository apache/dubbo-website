# Router Extension

## Summary

Pick one from service providers and fire the invocation.

## Extension Interface

* `com.alibaba.dubbo.rpc.cluster.RouterFactory`
* `com.alibaba.dubbo.rpc.cluster.Router`

## Existing Extension

* `com.alibaba.dubbo.rpc.cluster.router.ScriptRouterFactory`
* `com.alibaba.dubbo.rpc.cluster.router.FileRouterFactory`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxRouterFactory.java (LoadBalance implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.cluster.RouterFactory (plain text file with the content: xxx=com.xxx.XxxRouterFactory)

```

XxxRouterFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.cluster.RouterFactory;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.Invocation;
import com.alibaba.dubbo.rpc.RpcException;
 
public class XxxRouterFactory implements RouterFactory {
    public <T> List<Invoker<T>> select(List<Invoker<T>> invokers, Invocation invocation) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.RouterFactory：

```properties
xxx=com.xxx.XxxRouterFactory
```


