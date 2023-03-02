---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/proxy-factory/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/proxy-factory/
description: 动态代理扩展
linkTitle: 动态代理扩展
title: 动态代理扩展
type: docs
weight: 12
---






## 扩展说明

将 `Invoker` 接口转换成业务接口。

## 扩展接口

`org.apache.dubbo.rpc.ProxyFactory`

## 扩展配置

```xml
<dubbo:protocol proxy="xxx" />
<!-- 缺省值配置，当<dubbo:protocol>没有配置proxy属性时，使用此配置 -->
<dubbo:provider proxy="xxx" />
```

## 已知扩展

* `org.apache.dubbo.rpc.proxy.JdkProxyFactory`
* `org.apache.dubbo.rpc.proxy.JavassistProxyFactory`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProxyFactory.java (实现ProxyFactory接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.ProxyFactory (纯文本文件，内容为：xxx=com.xxx.XxxProxyFactory)
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