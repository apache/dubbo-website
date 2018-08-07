# StatusChecker Extension

## Summary

Extension to check status of resources service depends on. This status checker can be used in both telnet status command and status page.

## Extension Interface

`com.alibaba.dubbo.common.status.StatusChecker`

## Extension Configuration

```xml
<dubbo:protocol status="xxx,yyy" />
<!-- default configuration, will take effect if no status attribute is configured in <dubbo:protocol> -->
<dubbo:provider status="xxx,yyy" />
```

## Existing Extension

* `com.alibaba.dubbo.common.status.support.MemoryStatusChecker`
* `com.alibaba.dubbo.common.status.support.LoadStatusChecker`
* `com.alibaba.dubbo.rpc.dubbo.status.ServerStatusChecker`
* `com.alibaba.dubbo.rpc.dubbo.status.ThreadPoolStatusChecker`
* `com.alibaba.dubbo.registry.directory.RegistryStatusChecker`
* `com.alibaba.dubbo.rpc.config.spring.status.SpringStatusChecker`
* `com.alibaba.dubbo.rpc.config.spring.status.DataSourceStatusChecker`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStatusChecker.java (StatusChecker implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.common.status.StatusChecker (plain text file with the content: xxx=com.xxx.XxxStatusChecker)
```

XxxStatusChecker.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.common.status.StatusChecker;
 
public class XxxStatusChecker implements StatusChecker {
    public Status check() {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.common.status.StatusChecker：

```properties
xxx=com.xxx.XxxStatusChecker
```
