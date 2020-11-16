---
type: docs
title: "路由扩展"
linkTitle: "路由扩展"
weight: 6
---

## 扩展说明

从多个服务提供方中选择一个进行调用。

## 扩展接口

* `org.apache.dubbo.rpc.cluster.RouterFactory`
* `org.apache.dubbo.rpc.cluster.Router`

## 已知扩展

* `org.apache.dubbo.rpc.cluster.router.ScriptRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.FileRouterFactory`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxRouterFactory.java (实现RouterFactory接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.RouterFactory (纯文本文件，内容为：xxx=com.xxx.XxxRouterFactory)

```

XxxRouterFactory.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.RouterFactory;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxRouterFactory implements RouterFactory {
    public <T> List<Invoker<T>> select(List<Invoker<T>> invokers, Invocation invocation) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.RouterFactory：

```properties
xxx=com.xxx.XxxRouterFactory
```


