# ExtensionFactory Extension

## Summary

Factory to load dubbo extensions.

## Extension Interface

`com.alibaba.dubbo.common.extension.ExtensionFactory`

## Extension Configuration

```xml
<dubbo:application compiler="jdk" />
```

## Existing Extension

* `com.alibaba.dubbo.common.extension.factory.SpiExtensionFactory`
* `com.alibaba.dubbo.config.spring.extension.SpringExtensionFactory`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExtensionFactory.java (ExtensionFactory implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.common.extension.ExtensionFactory (plain text file with the content: xxx=com.xxx.XxxExtensionFactory)
```

XxxExtensionFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.common.extension.ExtensionFactory;
 
public class XxxExtensionFactory implements ExtensionFactory {
    public Object getExtension(Class<?> type, String name) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.common.extension.ExtensionFactory：

```properties
xxx=com.xxx.XxxExtensionFactory
```
