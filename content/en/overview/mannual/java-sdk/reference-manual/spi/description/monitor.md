---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/monitor/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/monitor/
description: 监控中心扩展
linkTitle: 监控中心扩展
title: 监控中心扩展
type: docs
weight: 10
---






## 扩展说明

负责服务调用次和调用时间的监控。

## 扩展接口

* `org.apache.dubbo.monitor.MonitorFactory`
* `org.apache.dubbo.monitor.Monitor`

## 扩展配置

```xml
<!-- 定义监控中心 -->
<dubbo:monitor address="xxx://ip:port" />
```

## 已知扩展

org.apache.dubbo.monitor.support.dubbo.DubboMonitorFactory

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxMonitorFactoryjava (实现MonitorFactory接口)
                |-XxxMonitor.java (实现Monitor接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.monitor.MonitorFactory (纯文本文件，内容为：xxx=com.xxx.XxxMonitorFactory)
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