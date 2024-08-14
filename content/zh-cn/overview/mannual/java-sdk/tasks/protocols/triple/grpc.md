---
aliases:
    - /zh/overview/tasks/protocols/grpc/
description: "演示了如何使用 triple 协议实现 Dubbo 服务与标准 gRPC 服务的互相调用。"
linkTitle: 发布/调用标准gRPC服务
title: 使用 Dubbo 开发 gRPC 服务
type: docs
weight: 5
---

这个示例演示了如何使用 triple 协议实现 Dubbo 服务与标准 gRPC 服务的互相调用，可在此查看 [示例完整源码](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-grpc)

![triple-grpc.png](/imgs/v3/tasks/protocol/triple-grpc.png)

就像在 [Triple协议规范](https://dubbo.apache.org/zh-cn/overview/reference/protocols/triple/) 中所描述的，triple 协议与 gRPC 协议保持 100% 兼容，同时在易用性方面有了非常大的提升（比如支持 cURL、浏览器直接访问等），可以说 triple 是一个更好用的 gRPC 设计与实现。

## 运行示例

首先，可通过以下命令下载示例源码
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

进入示例源码目录：
```shell
cd dubbo-samples/2-advanced/dubbo-samples-triple-grpc
```

接下来，我们分别从 dubbo 调用 grpc、grpc 调用 dubbo 两个不同的方向，看一下如何基于 triple 协议实现互调。

### 作为标准的 gRPC Server
在这一部分，我们会发布一个 Dubbo Triple Server，然后启动一个标准的 gRPC 消费端（示例采用谷歌官方发布的 grpc-java 编码）来调用 Triple 服务。
 
#### 启动 Dubbo server
确保你在 `dubbo-samples-triple-grpc` 目录，运行以下命令：

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.server.TriOpServer"
```

#### 使用标准 gRPC client 调用 Triple 服务
打开一个新的终端，在 `dubbo-samples-triple-grpc` 目录运行以下命令：

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.server.GrpcClient"
```

### 作为标准的 gRPC Client
以下部分我们演示如何使用 triple 协议访问谷歌官方的 gRPC 服务（示例采用谷歌官方发布的 grpc-java 编写）.

#### 启动标准 gRPC server
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.client.GrpcServer"
```

#### 使用 Dubbo client 调用标准 gRPC 服务
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.client.TriOpClient"
```

## 更多内容

本示例主要演示 triple 可以 100% 兼容谷歌发布的 gRPC 框架，而在 triple 相关部分具体代码与配置上，本示例与之前介绍的 [基于 protobuf 的 triple 示例完全一致](../idl/)，因此我们不再重复讲解源代码与开发步骤。

本示例演示的是 unary 模式的通信兼容性，对于 streaming 模式同样适用。


