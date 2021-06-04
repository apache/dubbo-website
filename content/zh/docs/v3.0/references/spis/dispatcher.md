---
type: docs
title: "消息派发扩展"
linkTitle: "消息派发扩展"
weight: 14
---

## 扩展说明

通道信息派发器，用于指定线程池模型。

## 扩展接口

`org.apache.dubbo.remoting.Dispatcher`

## 扩展配置

```xml
<dubbo:protocol dispatcher="xxx" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置dispatcher属性时，使用此配置 -->
<dubbo:provider dispatcher="xxx" />
```

## 已知扩展

* `org.apache.dubbo.remoting.transport.dispatcher.all.AllDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.direct.DirectDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.message.MessageOnlyDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.execution.ExecutionDispatcher`
* `org.apache.dubbo.remoting.transport.dispatcher.connection.ConnectionOrderedDispatcher`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxDispatcher.java (实现Dispatcher接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.Dispatcher (纯文本文件，内容为：xxx=com.xxx.XxxDispatcher)
```

XxxDispatcher.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.Dispatcher;
 
public class XxxDispatcher implements Dispatcher {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.Dispatcher：

```properties
xxx=com.xxx.XxxDispatcher
```
