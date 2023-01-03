---
type: docs
title: "Compiler Extensions"
linkTitle: "Compiler Extensions"
weight: 13
---

## Expansion Description

Java code compiler, used to dynamically generate bytecode to speed up calls.

## Extension ports

`org.apache.dubbo.common.compiler.Compiler`

## Extended configuration

autoload

## Known extensions

* `org.apache.dubbo.common.compiler.support.JdkCompiler`
* `org.apache.dubbo.common.compiler.support.JavassistCompiler`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCompiler.java (implement Compiler interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.compiler.Compiler (plain text file, content: xxx=com.xxx.XxxCompiler)
```

XxxCompiler.java:

```java
package com.xxx;
 
import org.apache.dubbo.common.compiler.Compiler;
 
public class XxxCompiler implements Compiler {
    public Object getExtension(Class<?> type, String name) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.compiler.Compiler:

```properties
xxx=com.xxx.XxxCompiler
```