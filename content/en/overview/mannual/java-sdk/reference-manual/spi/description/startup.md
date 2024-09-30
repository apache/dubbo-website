---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/startup/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/startup/
description: Startup Probe
linkTitle: Startup Probe
title: Startup Probe
type: docs
weight: 12
---






## Expansion Description


Detection points for extended application startup.


## Extension Interface


`org.apache.dubbo.qos.probe.StartupProbe`


## Extension Configuration


Dubbo QOS `startup` command auto-discovery


## Known Extensions


- `org.apache.dubbo.qos.probe.impl.BootstrapLivenessProbe`



## Extension Example


Maven project structure:


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStartupProbe.java (implements StartupProbe interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.StartupProbe (plain text file, content: xxx=com.xxx.XxxStartupProbe)
```


XxxStartupProbe.java:


```java
package com.xxx;
 
public class XxxStartupProbe implements StartupProbe {
    
    public boolean check() {
        // ...
    }
}
```


META-INF/dubbo/org.apache.dubbo.qos.probe.StartupProbe:


```
xxx=com.xxx.XxxStartupProbe
```
