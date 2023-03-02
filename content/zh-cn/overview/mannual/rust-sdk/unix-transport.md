---
aliases:
    - /zh/docs3-v2/rust-sdk/unix-transport/
    - /zh-cn/docs3-v2/rust-sdk/unix-transport/
description: 介绍使用 Dubbo Rust Triple 协议使用 Unix 套接字连接器实现通信。
linkTitle: 使用Unix套接字连接器通信
title: 使用Unix套接字连接器通信
type: docs
weight: 3
---






本文重点讲解 Dubbo Rust Triple 协议使用Unix 套接，请先查看 [Quick Start](../quick-start) 了解 Dubbo Rust 基本使用，在此查看本文的[完整示例](https://github.com/apache/dubbo-rust/tree/main/examples/greeter)。

## 1 使用 Unix 套接字连接器 说明
> #[cfg(any(target_os = "macos", target_os="unix"))] 当操作系统符合cfg配置时，unix 模块会被编译使用，否则无法使用

## 2 使用 client/connection 使用 Unix 套接字连接器编写逻辑

### 2.1 编写 Client 端

```rust
// examples/echo/src/echo/client.rs
// 使用 ClientBuilder 初始化 Client
let builder = ClientBuilder::new().with_connector("unix").with_host("unix://127.0.0.1:8888");
let mut cli = EchoClient::build(builder);
```

### 2.2 编写 Server 端

```rust
// examples/echo/src/echo/server.rs
// 通过 serverbuilder 来初始化 Server
let builder = ServerBuilder::new()
    .with_listener("unix".to_string())
    .with_service_names(vec!["grpc.examples.echo.Echo".to_string()])
    .with_addr("127.0.0.1:8888");
builder.build().serve().await.unwrap();

```

## 3 运行示例

1. 编译

执行`cargo build`来编译server和client。

2. 运行server

执行`cargo run --bin echo-server`来运行server，如上文dubbo.yaml所配置，server会监听8888端口，并以triple协议提供RPC服务：

```sh
$ cargo run --bin echo-server
2023-01-19T08:36:25.663138Z  INFO dubbo::triple::server::builder: server starting. addr: Some(127.0.0.1:8888)
```

3. 运行client，可以看到 Unix 通信效果

执行`cargo run --bin echo-client`来运行client，调用`triple://127.0.0.1:8888/org.apache.dubbo.sample.tri.Greeter`下的各种方法：


```sh
$ cargo run --bin echo-client
2023-01-19T08:38:52.516792Z  INFO dubbo::triple::transport::connector::unix_connector: host is ip address: "127.0.0.1"
Response: EchoResponse { message: "hello, dubbo-rust" }
2023-01-19T08:38:52.526697Z  INFO dubbo::triple::transport::connector::unix_connector: host is ip address: "127.0.0.1"
client streaming, Response: EchoResponse { message: "hello client streaming" }
2023-01-19T08:38:52.539439Z  INFO dubbo::triple::transport::connector::unix_connector: host is ip address: "127.0.0.1"
parts: Metadata { inner: {"content-type": "application/grpc", "date": "Thu, 19 Jan 2023 08:38:52 GMT"} }
reply: EchoResponse { message: "server reply: \"msg1 from client\"" }
reply: EchoResponse { message: "server reply: \"msg2 from client\"" }
reply: EchoResponse { message: "server reply: \"msg3 from client\"" }
trailer: Some(Metadata { inner: {"grpc-accept-encoding": "gzip,identity", "grpc-status": "0", "grpc-message": "poll trailer successfully.", "content-type": "application/grpc"} })
2023-01-19T08:38:52.645035Z  INFO dubbo::triple::transport::connector::unix_connector: host is ip address: "127.0.0.1"
parts: Metadata { inner: {"content-type": "application/grpc", "date": "Thu, 19 Jan 2023 08:38:52 GMT"} }
reply: EchoResponse { message: "msg1 from server" }
reply: EchoResponse { message: "msg2 from server" }
reply: EchoResponse { message: "msg3 from server" }
trailer: Some(Metadata { inner: {"grpc-status": "0", "content-type": "application/grpc", "grpc-message": "poll trailer successfully.", "grpc-accept-encoding": "gzip,identity"} })
```