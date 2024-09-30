---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/proxy-factory/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/proxy-factory/
description: Dynamic Proxy Extension
linkTitle: Dynamic Proxy Extension
title: Dynamic Proxy Extension
type: docs
weight: 12
---






## Extension Description

Converts the `Invoker` interface into a business interface.

## Extension Interface

`org.apache.dubbo.rpc.ProxyFactory`

## Extension Configuration

```xml
<dubbo:protocol proxy="xxx" />
<!-- Default configuration, used when the <dubbo:protocol> does not configure the proxy attribute -->
<dubbo:provider proxy="xxx" />
```

## Known Extensions

* `org.apache.dubbo.rpc.proxy.JdkProxyFactory`
* `org.apache.dubbo.rpc.proxy.JavassistProxyFactory`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProxyFactory.java (implements ProxyFactory interface)
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

