---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/status-checker/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/status-checker/
description: 状态检查扩展
linkTitle: 状态检查扩展
title: 状态检查扩展
type: docs
weight: 21
---






## 扩展说明

检查服务依赖各种资源的状态，此状态检查可同时用于 telnet 的 status 命令和 hosting 的 status 页面。

## 扩展接口

`org.apache.dubbo.common.status.StatusChecker`

## 扩展配置

```xml
<dubbo:protocol status="xxx,yyy" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置status属性时，使用此配置 -->
<dubbo:provider status="xxx,yyy" />
```

## 已知扩展

* `org.apache.dubbo.common.status.support.MemoryStatusChecker`
* `org.apache.dubbo.common.status.support.LoadStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ServerStatusChecker`
* `org.apache.dubbo.rpc.dubbo.status.ThreadPoolStatusChecker`
* `org.apache.dubbo.registry.directory.RegistryStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.SpringStatusChecker`
* `org.apache.dubbo.rpc.config.spring.status.DataSourceStatusChecker`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStatusChecker.java (实现StatusChecker接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.status.StatusChecker (纯文本文件，内容为：xxx=com.xxx.XxxStatusChecker)
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