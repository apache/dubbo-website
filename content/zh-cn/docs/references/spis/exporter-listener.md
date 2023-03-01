---
aliases:
    - /zh/docs/references/spis/exporter-listener/
description: 暴露监听扩展
linkTitle: 暴露监听扩展
title: 暴露监听扩展
type: docs
weight: 4
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/exporter-listener/)。
{{% /pageinfo %}}

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
