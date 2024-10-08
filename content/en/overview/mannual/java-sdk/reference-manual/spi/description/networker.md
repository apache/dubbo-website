---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/networker/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/networker/
description: Networking Extension
linkTitle: Networking Extension
title: Networking Extension
type: docs
weight: 19
---






## Extension Description

Peer network node networker.

## Extension Interface

`org.apache.dubbo.remoting.p2p.Networker`

## Extension Configuration

```xml
<dubbo:protocol networker="xxx" />
<!-- Default setting. When <dubbo:protocol> does not configure the networker attribute, use this configuration -->
<dubbo:provider networker="xxx" /> 
```

## Known Extensions

* `org.apache.dubbo.remoting.p2p.support.MulticastNetworker`
* `org.apache.dubbo.remoting.p2p.support.FileNetworker`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxNetworker.java (implements Networker interface)
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
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.p2p.Networker:

```properties
xxx=com.xxx.XxxNetworker
```

