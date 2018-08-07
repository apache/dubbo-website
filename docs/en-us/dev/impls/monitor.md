# Monitor Extension

## Summary

Extension to monitor service invocation times and time taken for each service invocation.

## Extension Interface

* `com.alibaba.dubbo.monitor.MonitorFactory`
* `com.alibaba.dubbo.monitor.Monitor`

## Extension Configuration

```xml
<!-- configure monitor center -->
<dubbo:monitor address="xxx://ip:port" />
```

## Existing Extension

com.alibaba.dubbo.monitor.support.dubbo.DubboMonitorFactory

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
                |-com.alibaba.dubbo.monitor.MonitorFactory (plain text file with the format: xxx=com.xxx.XxxMonitorFactory)
```

XxxMonitorFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.monitor.MonitorFactory;
import com.alibaba.dubbo.monitor.Monitor;
import com.alibaba.dubbo.common.URL;
 
public class XxxMonitorFactory implements MonitorFactory {
    public Monitor getMonitor(URL url) {
        return new XxxMonitor(url);
    }
}
```

XxxMonitor.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.monitor.Monitor;
 
public class XxxMonitor implements Monitor {
    public void count(URL statistics) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.monitor.MonitorFactory：

```properties
xxx=com.xxx.XxxMonitorFactory
```