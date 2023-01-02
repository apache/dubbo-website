---
type: docs
title: "Liveness Survival Probe"
linkTitle: "Survival Probe"
weight: 12
---

## Expansion Description


Expand the detection point of application survival.


## Extension ports


`org.apache.dubbo.qos.probe.LivenessProbe`


## Extended configuration


Dubbo QOS `live` command automatic discovery


## Known extensions


No default implementation yet


## Extended example


Maven project structure:


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLivenessProbe.java (implement LivenessProbe interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.LivenessProbe (plain text file, content: xxx=com.xxx.XxxLivenessProbe)
```


XxxLivenessProbe.java:


```java
package com.xxx;
 
public class XxxLivenessProbe implements LivenessProbe {
    
    public boolean check() {
        //...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.LivenessProbe:


```
xxx=com.xxx.XxxLivenessProbe
```