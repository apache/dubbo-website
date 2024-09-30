---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/logger-adapter/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/logger-adapter/
description: Logger Adapter Extension
linkTitle: Logger Adapter Extension
title: Logger Adapter Extension
type: docs
weight: 26
---






## Extension Description

Log output adaptation extension point.

## Extension Interface

`org.apache.dubbo.common.logger.LoggerAdapter`

## Extension Configuration

```xml
<dubbo:application logger="xxx" />
```

or:

```sh
-Ddubbo:application.logger=xxx
```

## Known Extensions

* `org.apache.dubbo.common.logger.slf4j.Slf4jLoggerAdapter`
* `org.apache.dubbo.common.logger.jcl.JclLoggerAdapter`
* `org.apache.dubbo.common.logger.log4j.Log4jLoggerAdapter`
* `org.apache.dubbo.common.logger.log4j2.Log4j2LoggerAdapter`
* `org.apache.dubbo.common.logger.jdk.JdkLoggerAdapter`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoggerAdapter.java (implements LoggerAdapter interface)
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
        // ...
    }
}
```

XxxLogger.java:

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

META-INF/dubbo/org.apache.dubbo.common.logger.LoggerAdapter:

```properties
xxx=com.xxx.XxxLoggerAdapter
```

