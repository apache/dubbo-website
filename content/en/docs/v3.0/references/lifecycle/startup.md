---
type: docs
title: "Startup Probe"
linkTitle: "Startup"
weight: 9
---

## Summary


Extend the detection point of application startup.
## Extension Interface


`org.apache.dubbo.qos.probe.StartupProbe`


## Extension Configuration


Dubbo QOS `startup` command will automaticly discovery.


## Existing Extensions


- `org.apache.dubbo.qos.probe.impl.BootstrapStartupProbe`



## Extension Guide


Directory layout:


```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxStartupProbe.java (StartupProbe implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.StartupProbe (plain text file with the content：xxx=com.xxx.XxxStartupProbe)
```


XxxStartupProbe.java：


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



