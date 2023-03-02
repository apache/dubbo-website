---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/liveness/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/liveness/
description: Liveness 存活探针
linkTitle: 存活探针
title: Liveness 存活探针
type: docs
weight: 12
---






## 扩展说明


拓展应用存活的检测点。


## 扩展接口


`org.apache.dubbo.qos.probe.LivenessProbe`


## 扩展配置


Dubbo QOS `live` 命令自动发现


## 已知扩展


暂无默认实现


## 扩展示例


Maven 项目结构：


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLivenessProbe.java (实现LivenessProbe接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.LivenessProbe (纯文本文件，内容为：xxx=com.xxx.XxxLivenessProbe)
```


XxxLivenessProbe.java：


```java
package com.xxx;
 
public class XxxLivenessProbe implements LivenessProbe {
    
    public boolean check() {
        // ...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.LivenessProbe：


```
xxx=com.xxx.XxxLivenessProbe
```