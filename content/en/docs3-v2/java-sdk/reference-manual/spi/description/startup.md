---
type: docs
title: "Startup Startup Probe"
linkTitle: "Start Probe"
weight: 12
---

## Expansion Description


Extend the detection point of application startup.


## Extension ports


`org.apache.dubbo.qos.probe.StartupProbe`


## Extended configuration


Dubbo QOS `startup` command auto-discovery


## Known extensions


- `org.apache.dubbo.qos.probe.impl.BootstrapLivenessProbe`



## Extended example


Maven project structure:


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStartupProbe.java (implement the StartupProbe interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.StartupProbe (plain text file, content: xxx=com.xxx.XxxStartupProbe)
```


XxxStartupProbee.java:


```java
package com.xxx;
 
public class XxxStartupProbe implements StartupProbe {
    
    public boolean check() {
        //...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.StartupProbe:


```
xxx=com.xxx.XxxStartupProbe
```