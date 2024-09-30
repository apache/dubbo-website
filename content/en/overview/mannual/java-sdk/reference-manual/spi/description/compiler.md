---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/compiler/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/compiler/
description: Compiler Extension
linkTitle: Compiler Extension
title: Compiler Extension
type: docs
weight: 13
---






## Extension Description

Java code compiler for dynamically generating bytecode to accelerate calls.

## Extension Interface

`org.apache.dubbo.common.compiler.Compiler`

## Extension Configuration

Automatically loaded

## Known Extensions

* `org.apache.dubbo.common.compiler.support.JdkCompiler`
* `org.apache.dubbo.common.compiler.support.JavassistCompiler`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCompiler.java (implements Compiler interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.compiler.Compiler (text file containing: xxx=com.xxx.XxxCompiler)
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

