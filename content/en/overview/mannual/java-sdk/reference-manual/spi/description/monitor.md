---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/monitor/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/monitor/
description: Monitoring Center Extension
linkTitle: Monitoring Center Extension
title: Monitoring Center Extension
type: docs
weight: 10
---






## Extension Description

Responsible for monitoring service call counts and call times.

## Extension Interfaces

* `org.apache.dubbo.monitor.MonitorFactory`
* `org.apache.dubbo.monitor.Monitor`

## Extension Configuration

```xml
<!-- Define the monitoring center -->
<dubbo:monitor address="xxx://ip:port" />
```

## Known Extensions

org.apache.dubbo.monitor.support.dubbo.DubboMonitorFactory

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMonitorFactory.java (implements the MonitorFactory interface)
                |-XxxMonitor.java (implements the Monitor interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.monitor.MonitorFactory (text file, content: xxx=com.xxx.XxxMonitorFactory)
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

