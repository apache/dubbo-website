---
aliases:
    - /zh/docsv2.7/dev/impls/exporter-listener/
description: 暴露监听扩展
linkTitle: 暴露监听扩展
title: 暴露监听扩展
type: docs
weight: 4
---



## 扩展说明

当有服务暴露时，触发该事件。

## 扩展接口

`org.apache.dubbo.rpc.ExporterListener`

## 扩展配置

```xml
<!-- 暴露服务监听 -->
<dubbo:service listener="xxx,yyy" />
<!-- 暴露服务缺省监听器 -->
<dubbo:provider listener="xxx,yyy" />
```

## 已知扩展

`org.apache.dubbo.registry.directory.RegistryExporterListener`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExporterListener.java (实现ExporterListener接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.ExporterListener (纯文本文件，内容为：xxx=com.xxx.XxxExporterListener)
```

XxxExporterListener.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.ExporterListener;
import org.apache.dubbo.rpc.Exporter;
import org.apache.dubbo.rpc.RpcException;
 
 
public class XxxExporterListener implements ExporterListener {
    public void exported(Exporter<?> exporter) throws RpcException {
        // ...
    }
    public void unexported(Exporter<?> exporter) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.ExporterListener：

```properties
xxx=com.xxx.XxxExporterListener
```