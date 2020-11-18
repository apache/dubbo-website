---
type: docs
title: "StatusChecker Extension"
linkTitle: "StatusChecker"
weight: 21
---

## Summary

Extension to check status of resources service depends on. This status checker can be used in both telnet status command and status page.

## Extension Interface

`org.apache.dubbo.common.status.StatusChecker`

## Extension Configuration

```xml
<dubbo:protocol status="xxx,yyy" />
<!-- default configuration, will take effect if no status attribute is configured in <dubbo:protocol> -->
<dubbo:provider status="xxx,yyy" />
```

## Existing Extension

* `org.apache.dubbo.common.status.support.MemoryStatusChecker`
* `org.apache.dubbo.common.status.support.LoadStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ServerStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ThreadPoolStatusChecker`
* `org.apache.dubbo.registry.directory.RegistryStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.SpringStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.DataSourceStatusChecker`

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
                |-org.apache.dubbo.common.status.StatusChecker (plain text file with the content: xxx=com.xxx.XxxStatusChecker)
```

XxxStatusChecker.java：

```java
package com.xxx;
 
import org.apache.dubbo.common.status.StatusChecker;
 
public class XxxStatusChecker implements StatusChecker {
    public Status check() {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.status.StatusChecker：

```properties
xxx=com.xxx.XxxStatusChecker
```
