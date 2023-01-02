---
type: docs
title: "Dynamic Proxy Extension"
linkTitle: "Dynamic proxy extension"
weight: 12
---

## Expansion Description

Convert the `Invoker` interface into a business interface.

## Extension ports

`org.apache.dubbo.rpc.ProxyFactory`

## Extended configuration

```xml
<dubbo:protocol proxy="xxx" />
<!-- Default value configuration, when <dubbo:protocol> does not configure proxy attribute, use this configuration -->
<dubbo:provider proxy="xxx" />
```

## Known extensions

* `org.apache.dubbo.rpc.proxy.JdkProxyFactory`
* `org.apache.dubbo.rpc.proxy.JavassistProxyFactory`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProxyFactory.java (implement ProxyFactory interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.ProxyFactory (plain text file, content: xxx=com.xxx.XxxProxyFactory)
```

XxxProxyFactory.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.ProxyFactory;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcException;
 
 
public class XxxProxyFactory implements ProxyFactory {
    public <T> T getProxy(Invoker<T> invoker) throws RpcException {
        //...
    }
    public <T> Invoker<T> getInvoker(T proxy, Class<T> type, URL url) throws RpcException {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.ProxyFactory:

```properties
xxx=com.xxx.XxxProxyFactory
```