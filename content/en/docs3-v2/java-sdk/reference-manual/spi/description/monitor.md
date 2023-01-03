---
type: docs
title: "Monitoring Center Extension"
linkTitle: "Monitoring Center Extension"
weight: 10
---

## Expansion Description

Responsible for the monitoring of service call times and call time.

## Extension ports

* `org.apache.dubbo.monitor.MonitorFactory`
* `org.apache.dubbo.monitor.Monitor`

## Extended configuration

```xml
<!-- Define the monitoring center -->
<dubbo:monitor address="xxx://ip:port" />
```

## Known extensions

org.apache.dubbo.monitor.support.dubbo.DubboMonitorFactory

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMonitorFactoryjava (implement the MonitorFactory interface)
                |-XxxMonitor.java (implement Monitor interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.monitor.MonitorFactory (plain text file, content: xxx=com.xxx.XxxMonitorFactory)
```

XxxMonitorFactory.java:

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

XxxMonitor.java:

```java
package com.xxx;
 
import org.apache.dubbo.monitor.Monitor;
 
public class XxxMonitor implements Monitor {
    public void count(URL statistics) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.monitor.MonitorFactory:

```properties
xxx=com.xxx.XxxMonitorFactory
```