---
type: docs
title: "Log Adaptation Extension"
linkTitle: "Log adaptation extension"
weight: 26
---

## Expansion Description

Log output adaptation extension point.

## Extension ports

`org.apache.dubbo.common.logger.LoggerAdapter`

## Extended configuration

```xml
<dubbo:application logger="xxx" />
```

or:

```sh
-Ddubbo:application.logger=xxx
```

## Known extensions

* `org.apache.dubbo.common.logger.slf4j.Slf4jLoggerAdapter`
* `org.apache.dubbo.common.logger.jcl.JclLoggerAdapter`
* `org.apache.dubbo.common.logger.log4j.Log4jLoggerAdapter`
* `org.apache.dubbo.common.logger.log4j2.Log4j2LoggerAdapter`
* `org.apache.dubbo.common.logger.jdk.JdkLoggerAdapter`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoggerAdapter.java (implement LoggerAdapter interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.logger.LoggerAdapter (plain text file, content: xxx=com.xxx.XxxLoggerAdapter)
```

XxxLoggerAdapter.java:

```java
package com.xxx;
 
import org.apache.dubbo.common.logger.LoggerAdapter;
 
public class XxxLoggerAdapter implements LoggerAdapter {
    public Logger getLogger(URL url) {
        //...
    }
}
```

XxxLogger.java:

```java
package com.xxx;
 
import org.apache.dubbo.common.logger.Logger;
 
public class XxxLogger implements Logger {
    public XxxLogger(URL url) {
        //...
    }
    public void info(String msg) {
        //...
    }
    //...
}
```

META-INF/dubbo/org.apache.dubbo.common.logger.LoggerAdapter:

```properties
xxx=com.xxx.XxxLoggerAdapter
```