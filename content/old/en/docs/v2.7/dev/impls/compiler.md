---
type: docs
title: "Compiler Extension"
linkTitle: "Compiler"
weight: 13
---

## Summary

Java compiler, used for byte code dynamic generation for RPC invocation.

## Extension Interface

`org.apache.dubbo.common.compiler.Compiler`

## Extension Configuration

No configuration required, the extension will be automatically discovered and loaded.

## Existing Extensions

* `org.apache.dubbo.common.compiler.support.JdkCompiler`
* `org.apache.dubbo.common.compiler.support.JavassistCompiler`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCompiler.java (Compiler implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.compiler.Compiler (plain text file with the content: xxx=com.xxx.XxxCompiler)
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
