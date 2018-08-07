# InvokerListener Extension

## Summary

Fire event when there's any service referenced.

## Extension Interface

`com.alibaba.dubbo.rpc.InvokerListener`

## Extension Configuration

```xml
<!-- 引用服务监听 -->
<!-- service reference listener -->
<dubbo:reference listener="xxx,yyy" /> 
<!-- default service reference listener -->
<dubbo:consumer listener="xxx,yyy" /> 
```

## Existing Extension

`com.alibaba.dubbo.rpc.listener.DeprecatedInvokerListener`

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
                |-com.alibaba.dubbo.rpc.InvokerListener (plain text file with the content: xxx=com.xxx.XxxInvokerListener)
```

XxxInvokerListener.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.InvokerListener;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.RpcException;
 
public class XxxInvokerListener implements InvokerListener {
    public void referred(Invoker<?> invoker) throws RpcException {
        // ...
    }
    public void destroyed(Invoker<?> invoker) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.InvokerListener：

```properties
xxx=com.xxx.XxxInvokerListener
```
