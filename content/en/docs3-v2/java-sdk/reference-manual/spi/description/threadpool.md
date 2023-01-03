---
type: docs
title: "Thread Pool Extension"
linkTitle: "Thread pool extension"
weight: 15
---

## Expansion Description

The service provider's thread pool implements the strategy. When the server receives a request, it needs to create a thread in the thread pool to execute the service provider's business logic.

## Extension ports

`org.apache.dubbo.common.threadpool.ThreadPool`

## Extended configuration

```xml
<dubbo:protocol threadpool="xxx" />
<!-- Default value setting, when <dubbo:protocol> does not configure threadpool, use this configuration -->
<dubbo:provider threadpool="xxx" />
```

## Known extensions

* `org.apache.dubbo.common.threadpool.FixedThreadPool`
* `org.apache.dubbo.common.threadpool.CachedThreadPool`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxThreadPool.java (implement ThreadPool interface)
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
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.common.threadpool.ThreadPool:

```properties
xxx=com.xxx.XxxThreadPool
```