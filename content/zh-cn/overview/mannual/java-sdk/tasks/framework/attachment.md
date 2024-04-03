---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/attachment/
    - /zh/overview/tasks/develop/context/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/attachment/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/context/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/attachment/
description: 通过 Dubbo 中的 Attachment 在服务消费方和提供方之间隐式传递参数
linkTitle: 传递附加参数
title: 调用链路传递隐式参数
type: docs
weight: 5
---

在不修改方法签名与参数定义的情况下，可以通过 `RpcContext` 上的 `setAttachment` 和 `getAttachment` 在服务消费方和提供方之间进行参数的隐式传递。隐式参数传递支持以下两个方向：
* 从消费方到提供方，也就是在请求发起时，在方法参数之外通过 attachment 传递附加参数。
* 从提供方到消费方，也就是在响应结果返回时，在响应结果之外通过 attachment 传递附加参数。

**理解隐式参数传递的最直接方式 http header，它的工作方式与 http header 完全一致，在 GET 或 POST 请求体之外可以传递任意多个 header 参数**。在实现原理上，对于不同的协议，attachment 的实现方式略有不同：
* 对于 triple 协议，attachment 会转换为标准的 http header 进行传输。
* 对于 dubbo 协议，attachment 是编码在协议体的固定位置进行传输，具体请参见 dubbo 协议规范。

![/user-guide/images/context.png](/imgs/user/context.png)

{{% alert title="注意" color="primary" %}}
* 在使用 triple 协议时，由于 http header 的限制，仅支持小写的 ascii 字符
* path, group, version, dubbo, token, timeout 一些 key 是保留字段，传递 attachment 时应避免使用，尽量通过业务前缀等确保 key 的唯一性。
{{% /alert %}}

## 消费端隐式参数
本文示例完整源码可在以下链接查看 [dubbo-samples-attachment](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-attachment)

### 设置隐式参数

```java
RpcContext.getClientAttachment().setAttachment("index", "1"); // 隐式传参，后面的远程调用都会隐式将这些参数发送到服务器端，类似cookie，比如用于框架集成
xxxService.xxx(); // 远程调用
// ...
```

### 读取隐式参数

```java
public class XxxServiceImpl implements XxxService {

    public void xxx() {
        // 获取客户端隐式传入的参数，比如用于框架集成
        String index = RpcContext.getServerAttachment().getAttachment("index");
    }
}
```

## 提供端隐式参数

### 设置隐式参数

```java
public class XxxServiceImpl implements XxxService {

    public void xxx() {
        String index = xxx;
        RpcContext.getServerContext().setAttachment("result", index);
    }
}
```

### 读取隐式参数

```java
xxxService.xxx(); // 远程调用
String result = RpcContext.getServerContext().getAttachment("result");
// ...
```

{{% alert title="参数透传问题" color="warning" %}}
请注意！`setAttachment` 设置的 KV 对，在完成下面一次远程调用会被清空，即多次远程调用要多次设置！这一点与 Dubbo2 中的行为是不一致的！

比如，对于 Dubbo2 而言，在 A 端设置的参数，调用 B 以后，如果 B 继续调用了 C，原来在 A 中设置的参数也会被带到 C 端过去（造成参数污染的问题）。对于 Dubbo3，B 调用 C 时的上下文是干净的，不会包含最开始在 A 中设置的参数。

Dubbo3 提供的了支持参数透传的能力。通过实现以下 SPI 用户可以自行指定需要透传的参数，`select` 的结果（可以从 RpcClientAttachment 获取当前所有参数）将作为需要透传的键值对传递到下一跳，如果返回 null 则表示不透传参数。

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
{{% /alert %}}

{{% alert title="关于老版本 API" color="warning" %}}
老版本 Dubbo2 用户已经熟悉了使用 RpcContext 设置 attachment 隐式参数：

```java
RpcContext.getContext().setAttachment("index", "1");
String index = RpcContext.getContext().getAttachment("index");
```

以上 RpcContext API 在 Dubbo3 中仍能正常工作。Dubbo3 之所以引入以上新版本 API 是为了支持提供端隐式参数、解决参数透传等问题，如果用户只是简单的使用消费端隐式参数，没有其他他书需求则可以继续使用老版本 RpcContext API。

{{% /alert %}}

## 内部实现原理

上下文信息是 RPC 框架很重要的一个功能，使用 RpcContext 可以为单次调用指定不同配置。如分布式链路追踪场景，其实现原理就是在全链路的上下文中维护一个 traceId，Consumer 和 Provider 通过传递 traceId 来连接一次RPC调用，分别上报日志后可以在追踪系统中串联并展示完整的调用流程。这样可以更方便地发现异常、定位问题。

Dubbo 中的 RpcContext 是一个 ThreadLocal 的临时状态记录器，当接收到 RPC 请求，或发起 RPC 请求时，RpcContext 的状态都会变化。比如：**A 调 B，B 调 C，则 B 机器上，在 B 调 C 之前，RpcContext 记录的是 A 和 B 的信息，在 B 调 C 之后，RpcContext 记录的是 B 和 C 的信息。**

因此，RpcContext 被拆分为四大模块（ServerContext、ClientAttachment、ServerAttachment 和 ServiceContext）。

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

1、Dubbo系统间调用时，想传递一些通用参数，可通过Dubbo提供的扩展如Filter等实现统一的参数传递

2、Dubbo系统间调用时，想传递接口定义之外的参数，可在调用接口前使用setAttachment传递参数。
