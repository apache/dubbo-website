---
type: docs
title: "Call link to pass implicit parameters"
linkTitle: "Call link to pass implicit parameters"
weight: 5
description: "Implicitly pass parameters between service consumers and providers through Attachment in Dubbo"
---

## Feature description

Parameters can be implicitly passed between the service consumer and the provider through `setAttachment` and `getAttachment` on `RpcContext`.

#### background

Context information is a very important function of the RPC framework. Using RpcContext can specify different configurations for a single call. For example, in the distributed link tracking scenario, the implementation principle is to maintain a traceId in the context of the entire link. The Consumer and Provider connect an RPC call by passing the traceId. After reporting the logs respectively, they can be connected in series in the tracking system and display the complete call. process. In this way, it is easier to find abnormalities and locate problems.
RpcContext in Dubbo is a ThreadLocal temporary state recorder. When RPC requests are received or RPC requests are initiated, the state of RpcContext will change. For example: **A tunes B, B tunes C, then on machine B, before B tunes C, RpcContext records the information of A and B, after B tunes C, RpcContext records the information of B and C. **

In Dubbo 3, RpcContext is split into four major modules (ServerContext, ClientAttachment, ServerAttachment and ServiceContext).

They bear different accusations respectively:
- ServiceContext: Used internally by Dubbo to pass parameter information on the call link, such as invoker objects, etc.
- ClientAttachment: Used on the client side, the parameters written in ClientAttachment will be passed to the server side
- ServerAttachment: Used on the Server side, the parameters read from ServerAttachment are passed from the Client
- ServerContext: It is used on both the client side and the server side, and is used to pass back from the server side to the client side. The parameters written by the server side to the ServerContext can be obtained from the ServerContext on the client side after the call ends

![/imgs/v3/concepts/rpccontext.png](/imgs/v3/concepts/rpccontext.png)

As shown in the figure above, when the consumer initiates an invocation, it can directly initiate a call to the remote service through Method Invoke, and at the same time, the data written by the consumer to RpcClientAttachment will be written into Invocation together with the parameter information of Invoke.
The Invocation on the consumer side is serialized and sent to the server through network transmission. The server parses the Invocation to generate the parameters of Method Invoke and RpcServerAttachment, and then initiates the real call.
After the processing on the server end, the Method Response result together with the RpcServiceContext will generate a Result object.
The Result object on the server is serialized and sent back to the consumer through network transmission. The consumer parses the Result to generate a Method Response result and RpcServiceContext, and returns the actual call result and context to the consumer.

> path, group, version, dubbo, token, timeout several keys are reserved fields, please use other values.

## scenes to be used

How to transparently transmit traceId to the service provider when the internal system calls through Dubbo.

## How to use

> The KV pair set by `setAttachment` will be cleared after the following remote call is completed, that is, multiple remote calls need to be set multiple times.

### Set implicit parameters on the service consumer side

```java
RpcContext.getClientAttachment().setAttachment("index", "1"); // Implicit parameter passing, subsequent remote calls will implicitly send these parameters to the server, similar to cookies, used for framework integration, not recommended business use
xxxService.xxx(); // remote call
//...
```

### Obtain implicit parameters on the service provider side

```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() {
        // Obtain the parameters implicitly passed in by the client for framework integration, not recommended for general business use
        String index = RpcContext.getServerAttachment().getAttachment("index");
    }
}
```

### Write return parameters in the service provider

```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() {
        String index = xxx;
        RpcContext.getServerContext().setAttachment("result", index);
    }
}
```

### Obtain the return parameters on the consumer side

```java
xxxService.xxx(); // remote call
String result = RpcContext.getServerContext().getAttachment("result");
//...
```

## Parameter transparent transmission problem

In Dubbo 2.7, after the parameters set on the A side are called, if B continues to call C, the parameters originally set in A will also be brought to the C side, causing the problem of parameter pollution.
Dubbo 3 has refactored RpcContext to support optional parameter transparent transmission, and parameter transparent transmission is enabled by default.

The following SPI is provided in Dubbo 3. There is no implementation by default. Users can define their own implementation. The result of `select` (you can get all the current parameters from RpcClientAttachment) will be passed to the next hop as a key-value pair that needs to be transparently transmitted. If Returning null means that parameters are not transparently passed.

```java
@SPI
public interface PenetrateAttachmentSelector {

    /**
     * Select some attachments to pass to next hop.
     * These attachments can fetch from {@link RpcContext#getServerAttachment()} or user defined.
     *
     * @return attachment pass to next hop
     */
    Map<String, Object> select();

}
```