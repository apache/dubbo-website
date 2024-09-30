---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/readiness/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/readiness/
description: Readiness Probe
linkTitle: Readiness Probe
title: Readiness Probe
type: docs
weight: 12
---






## Extension Description


Extend application readiness detection points.


## Extension Interface


`org.apache.dubbo.qos.probe.ReadinessProbe`


## Extension Configuration


Dubbo QOS `ready` command auto-discovery


## Known Extensions


- `org.apache.dubbo.qos.probe.impl.BootstrapReadinessProbe`
- `org.apache.dubbo.qos.probe.impl.ProviderReadinessProbe`



## Extension Example


Maven project structure:


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxReadinessProbe.java (implements ReadinessProbe interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.ReadinessProbe (plain text file, content: xxx=com.xxx.XxxReadinessProbe)
```


XxxReadinessProbe.java:


```java
package com.xxx;
 
public class XxxReadinessProbe implements ReadinessProbe {
    
    public boolean check() {
        // ...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.ReadinessProbe:


```
xxx=com.xxx.XxxReadinessProbe
```
