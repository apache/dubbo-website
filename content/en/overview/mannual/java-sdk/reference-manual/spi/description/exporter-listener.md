---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/exporter-listener/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/exporter-listener/
description: Export Listener Extension
linkTitle: Export Listener Extension
title: Export Listener Extension
type: docs
weight: 4
---






## Extension Description

This event is triggered when services are exposed.

## Extension Interface

`org.apache.dubbo.rpc.ExporterListener`

## Extension Configuration

```xml
<!-- Service export listener -->
<dubbo:service listener="xxx,yyy" />
<!-- Default listener for service export -->
<dubbo:provider listener="xxx,yyy" />
```

## Known Extension

`org.apache.dubbo.registry.directory.RegistryExporterListener`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExporterListener.java (implements ExporterListener interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.ExporterListener (plain text file, content: xxx=com.xxx.XxxExporterListener)
```

XxxExporterListener.java:

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

META-INF/dubbo/org.apache.dubbo.rpc.ExporterListener:

```properties
xxx=com.xxx.XxxExporterListener
```

