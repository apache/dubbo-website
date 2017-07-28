##### 1. 扩展说明

负责服务调用次和调用时间的监控。

##### 2. 扩展接口

* `com.alibaba.dubbo.monitor.MonitorFactory`
* `com.alibaba.dubbo.monitor.Monitor`

##### 3. 扩展配置

```xml
<dubbo:monitor address="xxx://ip:port" /> <!-- 定义监控中心 -->
```

##### 4. 已知扩展

com.alibaba.dubbo.monitor.support.dubbo.DubboMonitorFactory

##### 5. 扩展示例

Maven项目结构

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
                |-com.alibaba.dubbo.monitor.MonitorFactory (纯文本文件，内容为：xxx=com.xxx.XxxMonitorFactory)
```

XxxMonitorFactory.java

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

XxxMonitor.java

```java
package com.xxx;
 
import com.alibaba.dubbo.monitor.Monitor;
 
public class XxxMonitor implements Monitor {
    public void count(URL statistics) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.monitor.MonitorFactory

```
xxx=com.xxx.XxxMonitorFactory
```