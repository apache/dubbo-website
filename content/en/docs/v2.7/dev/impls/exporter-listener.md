---
type: docs
title: "ExporterListener Extension"
linkTitle: "ExporterListener"
weight: 4
---

## Summary

Fire events when there's any service exported. 

## Extension Interface

`org.apache.dubbo.rpc.ExporterListener`

## Extension Configuration

```xml
<!-- service exporter listener -->
<dubbo:service listener="xxx,yyy" />
<!-- default exporter listener for service provider -->
<dubbo:provider listener="xxx,yyy" />
```

## Existing Extension

`org.apache.dubbo.registry.directory.RegistryExporterListener`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExporterListener.java (ExporterListener implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.ExporterListener (plain text file with the content: xxx=com.xxx.XxxExporterListener)
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

