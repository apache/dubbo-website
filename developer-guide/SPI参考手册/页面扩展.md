##### 1. 扩展说明

对等网络节点组网器。

##### 2. 扩展接口

`com.alibaba.dubbo.container.page.PageHandler`

##### 3. 扩展配置

```xml
<dubbo:protocol page="xxx,yyy" />
<dubbo:provider page="xxx,yyy" /> <!-- 缺省值设置，当<dubbo:protocol>没有配置page属性时，使用此配置 -->
```

##### 4. 已知扩展

* `com.alibaba.dubbo.container.page.pages.HomePageHandler`
* `com.alibaba.dubbo.container.page.pages.StatusPageHandler`
* `com.alibaba.dubbo.container.page.pages.LogPageHandler`
* `com.alibaba.dubbo.container.page.pages.SystemPageHandler`

##### 5. 扩展示例

Maven项目结构

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxPageHandler.java (实现PageHandler接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.container.page.PageHandler (纯文本文件，内容为：xxx=com.xxx.XxxPageHandler)
```

XxxPageHandler.java

```java
package com.xxx;
 
import com.alibaba.dubbo.container.page.PageHandler;
 
public class XxxPageHandler implements PageHandler {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.container.page.PageHandler

```
xxx=com.xxx.XxxPageHandler
```
