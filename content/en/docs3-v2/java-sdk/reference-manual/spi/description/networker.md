---
type: docs
title: "Network Expansion"
linkTitle: "Network Expansion"
weight: 19
---

## Expansion Description

Peer-to-peer network node builder.

## Extension ports

`org.apache.dubbo.remoting.p2p.Networker`

## Extended configuration

```xml
<dubbo:protocol networker="xxx" />
<!-- The default value setting, when <dubbo:protocol> does not configure the networker attribute, use this configuration -->
<dubbo:provider networker="xxx" />
```

## Known extensions

* `org.apache.dubbo.remoting.p2p.support.MulticastNetworker`
* `org.apache.dubbo.remoting.p2p.support.FileNetworker`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxNetworker.java (implement Networker interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.p2p.Networker (plain text file, content: xxx=com.xxx.XxxNetworker)
```

XxxNetworker.java:

```java
package com.xxx;
 
import org.apache.dubbo.remoting.p2p.Networker;
 
public class XxxNetworker implements Networker {
    public Group lookup(URL url) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.p2p.Networker:

```properties
xxx=com.xxx.XxxNetworker
```