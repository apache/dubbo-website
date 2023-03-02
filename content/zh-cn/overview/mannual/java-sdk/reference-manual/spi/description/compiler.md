---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/compiler/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/compiler/
description: 编译器扩展
linkTitle: 编译器扩展
title: 编译器扩展
type: docs
weight: 13
---






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