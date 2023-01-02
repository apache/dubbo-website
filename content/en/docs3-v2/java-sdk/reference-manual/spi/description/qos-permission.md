---
type: docs
title: "QoS Anonymous Access Verification Extension"
linkTitle: "QoS Anonymous Access Verification Extension"
weight: 27
---

## Expansion Description

QoS anonymous access authentication extension point.

## Extension ports

`org.apache.dubbo.qos.permission.PermissionChecker`

## Extended configuration


Dubbo QoS `dubbo.application.qos-anonymous-access-permission-level` Anonymous access permission verification.

## Default implementation

`org.apache.dubbo.qos.permission.DefaultAnonymousAccessPermissionChecker`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxPermissionChecker.java (implements PermissionChecker interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.permission.PermissionChecker` (plain text file, content: qosPermissionChecker=com.xxx.XxxPermissionChecker)
```

XxxPermissionChecker.java:

```java
package com.xxx.qos.permission;

import org.apache.dubbo.qos.permission.PermissionChecker;

public class XxxAnonymousAccessPermissionChecker implements PermissionChecker {

    @Override
    public boolean access(CommandContext commandContext, PermissionLevel defaultCmdRequiredPermissionLevel) {
      //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.qos.permission.PermissionChecker:

```properties
qosPermissionChecker=com.xxx.XxxPermissionChecker
```