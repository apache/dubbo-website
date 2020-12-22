---
type: docs
title: "LoggerAdapter Extension"
linkTitle: "LoggerAdapter"
weight: 26
---


## Summary

Extension for adapting logger output

## Extension Interface

`org.apache.dubbo.common.logger.LoggerAdapter`

## Extension Configuration

```xml
<dubbo:application logger="xxx" />
```

Or:

```sh
-Ddubbo:application.logger=xxx
```

## Existing Extension

* `org.apache.dubbo.common.logger.slf4j.Slf4jLoggerAdapter`
* `org.apache.dubbo.common.logger.jcl.JclLoggerAdapter`
* `org.apache.dubbo.common.logger.log4j.Log4jLoggerAdapter`
* `org.apache.dubbo.common.logger.log4j2.Log4j2LoggerAdapter`
* `org.apache.dubbo.common.logger.jdk.JdkLoggerAdapter`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoggerAdapter.java (LoggerAdapter implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.logger.LoggerAdapter (plain text file with the content: xxx=com.xxx.XxxLoggerAdapter)
```

XxxLoggerAdapter.java：

```java
package com.xxx;
 
import org.apache.dubbo.common.logger.LoggerAdapter;
 
public class XxxLoggerAdapter implements LoggerAdapter {
    public Logger getLogger(URL url) {
        // ...
    }
}
```

XxxLogger.java：

```java
package com.xxx;
 
import org.apache.dubbo.common.logger.Logger;
 
public class XxxLogger implements Logger {
    public XxxLogger(URL url) {
        // ...
    }
    public void info(String msg) {
        // ...
    }
    // ...
}
```

META-INF/dubbo/org.apache.dubbo.common.logger.LoggerAdapter：

```properties
xxx=com.xxx.XxxLoggerAdapter
```