# Exchanger Extension

## Summary

Exchange message between request and response on network transport layer.

## Extension Interface

* `com.alibaba.dubbo.remoting.exchange.Exchanger`
* `com.alibaba.dubbo.remoting.exchange.ExchangeServer`
* `com.alibaba.dubbo.remoting.exchange.ExchangeClient`

## Extension Configuration

```xml
<dubbo:protocol exchanger="xxx" />
<!-- default configuration, will take effect if exchanger attribute is not set in <dubbo:protocol> -->
<dubbo:provider exchanger="xxx" />
```

## Existing Extension

`com.alibaba.dubbo.remoting.exchange.exchanger.HeaderExchanger`

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
                |-com.alibaba.dubbo.remoting.exchange.Exchanger (plain text file with the content: xxx=com.xxx.XxxExchanger)
```

XxxExchanger.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.remoting.exchange.Exchanger;
 
 
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
 
import com.alibaba.dubbo.remoting.exchange.ExchangeServer;
 
public class XxxExchangeServer impelements ExchangeServer {
    // ...
}
```

XxxExchangeClient.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.remoting.exchange.ExchangeClient;
 
public class XxxExchangeClient impelments ExchangeClient {
    // ...
}
```

META-INF/dubbo/com.alibaba.dubbo.remoting.exchange.Exchanger：

```properties
xxx=com.xxx.XxxExchanger
```
