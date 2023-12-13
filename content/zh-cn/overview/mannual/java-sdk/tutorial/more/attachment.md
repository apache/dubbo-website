---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/attachment/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/attachment/
description: 通过 Dubbo 中的 Attachment 在服务消费方和提供方之间隐式传递参数
linkTitle: 调用链路传递隐式参数
title: 调用链路传递隐式参数
type: docs
weight: 5
---






## 特性说明

可以通过 `RpcContext` 上的 `setAttachment` 和 `getAttachment` 在服务消费方和提供方之间进行参数的隐式传递。

#### 背景

上下文信息是 RPC 框架很重要的一个功能，使用 RpcContext 可以为单次调用指定不同配置。如分布式链路追踪场景，其实现原理就是在全链路的上下文中维护一个 traceId，Consumer 和 Provider 通过传递 traceId 来连接一次RPC调用，分别上报日志后可以在追踪系统中串联并展示完整的调用流程。这样可以更方便地发现异常，定位问题。
Dubbo 中的 RpcContext 是一个 ThreadLocal 的临时状态记录器，当接收到 RPC 请求，或发起 RPC 请求时，RpcContext 的状态都会变化。比如：**A 调 B，B 调 C，则 B 机器上，在 B 调 C 之前，RpcContext 记录的是 A 和 B 的信息，在 B 调 C 之后，RpcContext 记录的是 B 和 C 的信息。**

在 Dubbo 3 中，RpcContext 被拆分为四大模块（ServerContext、ClientAttachment、ServerAttachment 和 ServiceContext）。

它们分别承担了不同的职责：
- ServiceContext：在 Dubbo 内部使用，用于传递调用链路上的参数信息，如 invoker 对象等
- ClientAttachment：在 Client 端使用，往 ClientAttachment 中写入的参数将被传递到 Server 端
- ServerAttachment：在 Server 端使用，从 ServerAttachment 中读取的参数是从 Client 中传递过来的
- ServerContext：在 Client 端和 Server 端使用，用于从 Server 端回传 Client 端使用，Server 端写入到 ServerContext 的参数在调用结束后可以在 Client 端的 ServerContext 获取到

![/imgs/v3/concepts/rpccontext.png](/imgs/v3/concepts/rpccontext.png)

如上图所示，消费端发起调用的时候可以直接通过 Method Invoke 向远程的服务发起调用，同时消费端往 RpcClientAttachment 写入的数据会连同 Invoke 的参数信息写入到 Invocation 中。
消费端的 Invocation 经过序列化后通过网络传输发送给服务端，服务端解析 Invocation 生成 Method Invoke 的参数和 RpcServerAttachment，然后发起真实调用。
在服务端处理结束之后，Method Response 结果会连同 RpcServiceContext 一起生成 Result 对象。
服务端的 Result 结果对象经过序列化后通过网络传输发送回消费端，消费端解析 Result 生成 Method Response 结果和 RpcServiceContext，返回真实调用结果和上下文给消费端。

> path, group, version, dubbo, token, timeout 几个 key 是保留字段，请使用其它值。

## 使用场景

内部系统通过 Dubbo 调用时, traceId 如何透传到服务提供方。

## 使用方式

> `setAttachment` 设置的 KV 对，在完成下面一次远程调用会被清空，即多次远程调用要多次设置。

### 在服务消费方端设置隐式参数

```java
RpcContext.getClientAttachment().setAttachment("index", "1"); // 隐式传参，后面的远程调用都会隐式将这些参数发送到服务器端，类似cookie，用于框架集成，不建议常规业务使用
xxxService.xxx(); // 远程调用
// ...
```

### 在服务提供方端获取隐式参数

```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() {
        // 获取客户端隐式传入的参数，用于框架集成，不建议常规业务使用
        String index = RpcContext.getServerAttachment().getAttachment("index");
    }
}
```

### 在服务提供方写入回传参数

```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() {
        String index = xxx;
        RpcContext.getServerContext().setAttachment("result", index);
    }
}
```

### 在消费端获取回传参数

```java
xxxService.xxx(); // 远程调用
String result = RpcContext.getServerContext().getAttachment("result");
// ...
```

> 参数透传问题

在 Dubbo 2.7 中，在 A 端设置的参数，调用 B 以后，如果 B 继续调用了 C，原来在 A 中设置的参数也会被带到 C 端过去，造成参数污染的问题。
Dubbo 3 对 RpcContext 进行了重构，支持可选参数透传，默认开启参数透传。

在 Dubbo 3 中提供了如下的 SPI，默认无实现，用户可以自行定义实现，`select` 的结果（可以从 RpcClientAttachment 获取当前所有参数）将作为需要透传的键值对传递到下一跳，如果返回 null 则表示不透传参数。

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
