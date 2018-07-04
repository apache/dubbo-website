# 线程池扩展

## 扩展说明

服务提供方线程程实现策略，当服务器收到一个请求时，需要在线程池中创建一个线程去执行服务提供方业务逻辑。

## 扩展接口

`com.alibaba.dubbo.common.threadpool.ThreadPool`

## 扩展配置

```xml
<dubbo:protocol threadpool="xxx" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置threadpool时，使用此配置 -->
<dubbo:provider threadpool="xxx" />
```

## 已知扩展

* `com.alibaba.dubbo.common.threadpool.FixedThreadPool`
* `com.alibaba.dubbo.common.threadpool.CachedThreadPool`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxThreadPool.java (实现ThreadPool接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.common.threadpool.ThreadPool (纯文本文件，内容为：xxx=com.xxx.XxxThreadPool)
```

XxxThreadPool.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.common.threadpool.ThreadPool;
import java.util.concurrent.Executor;
 
public class XxxThreadPool implements ThreadPool {
    public Executor getExecutor() {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.common.threadpool.ThreadPool：

```properties
xxx=com.xxx.XxxThreadPool
```

