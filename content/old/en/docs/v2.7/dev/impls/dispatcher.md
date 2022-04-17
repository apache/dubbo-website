---
type: docs
title: "Dispatcher Extension"
linkTitle: "Dispatcher"
weight: 14
---

## Summary

Thread pool dispatch strategy.

## Extension Interface

`org.apache.dubbo.remoting.Dispatcher`

## Extension Configuration

```xml
<dubbo:protocol dispatcher="xxx" />
<!-- default configuration, will take effect if dispatcher attribute is not set in <dubbo:protocol> -->
<dubbo:provider dispatcher="xxx" />
```

## Existing Extensions

* `org.apache.dubbo.remoting.transport.dispatcher.all.AllDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.direct.DirectDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.message.MessageOnlyDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.execution.ExecutionDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.connection.ConnectionOrderedDispatcher`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxDispatcher.java (Dispatcher implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.Dispatcher (plain text file with the content: xxx=com.xxx.XxxDispatcher)
```

XxxDispatcher.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.Dispatcher;
 
public class XxxDispatcher implements Dispatcher {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.Dispatcher：

```properties
xxx=com.xxx.XxxDispatcher
```
