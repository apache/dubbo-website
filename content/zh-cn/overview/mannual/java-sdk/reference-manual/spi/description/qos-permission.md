---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/qos-permission/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/qos-permission/
description: QoS匿名访问权限验证扩展
linkTitle: QoS匿名访问权限验证扩展
title: QoS匿名访问权限验证扩展
type: docs
weight: 27
---






## 扩展说明

QoS匿名访问权限验证扩展点。

## 扩展接口

`org.apache.dubbo.qos.permission.PermissionChecker`

## 扩展配置


Dubbo QoS `dubbo.application.qos-anonymous-access-permission-level` 匿名访问权限校验。

## 默认实现

`org.apache.dubbo.qos.permission.DefaultAnonymousAccessPermissionChecker`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxPermissionChecker.java (实现PermissionChecker接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.permission.PermissionChecker` (纯文本文件，内容为：qosPermissionChecker=com.xxx.XxxPermissionChecker)
```

XxxPermissionChecker.java：

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

META-INF/dubbo/org.apache.dubbo.qos.permission.PermissionChecker：

```properties
qosPermissionChecker=com.xxx.XxxPermissionChecker
```