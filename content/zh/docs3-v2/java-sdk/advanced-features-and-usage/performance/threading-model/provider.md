---
type: docs
title: "服务端线程模型"
linkTitle: "服务端线程模型"
weight: 1
description: "Dubbo 服务提供端端线程池模型和用法"
---



Dubbo协议的和Triple协议目前的线程模型还并没有对齐，下面分开介绍Triple协议和Dubbo协议的线程模型。

# Dubbo协议——Provider端线程模型

介绍Dubbo协议的Provider端线程模型之前，先介绍Dubbo对channel上的操作抽象成了五种行为：

- 建立连接：connected，主要是的职责是在channel记录read、write的时间，以及处理建立连接后的回调逻辑，比如dubbo支持在断开后自定义回调的hook（onconnect），即在该操作中执行。
- 断开连接：disconnected，主要是的职责是在channel移除read、write的时间，以及处理端开连接后的回调逻辑，比如dubbo支持在断开后自定义回调的hook（ondisconnect），即在该操作中执行。
- 发送消息：sent，包括发送请求和发送响应。记录write的时间。
- 接收消息：received，包括接收请求和接收响应。记录read的时间。
- 异常捕获：caught，用于处理在channel上发生的各类异常。

Dubbo框架的线程模型与以上这五种行为息息相关，Dubbo协议Provider线程模型可以分为五类，也就是AllDispatcher、DirectDispatcher、MessageOnlyDispatcher、ExecutionDispatcher、ConnectionOrderedDispatcher。

### All Dispatcher

下图是All Dispatcher的线程模型说明图：

![dubbo-provider-alldispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-alldispatcher.png)

- 在IO线程中执行的操作有：
  1. sent操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received、connected、disconnected、caught都是在Dubbo线程上执行的。
  2. 反序列化请求的行为在Dubbo中做的。

### Direct Dispatcher

下图是Direct Dispatcher的线程模型说明图：

![dubbo-provider-directDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-directDispatcher.png)

- 在IO线程中执行的操作有：
  1. received、connected、disconnected、caught、sent操作在IO线程上执行。
  2. 反序列化请求和序列化响应在IO线程上执行。
- 1. 并没有在Dubbo线程操作的行为。

### Execution Dispatcher

下图是Execution Dispatcher的线程模型说明图：

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- 在IO线程中执行的操作有：
  1. sent、connected、disconnected、caught操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received都是在Dubbo线程上执行的。
  2. 反序列化请求的行为在Dubbo中做的。

### Message Only Dispatcher

在Provider端，Message Only Dispatcher和Execution Dispatcher的线程模型是一致的，所以下图和Execution Dispatcher的图一致，区别在Consumer端。见下方Consumer端的线程模型。

下图是Message Only Dispatcher的线程模型说明图：

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- 在IO线程中执行的操作有：
  1. sent、connected、disconnected、caught操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received都是在Dubbo线程上执行的。
  2. 反序列化请求的行为在Dubbo中做的。

### Connection Ordered Dispatcher

下图是Connection Ordered Dispatcher的线程模型说明图：

![dubbbo-provider-connectionOrderedDispatcher](/imgs/v3/feature/performance/threading-model/dubbbo-provider-connectionOrderedDispatcher.png)

- 在IO线程中执行的操作有：
  1. sent操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received、connected、disconnected、caught都是在Dubbo线程上执行的。但是connected和disconnected两个行为是与其他两个行为通过线程池隔离开的。并且在Dubbo connected thread pool中提供了链接限制、告警灯能力。
  2. 反序列化请求的行为在Dubbo中做的。

# Triple协议——Provider端线程模型

下图为Triple协议 Provider端的线程模型

![triple-provider](/imgs/v3/feature/performance/threading-model/triple-provider.png)

Triple协议Provider线程模型目前还比较简单，目前序列化和反序列化操作都在Dubbo线程上工作，而IO线程并没有承载这些工作。



# 如何调整线程模型

拿yaml的配置方式举例：在protocol下配置dispatcher: all，即可把dubbo协议的线程模型调整为All Dispatcher

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: dubbo
    port: -1
    dispatcher: all
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
  config-center:
    address: zookeeper://127.0.0.1:2181
  metadata-report:
    address: zookeeper://127.0.0.1:2181
```

各线程模型的配置值：

- All Dispatcher all
- Direct Dispatcher direct
- Execution Dispatcher execution
- Message Only Dispatcher: message
- Connection Ordered Dispatcher: connection
