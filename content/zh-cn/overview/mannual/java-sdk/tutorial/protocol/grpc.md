---
aliases:
    - /zh/overview/tasks/protocols/grpc/
description: "使用 Dubbo 开发与 gRPC 互通的服务"
linkTitle: 开发gRPC兼容的服务
title: 使用 Dubbo 开发 gRPC 服务
type: docs
weight: 1
---

这个示例演示了如何使用 Triple 协议实现 Dubbo 服务与标准 gRPC 服务的互相调用。
> 本示例用 Java 语言编写。对于 Go、Node.js、Rust 等其他 Dubbo 语言实现，同样具备与 gRPC 协议互通的能力，具体请参见相应 sdk 文档。

其他相关示例：
* [基于 IDL 的 Triple 协议编码方式](../triple/)
* [无 IDL 的 Triple 协议编码方式](/zh-cn/overview/quickstart/rpc/java/)

![triple-grpc.png](/imgs/v3/reference/protocol/triple-grpc.png)

就像在 [Triple协议规范](https://dubbo.apache.org/zh-cn/overview/reference/protocols/triple/) 中所描述的，Triple 协议与 gRPC 协议保持 100% 兼容，同时在易用性方面有了非常大的提升（比如支持 cURL、浏览器直接访问等），可以说 Triple 是一个更好用的 gRPC 设计与实现。

## 作为标准的 gRPC Server
在这一部分，我们会发布一个 Dubbo Triple Server，然后启动一个标准的 gRPC 消费端（采用 grpc-java 编码）来调用 Triple 服务。示例源码在 [dubbo-samples-triple-grpc](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-grpc)，请下载源码并依照以下命令体验。
 
### 启动 Dubbo server
Make sure you are in `dubbo-samples-triple-grpc` directory and then run the following command:

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.server.TriOpServer"
```

### 使用标准 gRPC client 调用 Triple 服务
Open a new terminal, enter `dubbo-samples-triple-grpc` directory and then run the following command:

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.server.GrpcClient"
```

## 调用标准的 gRPC Server
This part showcases how Triple client written with Dubbo consumes gRPC service written with standard gRPC-java.

### 启动标准 gRPC server
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.client.GrpcServer"
```

### 使用 Dubbo client 调用标准 gRPC 服务
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.client.TriOpClient"
```



