---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/qos-permission/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/qos-permission/
description: QoS Anonymous Access Permission Verification Extension
linkTitle: QoS Anonymous Access Permission Verification Extension
title: QoS Anonymous Access Permission Verification Extension
type: docs
weight: 27
---






## Extension Description

QoS anonymous access permission verification extension point.

## Extension Interface

`org.apache.dubbo.qos.permission.PermissionChecker`

## Extension Configuration


Dubbo QoS `dubbo.application.qos-anonymous-access-permission-level` anonymous access permission verification.

## Default Implementation

`org.apache.dubbo.qos.permission.DefaultAnonymousAccessPermissionChecker`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxPermissionChecker.java (Implementing the PermissionChecker interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.permission.PermissionChecker` (Plain text file, content: qosPermissionChecker=com.xxx.XxxPermissionChecker)
```

XxxPermissionChecker.java:

```java
package com.xxx.qos.permission;

import org.apache.dubbo.qos.permission.PermissionChecker;

public class XxxAnonymousAccessPermissionChecker implements PermissionChecker {

    @Override
    public boolean access(CommandContext commandContext, PermissionLevel defaultCmdRequiredPermissionLevel) {
      // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.qos.permission.PermissionChecker:

```properties
qosPermissionChecker=com.xxx.XxxPermissionChecker
```

