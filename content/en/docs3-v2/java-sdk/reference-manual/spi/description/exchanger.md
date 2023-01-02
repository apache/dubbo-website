---
type: docs
title: "Information Exchange Extension"
linkTitle: "Information exchange extension"
weight: 18
---

## Expansion Description

Based on the transport layer, implement the Request-Response information exchange semantics.

## Extension ports

* `org.apache.dubbo.remoting.exchange.Exchanger`
* `org.apache.dubbo.remoting.exchange.ExchangeServer`
* `org.apache.dubbo.remoting.exchange.ExchangeClient`

## Extended configuration

```xml
<dubbo:protocol exchanger="xxx" />
<!-- The default value setting, when <dubbo:protocol> does not configure the exchanger attribute, use this configuration -->
<dubbo:provider exchanger="xxx" />
```

## Known extensions

`org.apache.dubbo.remoting.exchange.exchanger.HeaderExchanger`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExchanger.java (implements the Exchanger interface)
                |-XxxExchangeServer.java (implements ExchangeServer interface)
                |-XxxExchangeClient.java (implements ExchangeClient interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.exchange.Exchanger (plain text file, content: xxx=com.xxx.XxxExchanger)
```

XxxExchanger.java:

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

XxxExchangeServer.java:

```java

package com.xxx;
 
import org.apache.dubbo.remoting.exchange.ExchangeServer;
 
public class XxxExchangeServer impelements ExchangeServer {
    //...
}
```

XxxExchangeClient.java:

```java
package com.xxx;
 
import org.apache.dubbo.remoting.exchange.ExchangeClient;
 
public class XxxExchangeClient impelments ExchangeClient {
    //...
}
```

META-INF/dubbo/org.apache.dubbo.remoting.exchange.Exchanger:

```properties
xxx=com.xxx.XxxExchanger
```