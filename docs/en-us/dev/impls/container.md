# Container Extension

## Summary

Service container extension, useful for loading custom contents.

## Extension Interface

`com.alibaba.dubbo.container.Container`

## Extension Configuration

```sh
java com.alibaba.dubbo.container.Main spring jetty log4j
```

## Existing Extensions

* `com.alibaba.dubbo.container.spring.SpringContainer`
* `com.alibaba.dubbo.container.spring.JettyContainer`
* `com.alibaba.dubbo.container.spring.Log4jContainer`

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
                |-com.alibaba.dubbo.container.Container (plain text file with the content: xxx=com.xxx.XxxContainer)
```

XxxContainer.java：

```java
package com.xxx;
 
com.alibaba.dubbo.container.Container;
 
 
public class XxxContainer implements Container {
    public Status start() {
        // ...
    }
    public Status stop() {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.container.Container：

```properties
xxx=com.xxx.XxxContainer
```
