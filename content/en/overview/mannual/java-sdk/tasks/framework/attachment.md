---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/attachment/
    - /en/overview/tasks/develop/context/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/attachment/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/context/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/attachment/
description: Implicitly passing parameters between service consumers and providers through Attachment in Dubbo
linkTitle: Passing Additional Parameters
title: Implicit Parameter Passing in Call Chain
type: docs
weight: 5
---

Parameters can be implicitly passed between service consumers and providers using `setAttachment` and `getAttachment` on `RpcContext` without modifying method signatures and parameter definitions. Implicit parameter passing supports the following two directions:
* From consumer to provider, i.e., additional parameters are passed via attachment when the request is initiated, outside of method parameters.
* From provider to consumer, i.e., additional parameters are passed via attachment when the response is returned, outside of the response result.

**The most direct way to understand implicit parameter passing is the HTTP header, which works exactly like an HTTP header. Any number of header parameters can be passed outside of the GET or POST request body.** Regarding implementation principles, the implementation of attachments varies slightly for different protocols:
* For the triple protocol, attachments will be converted into standard HTTP headers for transmission.
* For the Dubbo protocol, attachments are transmitted encoded in a fixed position within the protocol body; see the Dubbo protocol specification for details.

![/user-guide/images/context.png](/imgs/user/context.png)

{{% alert title="Note" color="primary" %}}
* When using the triple protocol, due to HTTP header limitations, only lowercase ASCII characters are supported.
* Some keys like path, group, version, dubbo, token, and timeout are reserved fields. Avoid using these when passing attachments, and ensure key uniqueness through business prefixes."
{{% /alert %}}

## Consumer Side Implicit Parameters
The complete source code for this example can be viewed at the following link [dubbo-samples-attachment](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-attachment)

### Setting Implicit Parameters

```java
RpcContext.getClientAttachment().setAttachment("index", "1"); // Implicit parameter passing; subsequent remote calls will automatically send these parameters to the server, similar to cookies, for framework integration
xxxService.xxx(); // Remote call
// ...
```

### Reading Implicit Parameters

```java
public class XxxServiceImpl implements XxxService {

    public void xxx() {
        // Get the parameters implicitly passed from the client, e.g., for framework integration
        String index = RpcContext.getServerAttachment().getAttachment("index");
    }
}
```

## Provider Side Implicit Parameters

### Setting Implicit Parameters

```java
public class XxxServiceImpl implements XxxService {

    public void xxx() {
        String index = xxx;
        RpcContext.getServerContext().setAttachment("result", index);
    }
}
```

### Reading Implicit Parameters

```java
xxxService.xxx(); // Remote call
String result = RpcContext.getServerContext().getAttachment("result");
// ...
```

{{% alert title="Parameter Transparency Issues" color="warning" %}}
Note! The KV pairs set by `setAttachment` will be cleared after the next remote call is completed, meaning multiple remote calls will require multiple settings! This is inconsistent with behavior in Dubbo2!

For Dubbo2, parameters set on endpoint A will also be passed to endpoint C when B continues to call C (leading to parameter pollution issues). However, for Dubbo3, the context when B calls C is clean and will not include the parameters originally set in A.

Dubbo3 provides the capability to support parameter transparency. By implementing the following SPI, users can specify which parameters need to be passed through; the result of `select` (which can get all current parameters from RpcClientAttachment) will be passed to the next hop as key-value pairs. Returning null means no parameters will be passed through.

```java
@SPI
public interface PenetrateAttachmentSelector {

    /**
     * Select some attachments to pass to the next hop.
     * These attachments can be fetched from {@link RpcContext#getServerAttachment()} or user-defined.
     *
     * @return attachments to pass to the next hop
     */
    Map<String, Object> select();

}
```
{{% /alert %}}

{{% alert title="About Legacy API" color="warning" %}}
Legacy Dubbo2 users are already familiar with using RpcContext to set implicit parameters for attachments:

```java
RpcContext.getContext().setAttachment("index", "1");
String index = RpcContext.getContext().getAttachment("index");
```

The above RpcContext API continues to work in Dubbo3. Dubbo3 introduces the new version API to support implicit parameters from the provider side and to resolve issues with parameter transparency. If users simply use consumer-side implicit parameters without other requirements, they can continue using the old RpcContext API.

{{% /alert %}}

## Internal Implementation Principles

Context information is a critical feature of RPC frameworks; using RpcContext allows specifying different configurations for a single call. For example, in distributed tracing scenarios, the implementation principle is to maintain a traceId in the full-link context. Consumer and Provider connect a single RPC call by passing the traceId, which can be logged and represented in the tracing system to display the complete call process, making it easier to detect anomalies and locate issues.

In Dubbo, RpcContext is a ThreadLocal temporary state recorder that changes its state upon receiving or initiating an RPC request. For example: **A calls B, B calls C; thus, before B calls C, RpcContext on machine B records the information of A and B, and after calling C, it records the information of B and C.**

Therefore, RpcContext is divided into four major modules (ServerContext, ClientAttachment, ServerAttachment, and ServiceContext).

Each module has different responsibilities:
- ServiceContext: Used internally in Dubbo to pass parameter information along the call chain, such as the invoker object, etc.
- ClientAttachment: Used on the client side, parameters written to ClientAttachment will be passed to the server.
- ServerAttachment: Used on the server side; parameters read from ServerAttachment are passed from the client.
- ServerContext: Used on both the client and server sides to pass data back from the server to the client; parameters written to ServerContext on the server can be retrieved on the client side after the call ends.

![/imgs/v3/concepts/rpccontext.png](/imgs/v3/concepts/rpccontext.png)

As shown above, when the consumer initiates a call, it can directly invoke the remote service through Method Invoke, while data written to RpcClientAttachment by the consumer will be included along with Invocation parameters. 
The consumer's Invocation is serialized, transmitted over the network to the server, where it's unpacked to generate Method Invoke arguments and RpcServerAttachment, and then the real call is made. 
After processing finishes on the server, the Method Response result is generated along with RpcServiceContext, creating a Result object. 
The server's Result object is serialized and sent back to the consumer over the network, where the consumer decodes the Result to generate Method Response results and RpcServiceContext, returning the actual call results and context.

1. When calling between Dubbo systems, common parameters can be passed uniformly through extensions like Filter provided by Dubbo.

2. When calling between Dubbo systems, if you want to pass parameters outside the interface definition, parameters can be passed using setAttachment before invoking the interface.
