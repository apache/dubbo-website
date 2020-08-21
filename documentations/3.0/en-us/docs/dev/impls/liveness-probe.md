# Liveness Probe Extension

## Summary

Extend the detection point of application survival.

## Extension Interface

`org.apache.dubbo.qos.probe.LivenessProbe`

## Extension Configuration

Dubbo QOS `live` command will automaticly discovery.

## Existing Extensions

No default implementation

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLivenessProbe.java (LivenessProbe implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.LivenessProbe (plain text file with the content：xxx=com.xxx.XxxLivenessProbe)
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


