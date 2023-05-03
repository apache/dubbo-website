---
aliases:
    - /zh/docs/references/lifecycle/startup/
description: Startup 启动探针
linkTitle: 启动探针
title: Startup 启动探针
type: docs
weight: 12
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/startup/)。
{{% /pageinfo %}}

## 扩展说明


拓展应用启动的检测点。


## 扩展接口


`org.apache.dubbo.qos.probe.StartupProbe`


## 扩展配置


Dubbo QOS `startup`   命令自动发现


## 已知扩展


- `org.apache.dubbo.qos.probe.impl.BootstrapLivenessProbe`



## 扩展示例


Maven 项目结构：


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStartupProbe.java (实现StartupProbe接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.StartupProbe (纯文本文件，内容为：xxx=com.xxx.XxxStartupProbe)
```


XxxStartupProbee.java：


```java
package com.xxx;
 
public class XxxStartupProbe implements StartupProbe {
    
    public boolean check() {
        // ...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.StartupProbe：


```
xxx=com.xxx.XxxStartupProbe
```
