# ProxyFactory Extension

## Summary

Convert `Invoker` into business interface.

## Extension Interface

`com.alibaba.dubbo.rpc.ProxyFactory`

## Extension Configuration

```xml
<dubbo:protocol proxy="xxx" />
<!-- default configuration, it will take effect when proxy attribute is not configured in <dubbo:protocol> -->
<dubbo:provider proxy="xxx" />
```

## Existing Extension

* `com.alibaba.dubbo.rpc.proxy.JdkProxyFactory`
* `com.alibaba.dubbo.rpc.proxy.JavassistProxyFactory`

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
                |-com.alibaba.dubbo.rpc.ProxyFactory (plain text file with the content: xxx=com.xxx.XxxProxyFactory)
```

XxxProxyFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.ProxyFactory;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.RpcException;
 
 
public class XxxProxyFactory implements ProxyFactory {
    public <T> T getProxy(Invoker<T> invoker) throws RpcException {
        // ...
    }
    public <T> Invoker<T> getInvoker(T proxy, Class<T> type, URL url) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.ProxyFactory：

```properties
xxx=com.xxx.XxxProxyFactory
```
