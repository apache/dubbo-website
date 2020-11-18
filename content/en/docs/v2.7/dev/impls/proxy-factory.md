---
type: docs
title: "ProxyFactory Extension"
linkTitle: "ProxyFactory"
weight: 12
---


## Summary

Convert `Invoker` into business interface.

## Extension Interface

`org.apache.dubbo.rpc.ProxyFactory`

## Extension Configuration

```xml
<dubbo:protocol proxy="xxx" />
<!-- default configuration, it will take effect when proxy attribute is not configured in <dubbo:protocol> -->
<dubbo:provider proxy="xxx" />
```

## Existing Extension

* `org.apache.dubbo.rpc.proxy.JdkProxyFactory`
* `org.apache.dubbo.rpc.proxy.JavassistProxyFactory`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProxyFactory.java (ProxyFactory implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.ProxyFactory (plain text file with the content: xxx=com.xxx.XxxProxyFactory)
```

XxxProxyFactory.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.ProxyFactory;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcException;
 
 
public class XxxProxyFactory implements ProxyFactory {
    public <T> T getProxy(Invoker<T> invoker) throws RpcException {
        // ...
    }
    public <T> Invoker<T> getInvoker(T proxy, Class<T> type, URL url) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.ProxyFactory：

```properties
xxx=com.xxx.XxxProxyFactory
```
