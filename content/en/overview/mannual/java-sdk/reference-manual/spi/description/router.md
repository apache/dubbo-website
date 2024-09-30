---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/router/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/router/
description: Router Extensions
linkTitle: Router Extensions
title: Router Extensions
type: docs
weight: 6
---






## Extension Description

Select one from multiple service providers to call.

## Extension Interfaces

* `org.apache.dubbo.rpc.cluster.RouterFactory`
* `org.apache.dubbo.rpc.cluster.Router`

## Known Extensions

* `org.apache.dubbo.rpc.cluster.router.ScriptRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.FileRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.config.AppRouterFactory`
* `org.apache.dubbo.rpc.cluster.CacheableRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.ConditionRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.mock.MockRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.config.ServiceRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.tag.TagRouterFactory`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxRouterFactory.java (implements RouterFactory interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.RouterFactory (plain text file, content: xxx=com.xxx.XxxRouterFactory)

```

XxxRouterFactory.java:

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

META-INF/dubbo/org.apache.dubbo.rpc.cluster.RouterFactory:

```properties
xxx=com.xxx.XxxRouterFactory
```

