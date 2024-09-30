---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/threadpool/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/threadpool/
description: Thread Pool Extension
linkTitle: Thread Pool Extension
title: Thread Pool Extension
type: docs
weight: 15
---






## Extension Description

The thread pool implementation strategy for service providers requires creating a thread in the thread pool to execute the service provider's business logic when the server receives a request.

## Extension Interface

`org.apache.dubbo.common.threadpool.ThreadPool`

## Extension Configuration

```xml
<dubbo:protocol threadpool="xxx" />
<!-- Default value configuration, used when <dubbo:protocol> does not configure threadpool -->
<dubbo:provider threadpool="xxx" />
```

## Known Extensions

* `org.apache.dubbo.common.threadpool.FixedThreadPool`
* `org.apache.dubbo.common.threadpool.CachedThreadPool`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxThreadPool.java (implements ThreadPool interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.common.threadpool.ThreadPool (plain text file, content: xxx=com.xxx.XxxThreadPool)
```

XxxThreadPool.java:

```java
package com.xxx;
 
import org.apache.dubbo.common.threadpool.ThreadPool;
import java.util.concurrent.Executor;
 
public class XxxThreadPool implements ThreadPool {
    public Executor getExecutor() {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.threadpool.ThreadPool:

```properties
xxx=com.xxx.XxxThreadPool
```

