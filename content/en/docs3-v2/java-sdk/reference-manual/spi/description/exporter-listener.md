---
type: docs
title: "Expose Listener Extension"
linkTitle: "Expose listener extension"
weight: 4
---

## Expansion Description

This event is triggered when a service is exposed.

## Extension ports

`org.apache.dubbo.rpc.ExporterListener`

## Extended configuration

```xml
<!-- Expose service monitoring -->
<dubbo:service listener="xxx,yyy" />
<!-- Expose service default listener -->
<dubbo:provider listener="xxx,yyy" />
```

## Known extensions

`org.apache.dubbo.registry.directory.RegistryExporterListener`

## Extended example

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
        //...
    }
    public void unexported(Exporter<?> exporter) throws RpcException {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.ExporterListener:

```properties
xxx=com.xxx.XxxExporterListener
```