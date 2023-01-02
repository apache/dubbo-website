---
type: docs
title: "Network Transport Extension"
linkTitle: "Network Transport Extension"
weight: 17
---

## Expansion Description

Realization of remote communication server and client transmission.

## Extension ports

* `org.apache.dubbo.remoting.Transporter`
* `org.apache.dubbo.remoting.Server`
* `org.apache.dubbo.remoting.Client`

## Extended configuration

```xml
<!-- server and client use the same transport implementation -->
<dubbo:protocol transporter="xxx" />
<!-- server and client use different transport implementations -->
<dubbo:protocol server="xxx" client="xxx" />
<!-- Default value setting, when <dubbo:protocol> is not configured with transporter/server/client attribute, use this configuration -->
<dubbo:provider transporter="xxx" server="xxx" client="xxx" />
```

## Known extensions

* `org.apache.dubbo.remoting.transport.transporter.netty.NettyTransporter`
* `org.apache.dubbo.remoting.transport.transporter.mina.MinaTransporter`
* `org.apache.dubbo.remoting.transport.transporter.grizzly.GrizzlyTransporter`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTransporter.java (implements the Transporter interface)
                |-XxxServer.java (implement Server interface)
                |-XxxClient.java (implement Client interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.Transporter (plain text file, content: xxx=com.xxx.XxxTransporter)
```

XxxTransporter.java:

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

XxxServer.java:

```java
package com.xxx;
 
import org.apache.dubbo.remoting.transport.transporter.AbstractServer;
 
public class XxxServer extends AbstractServer {
    public XxxServer(URL url, ChannelHandler handler) throws RemotingException{
        super(url, handler);
    }
    protected void doOpen() throws Throwable {
        //...
    }
    protected void doClose() throws Throwable {
        //...
    }
    public Collection<Channel> getChannels() {
        //...
    }
    public Channel getChannel(InetSocketAddress remoteAddress) {
        //...
    }
}
```

XxxClient.java:

```java
package com.xxx;
 
import org.apache.dubbo.remoting.transport.transporter.AbstractClient;
 
public class XxxClient extends AbstractClient {
    public XxxServer(URL url, ChannelHandler handler) throws RemotingException{
        super(url, handler);
    }
    protected void doOpen() throws Throwable {
        //...
    }
    protected void doClose() throws Throwable {
        //...
    }
    protected void doConnect() throws Throwable {
        //...
    }
    public Channel getChannel() {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.Transporter:

```properties
xxx=com.xxx.XxxTransporter
```