---
aliases:
    - /en/docs3-v2/rust-sdk/unix-transport/
    - /en/docs3-v2/rust-sdk/unix-transport/
description: Introduction to using the Dubbo Rust Triple protocol to implement communication via the Unix socket connector.
linkTitle: Communication using Unix Socket Connector
title: Communication using Unix Socket Connector
type: docs
weight: 3
---






This article focuses on using the Dubbo Rust Triple protocol with Unix sockets. Please refer to the [Quick Start](../quick-start) for basic usage of Dubbo Rust, and you can see the [complete example](https://github.com/apache/dubbo-rust/tree/main/examples/greeter) here.

## 1 Explanation of Using Unix Socket Connector
> #[cfg(any(target_os = "macos", target_os="unix"))] The unix module will be compiled for use when the operating system meets the cfg configuration, otherwise it cannot be used.

## 2 Logic for Using Unix Socket Connector with client/connection

### 2.1 Writing the Client Side

```rust
// examples/echo/src/echo/client.rs
// Initialize Client using ClientBuilder
let builder = ClientBuilder::new().with_connector("unix").with_host("unix://127.0.0.1:8888");
let mut cli = EchoClient::build(builder);
```

### 2.2 Writing the Server Side

```rust
// examples/echo/src/echo/server.rs
// Initialize Server using serverbuilder
let builder = ServerBuilder::new()
    .with_listener("unix".to_string())
    .with_service_names(vec!["grpc.examples.echo.Echo".to_string()])
    .with_addr("127.0.0.1:8888");
builder.build().serve().await.unwrap();

```

## 3 Running Example

1. Compile

Run `cargo build` to compile the server and client.

2. Run the server

Run `cargo run --bin echo-server` to start the server. As configured in the dubbo.yaml above, the server will listen on port 8888 and provide RPC services using the triple protocol:

```sh
$ cargo run --bin echo-server
2023-01-19T08:36:25.663138Z  INFO dubbo::triple::server::builder: server starting. addr: Some(127.0.0.1:8888)
```

3. Run the client to see Unix communication in action

Run `cargo run --bin echo-client` to start the client, calling various methods under `triple://127.0.0.1:8888/org.apache.dubbo.sample.tri.Greeter`:


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

