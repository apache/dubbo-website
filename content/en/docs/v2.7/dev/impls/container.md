---
type: docs
title: "Container Extension"
linkTitle: "Container"
weight: 22
---


## Summary

Service container extension, useful for loading custom contents.

## Extension Interface

`org.apache.dubbo.container.Container`

## Extension Configuration

```sh
java org.apache.dubbo.container.Main spring jetty log4j
```

## Existing Extensions

* `org.apache.dubbo.container.spring.SpringContainer`
* `org.apache.dubbo.container.spring.JettyContainer`
* `org.apache.dubbo.container.spring.Log4jContainer`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxContainer.java (Container implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.container.Container (plain text file with the content: xxx=com.xxx.XxxContainer)
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
