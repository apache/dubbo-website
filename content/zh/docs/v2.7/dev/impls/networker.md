---
type: docs
title: "组网扩展"
linkTitle: "组网扩展"
weight: 19
---

## 扩展说明

对等网络节点组网器。

## 扩展接口

`org.apache.dubbo.remoting.p2p.Networker`

## 扩展配置

```xml
<dubbo:protocol networker="xxx" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置networker属性时，使用此配置 -->
<dubbo:provider networker="xxx" /> 
```

## 已知扩展

* `org.apache.dubbo.remoting.p2p.support.MulticastNetworker`
* `org.apache.dubbo.remoting.p2p.support.FileNetworker`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxNetworker.java (实现Networker接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.p2p.Networker (纯文本文件，内容为：xxx=com.xxx.XxxNetworker)
```

XxxNetworker.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.p2p.Networker;
 
public class XxxNetworker implements Networker {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.p2p.Networker：

```properties
xxx=com.xxx.XxxNetworker
```
