---
type: docs
title: "Networker Extension"
linkTitle: "Networker"
weight: 19
---

## Summary

Extension for peer to peer network grouping.

## Extension Interface

`org.apache.dubbo.remoting.p2p.Networker`

## Extension Configuration

```xml
<dubbo:protocol networker="xxx" />
<!-- default configuration, it takes effect if networker attribute is not set in <dubbo:protocol> -->
<dubbo:provider networker="xxx" /> 
```

## Existing Extension

* `org.apache.dubbo.remoting.p2p.support.MulticastNetworker`
* `org.apache.dubbo.remoting.p2p.support.FileNetworker`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxNetworker.java (Networker implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.p2p.Networker (plain text file with the content: xxx=com.xxx.XxxNetworker)
```

XxxNetworker.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.p2p.Networker;
 
public class XxxNetworker implements Networker {
    public Group lookup(URL url) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.p2p.Networker：

```properties
xxx=com.xxx.XxxNetworker
```
