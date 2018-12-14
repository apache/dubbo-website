# 页面扩展

## 扩展说明

对等网络节点组网器。

## 扩展接口

`org.apache.dubbo.container.page.PageHandler`

## 扩展配置

```xml
<dubbo:protocol page="xxx,yyy" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置page属性时，使用此配置 -->
<dubbo:provider page="xxx,yyy" />
```

## 已知扩展

* `org.apache.dubbo.container.page.pages.HomePageHandler`
* `org.apache.dubbo.container.page.pages.StatusPageHandler`
* `org.apache.dubbo.container.page.pages.LogPageHandler`
* `org.apache.dubbo.container.page.pages.SystemPageHandler`

## 扩展示例

Maven 项目结构：

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
                |-org.apache.dubbo.container.page.PageHandler (纯文本文件，内容为：xxx=com.xxx.XxxPageHandler)
```

XxxPageHandler.java：

```java
package com.xxx;
 
import org.apache.dubbo.container.page.PageHandler;
 
public class XxxPageHandler implements PageHandler {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.container.page.PageHandler：

```properties
xxx=com.xxx.XxxPageHandler
```
