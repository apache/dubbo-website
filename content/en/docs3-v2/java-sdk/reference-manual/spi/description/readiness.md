---
type: docs
title: "Readiness Probe"
linkTitle: "Readiness Probe"
weight: 12
---

## Expansion Description


Extend the detection points of application readiness.


## Extension ports


`org.apache.dubbo.qos.probe.ReadinessProbe`


## Extended configuration


Dubbo QOS `ready` command auto-discovery


## Known extensions


- `org.apache.dubbo.qos.probe.impl.BootstrapReadinessProbe`
- `org.apache.dubbo.qos.probe.impl.ProviderReadinessProbe`



## Extended example


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
        //...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.ReadinessProbe:


```
xxx=com.xxx.XxxReadinessProbe
```