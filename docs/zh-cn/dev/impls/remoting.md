# 网络传输扩展

## 扩展说明

远程通讯的服务器及客户端传输实现。

## 扩展接口

* `com.alibaba.dubbo.remoting.Transporter`
* `com.alibaba.dubbo.remoting.Server`
* `com.alibaba.dubbo.remoting.Client`

## 扩展配置

```xml
<!-- 服务器和客户端使用相同的传输实现 -->
<dubbo:protocol transporter="xxx" /> 
<!-- 服务器和客户端使用不同的传输实现 -->
<dubbo:protocol server="xxx" client="xxx" /> 
<!-- 缺省值设置，当<dubbo:protocol>没有配置transporter/server/client属性时，使用此配置 -->
<dubbo:provider transporter="xxx" server="xxx" client="xxx" />
```

## 已知扩展

* `com.alibaba.dubbo.remoting.transport.transporter.netty.NettyTransporter`
* `com.alibaba.dubbo.remoting.transport.transporter.mina.MinaTransporter`
* `com.alibaba.dubbo.remoting.transport.transporter.grizzly.GrizzlyTransporter`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTransporter.java (实现Transporter接口)
                |-XxxServer.java (实现Server接口)
                |-XxxClient.java (实现Client接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.remoting.Transporter (纯文本文件，内容为：xxx=com.xxx.XxxTransporter)
```

XxxTransporter.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.remoting.Transporter;
 
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
 
import com.alibaba.dubbo.remoting.transport.transporter.AbstractServer;
 
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
 
import com.alibaba.dubbo.remoting.transport.transporter.AbstractClient;
 
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

META-INF/dubbo/com.alibaba.dubbo.remoting.Transporter：

```properties
xxx=com.xxx.XxxTransporter
```
