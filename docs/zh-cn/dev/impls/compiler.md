# 编译器扩展

## 扩展说明

Java 代码编译器，用于动态生成字节码，加速调用。

## 扩展接口

`com.alibaba.dubbo.common.compiler.Compiler`

## 扩展配置

自动加载

## 已知扩展

* `com.alibaba.dubbo.common.compiler.support.JdkCompiler`
* `com.alibaba.dubbo.common.compiler.support.JavassistCompiler`

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
                |-com.alibaba.dubbo.common.compiler.Compiler (纯文本文件，内容为：xxx=com.xxx.XxxCompiler)
```

XxxCompiler.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.common.compiler.Compiler;
 
public class XxxCompiler implements Compiler {
    public Object getExtension(Class<?> type, String name) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.common.compiler.Compiler：

```properties
xxx=com.xxx.XxxCompiler
```
