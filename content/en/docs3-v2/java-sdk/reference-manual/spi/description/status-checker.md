---
type: docs
title: "Status Check Extension"
linkTitle: "Status Check Extension"
weight: 21
---

## Expansion Description

Check the status of various resources that the service relies on. This status check can be used for both telnet's status command and hosting's status page.

## Extension ports

`org.apache.dubbo.common.status.StatusChecker`

## Extended configuration

```xml
<dubbo:protocol status="xxx,yyy" />
<!-- The default value setting, when <dubbo:protocol> does not configure the status attribute, use this configuration -->
<dubbo:provider status="xxx,yyy" />
```

## Known extensions

* `org.apache.dubbo.common.status.support.MemoryStatusChecker`
* `org.apache.dubbo.common.status.support.LoadStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ServerStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ThreadPoolStatusChecker`
* `org.apache.dubbo.registry.directory.RegistryStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.SpringStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.DataSourceStatusChecker`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStatusChecker.java (implement StatusChecker interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.status.StatusChecker (plain text file, content: xxx=com.xxx.XxxStatusChecker)
```

XxxStatusChecker.java:

```java
package com.xxx;
 
import org.apache.dubbo.common.status.StatusChecker;
 
public class XxxStatusChecker implements StatusChecker {
    public Status check() {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.status.StatusChecker:

```properties
xxx=com.xxx.XxxStatusChecker
```