---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/page/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/page/
description: Peer-to-peer network node aggregator extension
linkTitle: Peer-to-peer network node aggregator extension
title: Peer-to-peer network node aggregator extension
type: docs
weight: 19
---








## Extension Description

Peer-to-peer network node aggregator.

## Extension Interfaces

`org.apache.dubbo.container.page.PageHandler`

## Extension Configuration

```xml
<dubbo:protocol page="xxx,yyy" />
<!-- Default value settings, when <dubbo:protocol> does not configure the page attribute, use this configuration -->
<dubbo:provider page="xxx,yyy" />
```

## Known Extensions

* `org.apache.dubbo.container.page.pages.HomePageHandler`
* `org.apache.dubbo.container.page.pages.StatusPageHandler`
* `org.apache.dubbo.container.page.pages.LogPageHandler`
* `org.apache.dubbo.container.page.pages.SystemPageHandler`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxPageHandler.java (implements PageHandler interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.container.page.PageHandler (plain text file with content: xxx=com.xxx.XxxPageHandler)
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

