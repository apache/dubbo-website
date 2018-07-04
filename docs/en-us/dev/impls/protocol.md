# Protocol Extension

## Summary

Extension to RPC protocol, hide details of remote call.

Contract:

* When user calls `invoke()` method of `Invoker` object which's returned from `refer()` call, the protocol needs to correspondingly execute `invoke()` method of `Invoker` object passed from remote `export()` method associated with the same URL.
* Moreover, it's protocol's responsibility to implement `Invoker` which's returned from `refer()`. Generally speaking, protocol sends remote request in the `Invoker` implementation, but needs not to care about the `Invoker` passed into `export()` since the framework will implement the logic and pass in the instance.

Notes:

* Protocol does not need to care about the proxy of the business interface. The upper layer of the framework will convert `Invoker` into business interface.
* It is not a requirement that the protocol must use TCP for network communication. It could be file-sharing, IPC, or others.

## Extension Interface

* `com.alibaba.dubbo.rpc.Protocol`
* `com.alibaba.dubbo.rpc.Exporter`
* `com.alibaba.dubbo.rpc.Invoker`

```java
public interface Protocol {
    /**
     * Export remote service: <br>
     * 1. Should save address info for the request when the protocol receives it: RpcContext.getContext().setRemoteAddress();<br>
     * 2. export() must be implemented as idempotent, that is, it should not introduce side effect when the implementation gets called with the same Invoker for more than once.
     * 3. Invoker is passed by the framework, and the protocol should not care about it. <br>
     * 
     * @param <T> Service type
     * @param invoker Service invoker
     * @return exporter The reference of service exporter, used for cancelling service export.
     * @throws RpcException throw when there's any error during service export, e.g. the port is occupied
     */
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;
 
    /**
     * Reference remote service: <br>
     * 1. When user calls `invoke()` method of `Invoker` object which's returned from `refer()` call, the protocol needs to correspondingly execute `invoke()` method of `Invoker` object passed from remote `export()` method associated with the same URL. <br>
     * 2. It's protocol's responsibility to implement `Invoker` which's returned from `refer()`. Generally speaking, protocol sends remote request in the `Invoker` implementation. <br>
     * 3. When there's check=false set in URL, the implementation must not throw exception but try to recover when connection fails.
     * 
     * @param <T> Service type
     * @param type Service type
     * @param url URL address for the remote service
     * @return invoker service's local proxy
     * @throws RpcException throw when there's any error while connecting to the service provider
     */
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;
 
}
```

## Extension Configuration

```xml
<!-- declare protocol, if id is not set, then use the value of name for id -->
<dubbo:protocol id="xxx1" name="xxx" />
<!-- reference protocol, if protocol's attribute is not set, then protocol configuration will be scanned automatically from ApplicationContext -->
<dubbo:service protocol="xxx1" />
<!-- default value for referenced protocol, it will be used if protocol attribute is not configured in <dubbo:service> --> 
<dubbo:provider protocol="xxx1" />
```

## Existing Protocol

* `com.alibaba.dubbo.rpc.injvm.InjvmProtocol`
* `com.alibaba.dubbo.rpc.dubbo.DubboProtocol`
* `com.alibaba.dubbo.rpc.rmi.RmiProtocol`
* `com.alibaba.dubbo.rpc.http.HttpProtocol`
* `com.alibaba.dubbo.rpc.http.hessian.HessianProtocol`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProtocol.java (Protocol implementation)
                |-XxxExporter.java (Exporter implementation)
                |-XxxInvoker.java (Invoker implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.Protocol (plain text file with the content: xxx=com.xxx.XxxProtocol)
```

XxxProtocol.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.Protocol;
 
public class XxxProtocol implements Protocol {
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        return new XxxExporter(invoker);
    }
    public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        return new XxxInvoker(type, url);
    }
}
```

XxxExporter.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.support.AbstractExporter;
 
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

XxxInvoker.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.support.AbstractInvoker;
 
public class XxxInvoker<T> extends AbstractInvoker<T> {
    public XxxInvoker(Class<T> type, URL url) throws RemotingException{
        super(type, url);
    }
    protected abstract Object doInvoke(Invocation invocation) throws Throwable {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.Protocol：

```properties
xxx=com.xxx.XxxProtocol
```