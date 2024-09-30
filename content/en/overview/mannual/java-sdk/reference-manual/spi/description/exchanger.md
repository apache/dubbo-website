---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/exchanger/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/exchanger/
description: Information Exchange Extension
linkTitle: Information Exchange Extension
title: Information Exchange Extension
type: docs
weight: 18
---






## Extension Description

Implement the Request-Response information exchange semantics based on the transport layer.

## Extension Interfaces

* `org.apache.dubbo.remoting.exchange.Exchanger`
* `org.apache.dubbo.remoting.exchange.ExchangeServer`
* `org.apache.dubbo.remoting.exchange.ExchangeClient`

## Extension Configuration

```xml
<dubbo:protocol exchanger="xxx" />
<!-- Default value setting, when <dubbo:protocol> does not configure the exchanger attribute, this configuration is used -->
<dubbo:provider exchanger="xxx" />
```

## Known Extension

`org.apache.dubbo.remoting.exchange.exchanger.HeaderExchanger`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExchanger.java (implements Exchanger interface)
                |-XxxExchangeServer.java (implements ExchangeServer interface)
                |-XxxExchangeClient.java (implements ExchangeClient interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.exchange.Exchanger (plain text file, content: xxx=com.xxx.XxxExchanger)
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

