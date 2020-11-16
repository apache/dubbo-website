---
type: docs
title: "Monitor Extension"
linkTitle: "Monitor"
weight: 10
---

## Summary

Extension to monitor service invocation times and time taken for each service invocation.

## Extension Interface

* `org.apache.dubbo.monitor.MonitorFactory`
* `org.apache.dubbo.monitor.Monitor`

## Extension Configuration

```xml
<!-- configure monitor center -->
<dubbo:monitor address="xxx://ip:port" />
```

## Existing Extension

org.apache.dubbo.monitor.support.dubbo.DubboMonitorFactory

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMonitorFactoryjava (MonitorFactory implementation)
                |-XxxMonitor.java (Monitor implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.monitor.MonitorFactory (plain text file with the format: xxx=com.xxx.XxxMonitorFactory)
```

XxxMonitorFactory.java：

```java
package com.xxx;
 
import org.apache.dubbo.monitor.MonitorFactory;
import org.apache.dubbo.monitor.Monitor;
import org.apache.dubbo.common.URL;
 
public class XxxMonitorFactory implements MonitorFactory {
    public Monitor getMonitor(URL url) {
        return new XxxMonitor(url);
    }
}
```

XxxMonitor.java：

```java
package com.xxx;
 
import org.apache.dubbo.monitor.Monitor;
 
public class XxxMonitor implements Monitor {
    public void count(URL statistics) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.monitor.MonitorFactory：

```properties
xxx=com.xxx.XxxMonitorFactory
```