---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/remoting/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/remoting/
description: Network Transport Extension
linkTitle: Network Transport Extension
title: Network Transport Extension
type: docs
weight: 17
---




## Extension Description

Implementations for remote communication servers and client transports.

## Extension Interfaces

* `org.apache.dubbo.remoting.Transporter`
* `org.apache.dubbo.remoting.Server`
* `org.apache.dubbo.remoting.Client`

## Extension Configuration

```xml
<!-- Server and client use the same transport implementation -->
<dubbo:protocol transporter="xxx" /> 
<!-- Server and client use different transport implementations -->
<dubbo:protocol server="xxx" client="xxx" /> 
<!-- Default settings, used when <dubbo:protocol> does not configure transporter/server/client attributes -->
<dubbo:provider transporter="xxx" server="xxx" client="xxx" />
```

## Known Extensions

* `org.apache.dubbo.remoting.transport.transporter.netty.NettyTransporter`
* `org.apache.dubbo.remoting.transport.transporter.mina.MinaTransporter`
* `org.apache.dubbo.remoting.transport.transporter.grizzly.GrizzlyTransporter`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTransporter.java (implements Transporter interface)
                |-XxxServer.java (implements Server interface)
                |-XxxClient.java (implements Client interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.Transporter (plain text file, contents: xxx=com.xxx.XxxTransporter)
```

XxxTransporter.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.Transporter;
 
public class XxxTransporter implements Transporter {
    public Server bind(URL url, ChannelHandler handler) throws RemotingException {
        return new XxxServer(url, handler);
    }
    public Client connect(URL url, ChannelHandler handler) throws RemotingException {
        return new XxxClient(url, handler);
    }
}
```

XxxServer.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.transport.transporter.AbstractServer;
 
public class XxxServer extends AbstractServer {
    public XxxServer(URL url, ChannelHandler handler) throws RemotingException{
        super(url, handler);
    }
    protected void doOpen() throws Throwable {
        // ...
    }
    protected void doClose() throws Throwable {
        // ...
    }
    public Collection<Channel> getChannels() {
        // ...
    }
    public Channel getChannel(InetSocketAddress remoteAddress) {
        // ...
    }
}
```

XxxClient.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.transport.transporter.AbstractClient;
 
public class XxxClient extends AbstractClient {
    public XxxServer(URL url, ChannelHandler handler) throws RemotingException{
        super(url, handler);
    }
    protected void doOpen() throws Throwable {
        // ...
    }
    protected void doClose() throws Throwable {
        // ...
    }
    protected void doConnect() throws Throwable {
        // ...
    }
    public Channel getChannel() {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.Transporter：

```properties
xxx=com.xxx.XxxTransporter
```

