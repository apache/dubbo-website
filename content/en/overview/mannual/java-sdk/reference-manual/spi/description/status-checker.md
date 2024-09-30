---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/status-checker/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/status-checker/
description: Status Check Extension
linkTitle: Status Check Extension
title: Status Check Extension
type: docs
weight: 21
---






## Extension Description

Checks the status of various resources that the service depends on. This status check can be used for both telnet's status command and hosting's status page.

## Extension Interface

`org.apache.dubbo.common.status.StatusChecker`

## Extension Configuration

```xml
<dubbo:protocol status="xxx,yyy" />
<!-- Default value setting. When the <dubbo:protocol> does not have a status attribute configured, this configuration is used -->
<dubbo:provider status="xxx,yyy" />
```

## Known Extensions

* `org.apache.dubbo.common.status.support.MemoryStatusChecker`
* `org.apache.dubbo.common.status.support.LoadStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ServerStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ThreadPoolStatusChecker`
* `org.apache.dubbo.registry.directory.RegistryStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.SpringStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.DataSourceStatusChecker`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStatusChecker.java (implements StatusChecker interface)
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
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.status.StatusChecker:

```properties
xxx=com.xxx.XxxStatusChecker
```

