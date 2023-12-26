---
aliases:
    - /zh/overview/tasks/develop/context/
description: 通过 Dubbo 中的 Attachment 在服务消费方和提供方之间传递参数
linkTitle: 上下文参数传递
title: 上下文参数传递
type: docs
weight: 5
---


## 上下文参数传递
在 Dubbo 3 中，RpcContext 被拆分为四大模块（ServerContext、ClientAttachment、ServerAttachment 和 ServiceContext）。

它们分别承担了不同的职责：

* ServiceContext：在 Dubbo 内部使用，用于传递调用链路上的参数信息，如 invoker 对象等
* ClientAttachment：在 Client 端使用，往 ClientAttachment 中写入的参数将被传递到 Server 端
* ServerAttachment：在 Server 端使用，从 ServerAttachment 中读取的参数是从 Client 中传递过来的
* ServerContext：在 Client 端和 Server 端使用，用于从 Server 端回传 Client 端使用，Server 端写入到 ServerContext 的参数在调用结束后可以在 Client 端的 ServerContext 获取到

## 使用场景
1、Dubbo系统间调用时，想传递一些通用参数，可通过Dubbo提供的扩展如Filter等实现统一的参数传递

2、Dubbo系统间调用时，想传递接口定义之外的参数，可在调用接口前使用setAttachment传递参数。

## 使用方式
setAttachment 设置的 KV 对，在完成下面一次远程调用会被清空，即多次远程调用要多次设置。

接口定义：
```java
public interface ContextService {
    String invoke(String param);
}

```
服务实现：
```java
@DubboService
public class ContextServiceImpl implements ContextService{
    @Override
    public String invoke(String param) {
        //ServerAttachment接收客户端传递过来的参数
        Map<String, Object> serverAttachments = RpcContext.getServerAttachment().getObjectAttachments();
        System.out.println("ContextService serverAttachments:" + JSON.toJSONString(serverAttachments));
        //往客户端传递参数
        RpcContext.getServerContext().setAttachment("serverKey","serverValue");
        StringBuilder s = new StringBuilder();
        s.append("ContextService param:").append(param);
        return s.toString();
    }
}

```

接口调用：
```java
    //往服务端传递参数
    RpcContext.getClientAttachment().setAttachment("clientKey1","clientValue1");
    String res = contextService.invoke("context1");
    //接收传递回来参数
    Map<String, Object> clientAttachment = RpcContext.getServerContext().getObjectAttachments();
    System.out.println("ContextTask clientAttachment:" + JSON.toJSONString(clientAttachment));
    System.out.println("ContextService Return : " + res);

```

*<font color='#FF7D00' size=4 > 注意 </font>*
> path, group, version, dubbo, token, timeout 几个 key 是保留字段，请使用其它值。