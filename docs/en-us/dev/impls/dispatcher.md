# Dispatcher Extension

## Summary

Thread pool dispatch strategy.

## Extension Interface

`com.alibaba.dubbo.remoting.Dispatcher`

## Extension Configuration

```xml
<dubbo:protocol dispatcher="xxx" />
<!-- default configuration, will take effect if dispatcher attribute is not set in <dubbo:protocol> -->
<dubbo:provider dispatcher="xxx" />
```

## Existing Extensions

* `com.alibaba.dubbo.remoting.transport.dispatcher.all.AllDispatcher`
* `com.alibaba.dubbo.remoting.transport.dispatcher.direct.DirectDispatcher`
* `com.alibaba.dubbo.remoting.transport.dispatcher.message.MessageOnlyDispatcher`
* `com.alibaba.dubbo.remoting.transport.dispatcher.execution.ExecutionDispatcher`
* `com.alibaba.dubbo.remoting.transport.dispatcher.connection.ConnectionOrderedDispatcher`

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
                |-com.alibaba.dubbo.remoting.Dispatcher (plain text file with the content: xxx=com.xxx.XxxDispatcher)
```

XxxDispatcher.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.remoting.Dispatcher;
 
public class XxxDispatcher implements Dispatcher {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.remoting.Dispatcher：

```properties
xxx=com.xxx.XxxDispatcher
```
