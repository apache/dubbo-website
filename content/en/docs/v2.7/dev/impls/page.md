---
type: docs
title: "PageHandler Extension"
linkTitle: "PageHandler"
weight: 23
---


## Summary

Extension for page handler

## Extension Interface

`org.apache.dubbo.container.page.PageHandler`

## Extension Configuration

```xml
<dubbo:protocol page="xxx,yyy" />
<!-- default configuration, will take effect if page attribute is not set in <dubbo:protocol> -->
<dubbo:provider page="xxx,yyy" />
```

## Existing Extension

* `org.apache.dubbo.container.page.pages.HomePageHandler`
* `org.apache.dubbo.container.page.pages.StatusPageHandler`
* `org.apache.dubbo.container.page.pages.LogPageHandler`
* `org.apache.dubbo.container.page.pages.SystemPageHandler`

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
                |-org.apache.dubbo.container.page.PageHandler (plain text file with the content: xxx=com.xxx.XxxPageHandler)
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
