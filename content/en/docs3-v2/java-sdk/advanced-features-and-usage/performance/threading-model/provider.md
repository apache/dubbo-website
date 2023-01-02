---
type: docs
title: "Server Thread Model"
linkTitle: "Server-side threading model"
weight: 1
description: "Dubbo service provides end-to-end thread pool model and usage"
---



The current threading models of the Dubbo protocol and the Triple protocol are not yet aligned. The threading models of the Triple protocol and the Dubbo protocol are introduced separately below.

# Dubbo protocol - Provider-side threading model

Before introducing the Provider-side threading model of the Dubbo protocol, it is introduced that Dubbo abstracts the operations on the channel into five behaviors:

- Establish a connection: connected, the main responsibility is to record the time of read and write in the channel, and handle the callback logic after the connection is established. For example, dubbo supports a custom callback hook (onconnect) after disconnection, that is, in this operation implement.
- Disconnected: disconnected, the main responsibility is to remove the read and write time of the channel, and handle the callback logic after the connection is opened. For example, dubbo supports a custom callback hook (ondisconnect) after disconnection, that is, in in this operation.
- Send message: sent, including sending request and sending response. Record the write time.
- Received message: received, including receiving request and receiving response. Record the read time.
- Exception capture: caught, used to handle various exceptions that occur on the channel.

The thread model of the Dubbo framework is closely related to the above five behaviors. The thread model of the Dubbo protocol Provider can be divided into five categories, namely AllDispatcher, DirectDispatcher, MessageOnlyDispatcher, ExecutionDispatcher, and ConnectionOrderedDispatcher.

### All Dispatcher

The following figure is an illustration of the threading model of All Dispatcher:

![dubbo-provider-alldispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-alldispatcher.png)

- The operations performed in the IO thread are:
  1. The sent operation is executed on the IO thread.
  2. The serialized response is executed on the IO thread.
- The operations performed in the Dubbo thread are:
  1. Received, connected, disconnected, and caught are all executed on the Dubbo thread.
  2. The behavior of deserializing the request is done in Dubbo.

### Direct Dispatcher

The following figure is an illustration of the threading model of Direct Dispatcher:

![dubbo-provider-directDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-directDispatcher.png)

- The operations performed in the IO thread are:
  1. The received, connected, disconnected, caught, and sent operations are executed on the IO thread.
  2. The deserialization request and serialization response are executed on the IO thread.
- 1. It does not operate on Dubbo threads.

### Execution Dispatcher

The following figure is an illustration of the thread model of Execution Dispatcher:

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- The operations performed in the IO thread are:
  1. The sent, connected, disconnected, and caught operations are executed on the IO thread.
  2. The serialized response is executed on the IO thread.
- The operations performed in the Dubbo thread are:
  1. Received is executed on the Dubbo thread.
  2. The behavior of deserializing the request is done in Dubbo.

### Message Only Dispatcher

On the Provider side, the threading models of Message Only Dispatcher and Execution Dispatcher are consistent, so the following figure is consistent with that of Execution Dispatcher, and the difference is on the Consumer side. See the threading model on the Consumer side below.

The following figure is an illustration of the threading model of Message Only Dispatcher:

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- The operations performed in the IO thread are:
  1. The sent, connected, disconnected, and caught operations are executed on the IO thread.
  2. The serialized response is executed on the IO thread.
- The operations performed in the Dubbo thread are:
  1. Received is executed on the Dubbo thread.
  2. The behavior of deserializing the request is done in Dubbo.

### Connection Ordered Dispatcher

The following figure is an illustration of the threading model of the Connection Ordered Dispatcher:

![dubbbo-provider-connectionOrderedDispatcher](/imgs/v3/feature/performance/threading-model/dubbbo-provider-connectionOrderedDispatcher.png)

- The operations performed in the IO thread are:
  1. The sent operation is executed on the IO thread.
  2. The serialized response is executed on the IO thread.
- The operations performed in the Dubbo thread are:
  1. Received, connected, disconnected, and caught are all executed on the Dubbo thread. But the two behaviors of connected and disconnected are isolated from the other two behaviors through the thread pool. And in Dubbo connected thread pool, link limit and warning light capabilities are provided.
  2. The behavior of deserializing the request is done in Dubbo.

# Triple protocol——Provider-side threading model

The following figure shows the threading model of the Provider side of the Triple protocol

![triple-provider](/imgs/v3/feature/performance/threading-model/triple-provider.png)

The provider thread model of the Triple protocol is relatively simple at present. Currently, the serialization and deserialization operations work on the Dubbo thread, while the IO thread does not carry these tasks.



# How to adjust the threading model

Take the yaml configuration method as an example: configure dispatcher: all under protocol to adjust the thread model of the dubbo protocol to All Dispatcher

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

Configuration values for each threading model:

- All Dispatcher all
  -Direct Dispatcher direct
- Execution Dispatcher execution
- Message Only Dispatcher: message
- Connection Ordered Dispatcher: connection