---
aliases:
    - /zh/docs3-v2/rust-sdk/java-interoperability/
    - /zh-cn/docs3-v2/rust-sdk/java-interoperability/
description: 使用 Rust 调用 Java 开发的 Dubbo 服务。
linkTitle: Rust和Java互相调用
title: Rust和Java互相调用
type: docs
weight: 2
---






## 1 前置条件
- 安装 [Rust](https://rustup.rs/) 开发环境
- 安装 [protoc](https://grpc.io/docs/protoc-installation/) 工具
- 安装 Java 开发环境

## 2 运行示例 Java 版本的 Dubbo provider

Java 版本的 Dubbo provider 示例源码见<https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple>。

Clone 源代码、编译构建，并运行 provider：

```sh
$ # clone 源代码
$ git clone https://github.com/apache/dubbo-samples.git
$ cd dubbo-samples/dubbo-samples-triple/

$ # 构建
$ mvn clean compile package -DskipTests

$ # 运行 provider
$ java -Dprovider.port=8888 -jar ./target/dubbo-samples-triple-1.0-SNAPSHOT.jar
# ……省略部分日志
Dubbo triple stub server started, port=8888
```

[Java 侧的接口定义](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main/proto/greeter.proto)

## 3 运行 Rust 版本的 Dubbo consumer

Rust 版本的 Dubbo consumer 示例源码见<https://github.com/apache/dubbo-rust/tree/main/examples/greeter>。

Clone 源代码、编译构建，并运行 consumer：

```sh
$ # clone 源代码
$ git clone https://github.com/apache/dubbo-rust.git
$ cd dubbo-rust/examples/greeter/

$ # 构建
$ cargo build

$ # 运行 consumer，调用provider
$ ../../target/debug/greeter-client
# unary call
Response: GreeterReply { message: "hello, dubbo-rust" }
# client stream
client streaming, Response: GreeterReply { message: "hello client streaming" }
# bi stream
parts: Metadata { inner: {"content-type": "application/grpc", "date": "Wed, 28 Sep 2022 23:54:56 GMT"} }
reply: GreeterReply { message: "server reply: \"msg1 from client\"" }
reply: GreeterReply { message: "server reply: \"msg2 from client\"" }
reply: GreeterReply { message: "server reply: \"msg3 from client\"" }
trailer: Some(Metadata { inner: {"grpc-message": "poll trailer successfully.", "grpc-accept-encoding": "gzip,identity", "content-type": "application/grpc", "grpc-status": "0"} })
# server stream
parts: Metadata { inner: {"content-type": "application/grpc", "date": "Wed, 28 Sep 2022 23:54:56 GMT"} }
reply: GreeterReply { message: "msg1 from server" }
reply: GreeterReply { message: "msg2 from server" }
reply: GreeterReply { message: "msg3 from server" }
trailer: Some(Metadata { inner: {"content-type": "application/grpc", "grpc-message": "poll trailer successfully.", "grpc-accept-encoding": "gzip,identity", "grpc-status": "0"} })
```

[Rust侧的接口定义](https://github.com/apache/dubbo-rust/blob/main/examples/greeter/proto/greeter.proto)