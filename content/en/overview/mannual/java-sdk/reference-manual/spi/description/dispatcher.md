---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/dispatcher/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/dispatcher/
description: Message Dispatch Extension
linkTitle: Message Dispatch Extension
title: Message Dispatch Extension
type: docs
weight: 14
---






## Extension Description

Channel information dispatcher, used to specify thread pool model.

## Extension Interface

`org.apache.dubbo.remoting.Dispatcher`

## Extension Configuration

```xml
<dubbo:protocol dispatcher="xxx" />
<!-- Default value setting. When <dubbo:protocol> does not configure the dispatcher attribute, this configuration is used -->
<dubbo:provider dispatcher="xxx" />
```

## Known Extensions

* `org.apache.dubbo.remoting.transport.dispatcher.all.AllDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.direct.DirectDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.message.MessageOnlyDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.execution.ExecutionDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.connection.ConnectionOrderedDispatcher`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxDispatcher.java (implements Dispatcher interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.Dispatcher (plain text file, content: xxx=com.xxx.XxxDispatcher)
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
