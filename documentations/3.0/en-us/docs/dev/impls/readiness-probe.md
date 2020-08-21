# Readiness Probe Extension

## Summary

Extend the detection point of application readiness.

## Extension Interface

`org.apache.dubbo.qos.probe.ReadinessProbe`

## Extension Configuration

Dubbo QOS `ready` command will automaticly discovery.

## Existing Extensions

- `org.apache.dubbo.qos.probe.impl.BootstrapReadinessProbe`
- `org.apache.dubbo.qos.probe.impl.ProviderReadinessProbe`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxReadinessProbe.java (ReadinessProbe implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.qos.probe.ReadinessProbe (plain text file with the content：xxx=com.xxx.XxxReadinessProbe)
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


