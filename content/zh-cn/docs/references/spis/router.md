---
aliases:
    - /zh/docs/references/spis/router/
description: 路由扩展
linkTitle: 路由扩展
title: 路由扩展
type: docs
weight: 6
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/router/)。
{{% /pageinfo %}}

## 扩展说明

从多个服务提供方中选择一个进行调用。

## 扩展接口

* `org.apache.dubbo.rpc.cluster.RouterFactory`
* `org.apache.dubbo.rpc.cluster.Router`

## 已知扩展

* `org.apache.dubbo.rpc.cluster.router.ScriptRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.FileRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.config.AppRouterFactory`
* `org.apache.dubbo.rpc.cluster.CacheableRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.ConditionRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.mock.MockRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.condition.config.ServiceRouterFactory`
* `org.apache.dubbo.rpc.cluster.router.tag.TagRouterFactory`

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
    public Router getRouter(URL url) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.cluster.RouterFactory：

```properties
xxx=com.xxx.XxxRouterFactory
```
