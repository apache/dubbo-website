---
aliases:
    - /zh/docs/references/spis/compiler/
description: 编译器扩展
linkTitle: 编译器扩展
title: 编译器扩展
type: docs
weight: 13
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/compiler/)。
{{% /pageinfo %}}

## 扩展说明

Java 代码编译器，用于动态生成字节码，加速调用。

## 扩展接口

`org.apache.dubbo.common.compiler.Compiler`

## 扩展配置

自动加载

## 已知扩展

* `org.apache.dubbo.common.compiler.support.JdkCompiler`
* `org.apache.dubbo.common.compiler.support.JavassistCompiler`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCompiler.java (实现Compiler接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.compiler.Compiler (纯文本文件，内容为：xxx=com.xxx.XxxCompiler)
```

XxxCompiler.java：

```java
package com.xxx;
 
import org.apache.dubbo.common.compiler.Compiler;
 
public class XxxCompiler implements Compiler {
    public Object getExtension(Class<?> type, String name) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.compiler.Compiler：

```properties
xxx=com.xxx.XxxCompiler
```
