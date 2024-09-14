---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/invoker-listener/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/invoker-listener/
description: 引用监听扩展
linkTitle: 引用监听扩展
title: 引用监听扩展
type: docs
weight: 3
---






## 扩展说明

当有服务引用时，触发该事件。

## 扩展接口

`org.apache.dubbo.rpc.InvokerListener`

## 扩展配置

```xml
<!-- 引用服务监听 -->
<dubbo:reference listener="xxx,yyy" /> 
<!-- 引用服务缺省监听器 -->
<dubbo:consumer listener="xxx,yyy" /> 
```

## 已知扩展

`org.apache.dubbo.rpc.listener.DeprecatedInvokerListener`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxInvokerListener.java (实现InvokerListener接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.InvokerListener (纯文本文件，内容为：xxx=com.xxx.XxxInvokerListener)
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