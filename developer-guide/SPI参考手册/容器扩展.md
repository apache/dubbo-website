##### 1. 扩展说明

服务容器扩展，用于自定义加载内容。

##### 2. 扩展接口

`com.alibaba.dubbo.container.Container`

##### 3. 扩展配置

```sh
java com.alibaba.dubbo.container.Main spring jetty log4j
```

##### 4. 已知扩展

* `com.alibaba.dubbo.container.spring.SpringContainer`
* `com.alibaba.dubbo.container.spring.JettyContainer`
* `com.alibaba.dubbo.container.spring.Log4jContainer`

##### 5. 扩展示例

Maven项目结构

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxContainer.java (实现Container接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.container.Container (纯文本文件，内容为：xxx=com.xxx.XxxContainer)
```

XxxContainer.java

```java
package com.xxx;
 
com.alibaba.dubbo.container.Container;
 
 
public class XxxContainer implements Container {
    public Status start() {
        // ...
    }
    public Status stop() {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.container.Container

```
xxx=com.xxx.XxxContainer
```
