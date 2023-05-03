---
aliases:
    - /zh/docs/references/spis/extension-factory/
description: 扩展点加载扩展
linkTitle: 扩展点加载扩展
title: 扩展点加载扩展
type: docs
weight: 11
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/extension-factory/)。
{{% /pageinfo %}}

## 扩展说明

扩展点本身的加载容器，可从不同容器加载扩展点。

## 扩展接口

`org.apache.dubbo.common.extension.ExtensionFactory`

## 扩展配置

```xml
<dubbo:application compiler="jdk" />
```

## 已知扩展

* `org.apache.dubbo.common.extension.factory.SpiExtensionFactory`
* `org.apache.dubbo.config.spring.extension.SpringExtensionFactory`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExtensionFactory.java (实现ExtensionFactory接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.extension.ExtensionFactory (纯文本文件，内容为：xxx=com.xxx.XxxExtensionFactory)
```

XxxExtensionFactory.java：

```java
package com.xxx;
 
import org.apache.dubbo.common.extension.ExtensionFactory;
 
public class XxxExtensionFactory implements ExtensionFactory {
    public Object getExtension(Class<?> type, String name) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.extension.ExtensionFactory：

```properties
xxx=com.xxx.XxxExtensionFactory
```
