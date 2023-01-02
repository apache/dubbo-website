---
type: docs
title: "Protocol Extension"
linkTitle: "Protocol Extension"
weight: 1
---

## Expansion Description

RPC protocol extension, encapsulates remote call details.

contract:

* When the user calls the `invoke()` method of the `Invoker` object returned by `refer()`, the protocol needs to execute the `invoke()` of the `Invoker` object passed in from the remote `export()` of the URL accordingly ` method.
* Among them, the `Invoker` returned by `refer()` is implemented by the protocol, and the protocol usually needs to send a remote request in this `Invoker`, and the `Invoker` passed in by `export()` is implemented and passed in by the framework, and the protocol does not need to care.

Notice:

* The protocol does not care about the transparent proxy of the business interface, with `Invoker` as the center, and the outer layer converts `Invoker` into a business interface.
* The protocol does not have to be TCP network communication, such as through shared files, IPC inter-process communication, etc.

## Extension ports

* `org.apache.dubbo.rpc.Protocol`
* `org.apache.dubbo.rpc.Exporter`
* `org.apache.dubbo.rpc.Invoker`

```java
public interface Protocol {
    /**
     * Expose remote services:<br>
     * 1. When receiving a request, the protocol should record the request source address information: RpcContext.getContext().setRemoteAddress();<br>
     * 2. export() must be idempotent, that is, exposing the Invoker of the same URL twice is no different from exposing it once. <br>
     * 3. The Invoker passed in by export() is implemented and passed in by the framework, and the protocol does not need to care. <br>
     *
     * @param <T> type of service
     * @param invoker service execution body
     * @return exporter The reference of the exposed service, used to cancel the exposure
     * @throws RpcException Throws when there is an error in the exposed service, such as the port is already occupied
     */
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;
 
    /**
     * Quoting remote services:<br>
     * 1. When the user calls the invoke() method of the Invoker object returned by refer(), the protocol needs to correspondingly execute the invoke() method of the Invoker object passed in from the URL remote export(). <br>
     * 2. The Invoker returned by refer() is implemented by the protocol, and the protocol usually needs to send a remote request in this Invoker. <br>
     * 3. When check=false is set in the url, an exception cannot be thrown if the connection fails, and internal automatic recovery is required. <br>
     *
     * @param <T> type of service
     * @param type service type
     * @param url URL address of the remote service
     * @return The local proxy for the invoker service
     * @throws RpcException thrown when the connection to the service provider fails
     */
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;
 
}
```

## Extended configuration

```xml
<!-- declare protocol, if no id is configured, name will be used as id -->
<dubbo:protocol id="xxx1" name="xxx" />
<!-- Reference protocol, if the protocol attribute is not configured, the protocol configuration will be automatically scanned in the ApplicationContext -->
<dubbo:service protocol="xxx1" />
<!-- The reference protocol default value, when <dubbo:service> does not configure the protocol attribute, use this configuration -->
<dubbo:provider protocol="xxx1" />
```

## Known extensions

* `org.apache.dubbo.rpc.protocol.injvm.InjvmProtocol`
* `org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol`
* `org.apache.dubbo.rpc.protocol.rmi.RmiProtocol`
* `org.apache.dubbo.rpc.protocol.http.HttpProtocol`
* `org.apache.dubbo.rpc.protocol.http.hessian.HessianProtocol`
* `org.apache.dubbo.rpc.support.MockProtocol`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProtocol.java (implement the Protocol interface)
                |-XxxExporter.java (implements the Exporter interface)
                |-XxxInvoker.java (implements the Invoker interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.Protocol (plain text file, content: xxx=com.xxx.XxxProtocol)
```

XxxProtocol.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.Protocol;
 
public class XxxProtocol implements Protocol {
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        return new XxxExporter(invoker);
    }
    public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        return new XxxInvoker(type, url);
    }
}
```

XxxExporter.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.support.AbstractExporter;
 
public class XxxExporter<T> extends AbstractExporter<T> {
    public XxxExporter(Invoker<T> invoker) throws RemotingException{
        super(invoker);
        //...
    }
    public void unexport() {
        super. unexport();
        //...
    }
}
```

XxxInvoker.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.support.AbstractInvoker;
 
public class XxxInvoker<T> extends AbstractInvoker<T> {
    public XxxInvoker(Class<T> type, URL url) throws RemotingException{
        super(type, url);
    }
    
    @Override
    protected Result doInvoke(Invocation invocation) throws Throwable {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.Protocol:

```properties
xxx=com.xxx.XxxProtocol
```