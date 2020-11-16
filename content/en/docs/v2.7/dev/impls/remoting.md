---
type: docs
title: "Transporter Extension"
linkTitle: "Transporter"
weight: 17
---

## Summary

Transportation extension for communication between server and client.

## Extension Interface

* `org.apache.dubbo.remoting.Transporter`
* `org.apache.dubbo.remoting.Server`
* `org.apache.dubbo.remoting.Client`

## Extension Configuration

```xml
<!-- server and client use the same transporter -->
<dubbo:protocol transporter="xxx" /> 
<!-- server and client use the different transporter -->
<dubbo:protocol server="xxx" client="xxx" /> 
<!-- default configuration, will take effect when transport/server/client attribute is not set in <dubbo:protocol> -->
<dubbo:provider transporter="xxx" server="xxx" client="xxx" />
```

## Existing Extension

* `org.apache.dubbo.remoting.transport.transporter.netty.NettyTransporter`
* `org.apache.dubbo.remoting.transport.transporter.mina.MinaTransporter`
* `org.apache.dubbo.remoting.transport.transporter.grizzly.GrizzlyTransporter`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTransporter.java (Transporter implementation)
                |-XxxServer.java (Server implementation)
                |-XxxClient.java (Client implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.Transporter (plain text file with the content: xxx=com.xxx.XxxTransporter)
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
