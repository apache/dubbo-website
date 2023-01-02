---
type: docs
title: "Reference Listener Extension"
linkTitle: "Reference listener extension"
weight: 3
---

## Expansion Description

This event is triggered when there is a service reference.

## Extension ports

`org.apache.dubbo.rpc.InvokerListener`

## Extended configuration

```xml
<!-- Reference service listener -->
<dubbo:reference listener="xxx,yyy" />
<!-- Reference service default listener -->
<dubbo:consumer listener="xxx,yyy" />
```

## Known extensions

`org.apache.dubbo.rpc.listener.DeprecatedInvokerListener`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxInvokerListener.java (implements the InvokerListener interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.InvokerListener (plain text file, content: xxx=com.xxx.XxxInvokerListener)
```

XxxInvokerListener.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.InvokerListener;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxInvokerListener implements InvokerListener {
    public void referred(Invoker<?> invoker) throws RpcException {
        //...
    }
    public void destroyed(Invoker<?> invoker) throws RpcException {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.InvokerListener:

```properties
xxx=com.xxx.XxxInvokerListener
```