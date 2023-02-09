---
title: "Dubbo 上下文信息"
linkTitle: "Dubbo 上下文信息"
tags: ["Java"]
date: 2018-07-12
description: >
    介绍Dubbo上下文信息的作用、应用场景、使用方式以及注意事项
---

## 简介
上下文信息是一次 RPC 调用过程中附带的环境信息，如方法名、参数类型、真实参数、本端/对端地址等。这些数据仅属于一次调用，作用于 Consumer 到 Provider 调用的整个流程。

提供上下文信息是 RPC 框架很重要的一个功能，使用上下文不仅可以为单次调用指定不同配置，还能在此基础上提供强大的上层功能，如分布式链路追踪。其实现原理就是在上下文中维护一个`span_id`，Consumer 和 Provider 通过传递`span_id`来连接一次RPC调用，分别上报日志后可以在追踪系统中串联并展示完整的调用流程。这样可以更方便地发现异常，定位问题。


## 使用说明
Dubbo中代表上下文的类是`org.apache.dubbo.rpc.RpcContext`，可通过下述代码来获取上下文信息。
```
RpcContext.getContext()
```
## 使用场景
###  获取调用信息
| 方法名                 | 用途                         | 作用范围 | 说明                                                         |
| :--------------------- | ---------------------------- | -------- | ------------------------------------------------------------ |
| getRequest             | 获取 RPC 请求对象            | Consumer | 获取底层 RPC 请求对象，例如 HttpServletRequest，其他情况为 null |
| getResponse            | 获取 RPC 请求响应            | Consumer | 获取底层 RPC 响应对象，例如HttpServletResponse，其他情况为 null |
| isProviderSide         | 当前是否属于 Provider 上下文 | Both     | 服务被调用时为 true，调用其他服务时为false                   |
| isConsumerSide         | 当前是否属于 Consumer 上下文 | Both     | 服务被调用时为 false，调用其他服务时为 true                  |
| getUrls                | 获取当前能调用的 Url 列表    | Both     | Consumer 端会根据不同的 Failover 策略实时变化                |
| getRemotePort          | 获取远端端口                 | Both     | Consumer 端为最后一次调用的 Provider 端口，Provider 为当前请求的 Consumer 端口 |
| getRemoteHost          | 获取远端主机地址             | Both     |                                                              |
| getRemoteHostName      | 获取远端主机名               | Both     |                                                              |
| getRemoteAddressString | 获取远端地址                 | Both     |                                                              |
| getRemoteAddress       | 获取远端地址                 | Both     |                                                              |
| getLocalPort           | 获取本端端口                 | Both     |                                                              |
| getLocalHost           | 获取本端主机地址             | Both     |                                                              |
| getLocalHostName       | 获取本端主机名               | Both     |                                                              |
| getLocalAddressString  | 获取本端地址                 | Both     |                                                              |
| getLocalAddress        | 获取本端地址                 | Both     |                                                              |



### 传递用户参数

#### 本端传递

调用`get`和`set`方法即可完成参数传递。主要用于本端 Filter 之间的数据共享。

#### 对端传递

调用`setAttachment`和`getAttachment`即可完成对端数据传递，这些数据会经过 RPC 传递到对端。例如 Consumer 向 Provider 传递`span_id`。

- Dubbo已经支持从 Provider 端向 Consumer 端传递参数，读写方式和 Consumer 端调用时的方式一样。

### 异步调用

在异步调用时，可通过`getCompletableFuture`或`getFuture`获取相关的 Future，异步调用相关文档请参阅：[异步调用](/zh-cn/docs/advanced/async-call/)

## 注意事项

Dubbo 内部使用 ThreadLocal 的方式存储每次调用的上下文信息，当接收到请求或发起请求时，当前线程会更新 RpcContext。例如，服务 A 调用服务 B，服务 B 调用服务 C，在 B 调 C 之前，RpcContext 记录的是 A 调 B 的信息，在 B 调 C 之后，RpcContext 记录的是 B 调 C 的信息。
