---
type: docs
title: "Extension Point Load Extension"
linkTitle: "Extension point load extension"
weight: 11
---

## Expansion Description

The loading container of the extension point itself, which can load the extension point from different containers.

## Extension ports

`org.apache.dubbo.common.extension.ExtensionFactory`

## Extended configuration

```xml
<dubbo:application compiler="jdk" />
```

## Known extensions

* `org.apache.dubbo.common.extension.factory.SpiExtensionFactory`
* `org.apache.dubbo.config.spring.extension.SpringExtensionFactory`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExtensionFactory.java (implements ExtensionFactory interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.extension.ExtensionFactory (plain text file, content: xxx=com.xxx.XxxExtensionFactory)
```

XxxExtensionFactory.java:

```java
package com.xxx;
 
import org.apache.dubbo.common.extension.ExtensionFactory;
 
public class XxxExtensionFactory implements ExtensionFactory {
    public Object getExtension(Class<?> type, String name) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.extension.ExtensionFactory:

```properties
xxx=com.xxx.XxxExtensionFactory
```