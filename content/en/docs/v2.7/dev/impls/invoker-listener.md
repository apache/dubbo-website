---
type: docs
title: "InvokerListener Extension"
linkTitle: "InvokerListener"
weight: 3
---

## Summary

Fire event when there's any service referenced.

## Extension Interface

`org.apache.dubbo.rpc.InvokerListener`

## Extension Configuration

```xml
<!-- 引用服务监听 -->
<!-- service reference listener -->
<dubbo:reference listener="xxx,yyy" /> 
<!-- default service reference listener -->
<dubbo:consumer listener="xxx,yyy" /> 
```

## Existing Extension

`org.apache.dubbo.rpc.listener.DeprecatedInvokerListener`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxInvokerListener.java (InvokerListener implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.InvokerListener (plain text file with the content: xxx=com.xxx.XxxInvokerListener)
```

XxxInvokerListener.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.InvokerListener;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxInvokerListener implements InvokerListener {
    public void referred(Invoker<?> invoker) throws RpcException {
        // ...
    }
    public void destroyed(Invoker<?> invoker) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.InvokerListener：

```properties
xxx=com.xxx.XxxInvokerListener
```
