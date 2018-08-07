# Page Extension

## Summary

Extension for page handler

## Extension Interface

`com.alibaba.dubbo.container.page.PageHandler`

## Extension Configuration

```xml
<dubbo:protocol page="xxx,yyy" />
<!-- default configuration, will take effect if page attribute is not set in <dubbo:protocol> -->
<dubbo:provider page="xxx,yyy" />
```

## Existing Extension

* `com.alibaba.dubbo.container.page.pages.HomePageHandler`
* `com.alibaba.dubbo.container.page.pages.StatusPageHandler`
* `com.alibaba.dubbo.container.page.pages.LogPageHandler`
* `com.alibaba.dubbo.container.page.pages.SystemPageHandler`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxPageHandler.java (PageHandler implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.container.page.PageHandler (plain text file with the content: xxx=com.xxx.XxxPageHandler)
```

XxxPageHandler.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.container.page.PageHandler;
 
public class XxxPageHandler implements PageHandler {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.container.page.PageHandler：

```properties
xxx=com.xxx.XxxPageHandler
```
