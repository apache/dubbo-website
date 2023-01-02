---
type: docs
title: "Container Extension"
linkTitle: "Container Extension"
weight: 22
---

## Expansion Description

Service container extension for custom loading content.

## Extension ports

`org.apache.dubbo.container.Container`

## Extended configuration

```sh
java org.apache.dubbo.container.Main spring jetty log4j
```

## Known extensions

* `org.apache.dubbo.container.spring.SpringContainer`
* `org.apache.dubbo.container.spring.JettyContainer`
* `org.apache.dubbo.container.spring.Log4jContainer`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxContainer.java (implements the Container interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.container.Container (plain text file, content: xxx=com.xxx.XxxContainer)
```

XxxContainer.java:

```java
package com.xxx;
 
org.apache.dubbo.container.Container;
 
 
public class XxxContainer implements Container {
    public Status start() {
        //...
    }
    public Status stop() {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.container.Container:

```properties
xxx=com.xxx.XxxContainer
```