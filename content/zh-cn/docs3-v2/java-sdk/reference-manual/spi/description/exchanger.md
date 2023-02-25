---
type: docs
title: "信息交换扩展"
linkTitle: "信息交换扩展"
weight: 18
---

## 扩展说明

基于传输层之上，实现 Request-Response 信息交换语义。

## 扩展接口

* `org.apache.dubbo.remoting.exchange.Exchanger`
* `org.apache.dubbo.remoting.exchange.ExchangeServer`
* `org.apache.dubbo.remoting.exchange.ExchangeClient`

## 扩展配置

```xml
<dubbo:protocol exchanger="xxx" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置exchanger属性时，使用此配置 -->
<dubbo:provider exchanger="xxx" />
```

## 已知扩展

`org.apache.dubbo.remoting.exchange.exchanger.HeaderExchanger`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxExchanger.java (实现Exchanger接口)
                |-XxxExchangeServer.java (实现ExchangeServer接口)
                |-XxxExchangeClient.java (实现ExchangeClient接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.exchange.Exchanger (纯文本文件，内容为：xxx=com.xxx.XxxExchanger)
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
