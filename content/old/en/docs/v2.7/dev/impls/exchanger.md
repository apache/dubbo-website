---
type: docs
title: "Exchanger Extension"
linkTitle: "Exchanger"
weight: 18
---

## Summary

Exchange message between request and response on network transport layer.

## Extension Interface

* `org.apache.dubbo.remoting.exchange.Exchanger`
* `org.apache.dubbo.remoting.exchange.ExchangeServer`
* `org.apache.dubbo.remoting.exchange.ExchangeClient`

## Extension Configuration

```xml
<dubbo:protocol exchanger="xxx" />
<!-- default configuration, will take effect if exchanger attribute is not set in <dubbo:protocol> -->
<dubbo:provider exchanger="xxx" />
```

## Existing Extension

`org.apache.dubbo.remoting.exchange.exchanger.HeaderExchanger`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExchanger.java (Exchanger implementation)
                |-XxxExchangeServer.java (ExchangeServer implementation)
                |-XxxExchangeClient.java (ExchangeClient implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.exchange.Exchanger (plain text file with the content: xxx=com.xxx.XxxExchanger)
```

XxxExchanger.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.exchange.Exchanger;
 
 
public class XxxExchanger implements Exchanger {
    public ExchangeServer bind(URL url, ExchangeHandler handler) throws RemotingException {
        return new XxxExchangeServer(url, handler);
    }
    public ExchangeClient connect(URL url, ExchangeHandler handler) throws RemotingException {
        return new XxxExchangeClient(url, handler);
    }
}
```

XxxExchangeServer.java：

```java

package com.xxx;
 
import org.apache.dubbo.remoting.exchange.ExchangeServer;
 
public class XxxExchangeServer impelements ExchangeServer {
    // ...
}
```

XxxExchangeClient.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.exchange.ExchangeClient;
 
public class XxxExchangeClient impelments ExchangeClient {
    // ...
}
```

META-INF/dubbo/org.apache.dubbo.remoting.exchange.Exchanger：

```properties
xxx=com.xxx.XxxExchanger
```
