---
type: docs
title: "Peer-to-peer network node builder extension"
linkTitle: "Peer-to-peer network node builder extension"
weight: 19
---

# page extension

## Expansion Description

Peer-to-peer network node builder.

## Extension ports

`org.apache.dubbo.container.page.PageHandler`

## Extended configuration

```xml
<dubbo:protocol page="xxx,yyy" />
<!-- The default value setting, when <dubbo:protocol> does not configure the page attribute, use this configuration -->
<dubbo:provider page="xxx,yyy" />
```

## Known extensions

* `org.apache.dubbo.container.page.pages.HomePageHandler`
* `org.apache.dubbo.container.page.pages.StatusPageHandler`
* `org.apache.dubbo.container.page.pages.LogPageHandler`
* `org.apache.dubbo.container.page.pages.SystemPageHandler`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxPageHandler.java (implement PageHandler interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.container.page.PageHandler (plain text file, content: xxx=com.xxx.XxxPageHandler)
```

XxxPageHandler.java:

```java
package com.xxx;
 
import org.apache.dubbo.container.page.PageHandler;
 
public class XxxPageHandler implements PageHandler {
    public Group lookup(URL url) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.container.page.PageHandler:

```properties
xxx=com.xxx.XxxPageHandler
```