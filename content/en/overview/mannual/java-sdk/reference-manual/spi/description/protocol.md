---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/protocol/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/protocol/
description: Protocol Extension
linkTitle: Protocol Extension
title: Protocol Extension
type: docs
weight: 1
---






## Extension Description

RPC protocol extension, encapsulating remote call details.

Contract:

* When the user calls the `invoke()` method of the `Invoker` object returned by `refer()`, the protocol should execute the `invoke()` method of the `Invoker` object passed in by remote `export()` with the same URL.
* The `Invoker` returned by `refer()` is implemented by the protocol, which usually sends a remote request within this `Invoker`. The `Invoker` passed in by `export()` is implemented and provided by the framework, which the protocol does not need to be concerned about.

{{% alert title="Note" color="primary" %}}
* The protocol does not concern itself with the transparent proxying of business interfaces; it is `Invoker` centric, with the outer layer converting `Invoker` to the business interface.
* The protocol does not necessarily have to be TCP network communication, such as through shared files, IPC inter-process communication, etc.
{{% /alert %}}

## Extension Interface

* `org.apache.dubbo.rpc.Protocol`
* `org.apache.dubbo.rpc.Exporter`
* `org.apache.dubbo.rpc.Invoker`

```java
public interface Protocol {
    /**
     * Expose remote service:<br>
     * 1. The protocol, upon receiving requests, should record the request source address information: RpcContext.getContext().setRemoteAddress();<br>
     * 2. export() must be idempotent, meaning exposing the same URL's Invoker twice is the same as exposing it once.<br>
     * 3. The Invoker passed to export() is provided by the framework, and the protocol does not need to be concerned.<br>
     * 
     * @param <T> Service type
     * @param invoker Service execution body
     * @return exporter Reference to exposed service for cancellation
     * @throws RpcException Thrown when an error occurs in exposing the service, such as port occupied.
     */
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;
 
    /**
     * Reference a remote service:<br>
     * 1. When the user calls invoke() on the Invoker object returned by refer(), the protocol should execute the invoke() method of the Invoker object passed in by remote export() with the same URL.<br>
     * 2. The Invoker returned by refer() is implemented by the protocol, typically sending the remote request within this Invoker.<br>
     * 3. When check=false is set in the URL, connection failures should not throw exceptions but should automatically recover internally.<br>
     * 
     * @param <T> Service type
     * @param type Service type
     * @param url Remote service's URL
     * @return invoker Local proxy of the service
     * @throws RpcException Thrown when connection to the service provider fails.
     */
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;
 
}
```

## Extension Configuration

```xml
<!-- Declare protocol, if no id is configured, name will be used as id -->
<dubbo:protocol id="xxx1" name="xxx" />
<!-- Reference protocol, if no protocol attribute is configured, it will automatically scan protocol configuration in ApplicationContext -->
<dubbo:service protocol="xxx1" />
<!-- Default value for referenced protocol, used when <dubbo:service> does not configure protocol attribute -->
<dubbo:provider protocol="xxx1" />
```

## Known Extensions

* `org.apache.dubbo.rpc.protocol.injvm.InjvmProtocol`
* `org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol`
* `org.apache.dubbo.rpc.protocol.rmi.RmiProtocol`
* `org.apache.dubbo.rpc.protocol.http.HttpProtocol`
* `org.apache.dubbo.rpc.protocol.http.hessian.HessianProtocol`
* `org.apache.dubbo.rpc.support.MockProtocol`

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProtocol.java (implements Protocol interface)
                |-XxxExporter.java (implements Exporter interface)
                |-XxxInvoker.java (implements Invoker interface)
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
        // ...
    }
    public void unexport() {
        super.unexport();
        // ...
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
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.Protocol：

```properties
xxx=com.xxx.XxxProtocol
```

