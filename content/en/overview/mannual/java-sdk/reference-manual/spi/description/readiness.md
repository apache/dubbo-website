---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/readiness/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/readiness/
description: Readiness 就绪探针
linkTitle: 就绪探针
title: Readiness 就绪探针
type: docs
weight: 12
---






## 扩展说明


拓展应用就绪的检测点。


## 扩展接口


`org.apache.dubbo.qos.probe.ReadinessProbe`


## 扩展配置


Dubbo QOS `ready`  命令自动发现


## 已知扩展


- `org.apache.dubbo.qos.probe.impl.BootstrapReadinessProbe`
- `org.apache.dubbo.qos.probe.impl.ProviderReadinessProbe`



## 扩展示例


Maven 项目结构：


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxReadinessProbe.java (实现ReadinessProbe接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.ReadinessProbe (纯文本文件，内容为：xxx=com.xxx.XxxReadinessProbe)
```


XxxReadinessProbe.java：


```java
package com.xxx;
 
public class XxxReadinessProbe implements ReadinessProbe {
    
    public boolean check() {
        // ...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.ReadinessProbe：


```
xxx=com.xxx.XxxReadinessProbe
```