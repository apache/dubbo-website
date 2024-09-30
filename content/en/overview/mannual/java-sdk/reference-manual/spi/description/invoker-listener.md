---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/invoker-listener/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/invoker-listener/
description: Invoker Listener Extension
linkTitle: Invoker Listener Extension
title: Invoker Listener Extension
type: docs
weight: 3
---






## Extension Description

This event is triggered when there is a service reference.

## Extension Interface

`org.apache.dubbo.rpc.InvokerListener`

## Extension Configuration

```xml
<!-- Reference Service Listener -->
<dubbo:reference listener="xxx,yyy" /> 
<!-- Default Listener for Reference Services -->
<dubbo:consumer listener="xxx,yyy" /> 
```

## Known Extensions

`org.apache.dubbo.rpc.listener.DeprecatedInvokerListener`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxInvokerListener.java (implements InvokerListener interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.InvokerListener (text file containing: xxx=com.xxx.XxxInvokerListener)
```

XxxInvokerListener.java:

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

META-INF/dubbo/org.apache.dubbo.rpc.InvokerListener:

```properties
xxx=com.xxx.XxxInvokerListener
```

