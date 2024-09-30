---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/container/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/container/
description: Container Extension
linkTitle: Container Extension
title: Container Extension
type: docs
weight: 22
---






## Extension Description

Service container extension for customizing loading content.

## Extension Interface

`org.apache.dubbo.container.Container`

## Extension Configuration

```sh
java org.apache.dubbo.container.Main spring jetty log4j
```

## Known Extensions

* `org.apache.dubbo.container.spring.SpringContainer`
* `org.apache.dubbo.container.spring.JettyContainer`
* `org.apache.dubbo.container.spring.Log4jContainer`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxContainer.java (implements Container interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.container.Container (plain text file, content: xxx=com.xxx.XxxContainer)
```

XxxContainer.java：

```java
package com.xxx;
 
org.apache.dubbo.container.Container;
 
 
public class XxxContainer implements Container {
    public Status start() {
        // ...
    }
    public Status stop() {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.container.Container：

```properties
xxx=com.xxx.XxxContainer
```

