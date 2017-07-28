##### 1. 扩展说明

日志输出适配扩展点。

##### 2. 扩展接口

`com.alibaba.dubbo.common.logger.LoggerAdapter`

##### 3. 扩展配置

```xml
<dubbo:application logger="xxx" />
```

```sh
-Ddubbo:application.logger=xxx
```

##### 4. 已知扩展

* `com.alibaba.dubbo.common.logger.slf4j.Slf4jLoggerAdapter`
* `com.alibaba.dubbo.common.logger.jcl.JclLoggerAdapter`
* `com.alibaba.dubbo.common.logger.log4j.Log4jLoggerAdapter`
* `com.alibaba.dubbo.common.logger.jdk.JdkLoggerAdapter`

##### 5. 扩展示例

Maven项目结构

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoggerAdapter.java (实现LoggerAdapter接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.common.logger.LoggerAdapter (纯文本文件，内容为：xxx=com.xxx.XxxLoggerAdapter)
```

XxxLoggerAdapter.java

```java
package com.xxx;
 
import com.alibaba.dubbo.common.logger.LoggerAdapter;
 
public class XxxLoggerAdapter implements LoggerAdapter {
    public Logger getLogger(URL url) {
        // ...
    }
}
```

XxxLogger.java

```java
package com.xxx;
 
import com.alibaba.dubbo.common.logger.Logger;
 
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

META-INF/dubbo/com.alibaba.dubbo.common.logger.LoggerAdapter

```
xxx=com.xxx.XxxLoggerAdapter
```