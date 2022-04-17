---
type: docs
title: "Router Extension"
linkTitle: "Router"
weight: 6
---

## Summary

Pick one from service providers and fire the invocation.

## Extension Interface

* `org.apache.dubbo.rpc.cluster.RouterFactory`
* `org.apache.dubbo.rpc.cluster.Router`

## Existing Extension

* `org.apache.dubbo.rpc.cluster.router.ScriptRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.FileRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.config.AppRouterFactory`
* `org.apache.dubbo.rpc.cluster.CacheableRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.ConditionRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.mock.MockRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.config.ServiceRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.tag.TagRouterFactory`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxRouterFactory.java (RouterFactory implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.RouterFactory (plain text file with the content: xxx=com.xxx.XxxRouterFactory)

```

XxxRouterFactory.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.RouterFactory;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxRouterFactory implements RouterFactory {
    public Router getRouter(URL url) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.RouterFactory：

```properties
xxx=com.xxx.XxxRouterFactory
```


