---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/liveness/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/liveness/
description: Liveness Probe
linkTitle: Liveness Probe
title: Liveness Probe
type: docs
weight: 12
---






## Extended Description


Expands the detection points for application liveness.


## Extended Interface


`org.apache.dubbo.qos.probe.LivenessProbe`


## Extended Configuration


Dubbo QOS `live` command auto-discovery


## Known Extensions


No default implementation available


## Extension Example


Maven project structure:


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLivenessProbe.java (Implements LivenessProbe interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.LivenessProbe (Plain text file, content: xxx=com.xxx.XxxLivenessProbe)
```


XxxLivenessProbe.java:


```java
package com.xxx;
 
public class XxxLivenessProbe implements LivenessProbe {
    
    public boolean check() {
        // ...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.LivenessProbe:


```
xxx=com.xxx.XxxLivenessProbe
```
