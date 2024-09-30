---
title: "Dubbo Context Information"
linkTitle: "Dubbo Context Information"
tags: ["Java"]
date: 2018-07-12
description: >
    Introduction to the function, application scenarios, usage method, and precautions of Dubbo context information.
---

## Introduction
Context information is the environmental information attached to an RPC call, such as method name, parameter types, real parameters, local/remote addresses, etc. This data belongs solely to a single call, affecting the entire process of the call from Consumer to Provider.

Providing context information is a crucial function of RPC frameworks. Using context not only allows specifying different configurations for individual calls but also enables powerful upper-layer functionalities, such as distributed tracing. Its implementation principle involves maintaining a `span_id` in the context, where Consumer and Provider connect through this `span_id` to link an RPC call, enabling complete call flow visualization in the tracing system after logging reports.

## Usage Instructions
The class that represents the context in Dubbo is `org.apache.dubbo.rpc.RpcContext`, which can be accessed with the following code.
```
RpcContext.getContext()
```
## Usage Scenarios
### Get Call Information
| Method Name            | Purpose                     | Scope    | Description                                                  |
| :--------------------- | --------------------------- | -------- | ------------------------------------------------------------ |
| getRequest             | Get RPC request object      | Consumer | Gets the underlying RPC request object, e.g., HttpServletRequest, or null in other cases |
| getResponse            | Get RPC response            | Consumer | Gets the underlying RPC response object, e.g., HttpServletResponse, or null in other cases |
| isProviderSide         | Is it in Provider context    | Both     | True when the service is called, false when calling another service |
| isConsumerSide         | Is it in Consumer context    | Both     | False when the service is called, true when calling another service |
| getUrls                | Get list of callable URLs    | Both     | Changes in real-time according to different Failover strategies on the Consumer side |
| getRemotePort          | Get remote port             | Both     | Consumer side is the last Provider port called, Provider is the current Consumer port |
| getRemoteHost          | Get remote host address      | Both     |                                                              |
| getRemoteHostName      | Get remote host name        | Both     |                                                              |
| getRemoteAddressString | Get remote address          | Both     |                                                              |
| getRemoteAddress       | Get remote address          | Both     |                                                              |
| getLocalPort           | Get local port              | Both     |                                                              |
| getLocalHost           | Get local host address      | Both     |                                                              |
| getLocalHostName       | Get local host name         | Both     |                                                              |
| getLocalAddressString  | Get local address           | Both     |                                                              |
| getLocalAddress        | Get local address           | Both     |                                                              |



### Passing User Parameters

#### Local Passing

Call the `get` and `set` methods to complete parameter passing primarily for data sharing between local Filters.

#### Remote Passing

Call `setAttachment` and `getAttachment` to pass data to the remote side, which will be transmitted via RPC. For example, Consumer passes `span_id` to Provider.

- Dubbo supports passing parameters from Provider to Consumer with the same read and write methods as during Consumer calls.

### Asynchronous Calls

In asynchronous calls, related Futures can be obtained through `getCompletableFuture` or `getFuture`. For documentation on asynchronous calls, please refer to: [Asynchronous Calls](/en/docs/advanced/async-call/)

## Precautions

Dubbo uses ThreadLocal to store the context information for each call. When a request is received or initiated, the current thread updates RpcContext. For example, when Service A calls Service B, and Service B calls Service C, before B calls C, RpcContext records the information of A calling B; after B calls C, RpcContext records the information of B calling C.
