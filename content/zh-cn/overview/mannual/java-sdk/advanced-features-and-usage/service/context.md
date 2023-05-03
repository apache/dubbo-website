---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/context/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/context/
description: 通过上下文存放当前调用过程中所需的环境信息
linkTitle: RPC调用上下文
title: RPC调用上下文
type: docs
weight: 6
---





## 特性说明
上下文中存放的是当前调用过程中所需的环境信息。所有配置信息都将转换为 URL 的参数，参见 [schema 配置参考手册](../../../reference-manual/config/properties/) 中的**对应URL参数**一列。

RpcContext 是一个 ThreadLocal 的临时状态记录器，当接收到 RPC 请求，或发起 RPC 请求时，RpcContext 的状态都会变化。比如：A 调 B，B 再调 C，则 B 机器上，在 B 调 C 之前，RpcContext 记录的是 A 调 B 的信息，在 B 调 C 之后，RpcContext 记录的是 B 调 C 的信息。

## 使用场景
全局链路追踪和隐藏参数。

## 使用方式

### 服务消费方
```java
// 远程调用
xxxService.xxx();
// 本端是否为消费端，这里会返回true
boolean isConsumerSide = RpcContext.getServiceContext().isConsumerSide();
// 获取最后一次调用的提供方IP地址
String serverIP = RpcContext.getServiceContext().getRemoteHost();
// 获取当前服务配置信息，所有配置信息都将转换为URL的参数
String application = RpcContext.getServiceContext().getUrl().getParameter("application");
// 注意：每发起RPC调用，上下文状态会变化
yyyService.yyy();
```

### 服务提供方
```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() {
        // 本端是否为提供端，这里会返回true
        boolean isProviderSide = RpcContext.getServiceContext().isProviderSide();
        // 获取调用方IP地址
        String clientIP = RpcContext.getServiceContext().getRemoteHost();
        // 获取当前服务配置信息，所有配置信息都将转换为URL的参数
        String application = RpcContext.getServiceContext().getUrl().getParameter("application");
        // 注意：每发起RPC调用，上下文状态会变化
        yyyService.yyy();
        // 此时本端变成消费端，这里会返回false
        boolean isProviderSide = RpcContext.getServiceContext().isProviderSide();
    } 
}
```