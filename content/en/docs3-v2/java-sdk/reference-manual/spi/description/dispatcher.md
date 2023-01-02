---
type: docs
title: "Message Dispatch Extension"
linkTitle: "Message dispatch extension"
weight: 14
---

## Expansion Description

Channel information dispatcher, used to specify the thread pool model.

## Extension ports

`org.apache.dubbo.remoting.Dispatcher`

## Extended configuration

```xml
<dubbo:protocol dispatcher="xxx" />
<!-- The default value setting, when <dubbo:protocol> does not configure the dispatcher attribute, use this configuration -->
<dubbo:provider dispatcher="xxx" />
```

## Known extensions

* `org.apache.dubbo.remoting.transport.dispatcher.all.AllDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.direct.DirectDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.message.MessageOnlyDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.execution.ExecutionDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.connection.ConnectionOrderedDispatcher`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxDispatcher.java (implements the Dispatcher interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.Dispatcher (plain text file, content: xxx=com.xxx.XxxDispatcher)
```

XxxDispatcher.java:

```java
package com.xxx;
 
import org.apache.dubbo.remoting.Dispatcher;
 
public class XxxDispatcher implements Dispatcher {
    public Group lookup(URL url) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.Dispatcher:

```properties
xxx=com.xxx.XxxDispatcher
```