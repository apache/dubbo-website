---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/startup/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/startup/
description: Startup 启动探针
linkTitle: 启动探针
title: Startup 启动探针
type: docs
weight: 12
---






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