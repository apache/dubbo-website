---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/extension-factory/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/extension-factory/
description: Extension Point Loading Extensions
linkTitle: Extension Point Loading Extensions
title: Extension Point Loading Extensions
type: docs
weight: 11
---






## Extension Description

The loading container for extension points, capable of loading extension points from different containers.

## Extension Interface

`org.apache.dubbo.common.extension.ExtensionFactory`

## Extension Configuration

```xml
<dubbo:application compiler="jdk" />
```

## Known Extensions

* `org.apache.dubbo.common.extension.factory.SpiExtensionFactory`
* `org.apache.dubbo.config.spring.extension.SpringExtensionFactory`

## Extension Example

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
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.extension.ExtensionFactory:

```properties
xxx=com.xxx.XxxExtensionFactory
```

