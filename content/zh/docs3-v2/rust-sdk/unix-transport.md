---
type: docs
title: "使用Unix套接字连接器通信"
linkTitle: "使用Unix套接字连接器通信"
weight: 3
description: "介绍使用 Dubbo Rust Triple 协议使用 Unix 套接字连接器实现通信。"
---

本文重点讲解 Dubbo Rust Triple 协议使用Unix 套接，请先查看 [Quick Start](../quick-start) 了解 Dubbo Rust 基本使用，在此查看本文的[完整示例](https://github.com/apache/dubbo-rust/tree/main/examples/greeter)。

## 1 Triple 使用 Unix 套接字连接器

TripleServer 调整如下。

```rust
// dubbo/src/protocol/triple/triple_server.rs
impl TripleServer {
    pub fn new(names: Vec<String>) -> TripleServer {
        Self {
            service_names: names,
            s: DubboServer::new(),
        }
    }

    pub async fn serve(mut self, url: String) {
        {
            let lock = super::TRIPLE_SERVICES.read().unwrap();
            for name in self.service_names.iter() {
                if lock.get(name).is_none() {
                    tracing::warn!("service ({}) not register", name);
                    continue;
                }
                let svc = lock.get(name).unwrap();

                self.s = self.s.add_service(name.clone(), svc.clone());
            }
        }

        let uri = match http::Uri::from_str(&url) {
            Ok(v) => v,
            Err(err) => {
                tracing::error!("http uri parse error: {}, url: {:?}", err, &url);
                return;
            }
        };

        let authority = match uri.authority() {
            Some(v) => v.to_owned(),
            None => {
                tracing::error!("http authority is none");
                return;
            }
        };

        self.s
            .with_listener("unix".to_string())
            .serve(
                authority
                    .to_string()
                    .to_socket_addrs()
                    .unwrap()
                    .next()
                    .unwrap(),
            )
            .await
            .unwrap();
    }
}

}
```

## 2 使用 client/connection 使用 Unix 套接字连接器编写逻辑

### 2.1 编写 Client 端

```rust
// examples/echo/src/echo/client.rs
...
let mut cli = EchoClient::connect("unix://0.0.0.0:8888".to_string());
...
```

### 2.2 编写 connection

```rust
// dubbo/src/triple/client/connection.rs
impl Connection {
    pub fn new() -> Self {
        Connection {
            host: hyper::Uri::default(),
            connector: "unix".to_string(),
            builder: Builder::new(),
        }
    }

    pub fn with_connector<C>(mut self, connector: String) -> Self {
        self.connector = connector;
        self
    }

    pub fn with_host(mut self, uri: hyper::Uri) -> Self {
        self.host = uri;
        self
    }

    pub fn with_builder(mut self, builder: Builder) -> Self {
        self.builder = builder;
        self
    }
}
```

## 3 运行示例

1. 编译

执行`cargo build`来编译server和client。

2. 运行server

执行`cargo run --bin echo-server`来运行server，如上文dubbo.yaml所配置，server会监听8888端口，并以triple协议提供RPC服务：

```sh
$ cargo run --bin echo-server
2022-12-05T10:40:20.829798Z  INFO dubbo::framework: url: triple://0.0.0.0:8888//grpc.examples.echo.Echo
2022-12-05T10:40:20.829830Z DEBUG dubbo::framework: service name: grpc.examples.echo.Echo, service_config: ServiceConfig { version: "1.0.0", group: "test", name: "", protocol: "triple", registry: "zookeeper", serializer: "json", protocol_configs: {"triple": ProtocolConfig { ip: "0.0.0.0", port: "8888", name: "triple", params: {} }} }
2022-12-05T10:40:20.829917Z  INFO dubbo::framework: protocol: "", service url: Url { uri: "triple://0.0.0.0:8888//grpc.examples.echo.Echo", protocol: "triple", location: "0.0.0.0:8888", ip: "0.0.0.0", port: "8888", service_key: ["grpc.examples.echo.Echo"], params: {} }
2022-12-05T10:40:20.830028Z DEBUG dubbo::triple::transport::listener: get_listener: "unix"
```

3. 运行client，可以看到 Unix 通信效果

执行`cargo run --bin echo-client`来运行client，调用`triple://127.0.0.1:8888/org.apache.dubbo.sample.tri.Greeter`下的各种方法：


```sh
$ cargo run --bin echo-client
# unary call
fake filter: Metadata { inner: {"path": "/grpc.examples.echo.Echo/UnaryEcho", "tri-unit-info": "dubbo-rust/0.1.0", "grpc-accept-encoding": "gzip", "authority": "0.0.0.0:8888", "te": "trailers", "method": "POST", "grpc-encoding": "gzip", "tri-request-time": "1670237034581", "tri-service-group": "cluster", "content-type": "application/grpc+json", "tri-service-version": "dubbo-rust/0.1.0", "scheme": "unix", "user-agent": "dubbo-rust/0.1.0"} }
Response: EchoResponse { message: "hello, dubbo-rust" }
client streaming, Response: EchoResponse { message: "hello client streaming" }
parts: Metadata { inner: {"date": "Mon, 05 Dec 2022 10:43:57 GMT", "content-type": "application/grpc"} }
reply: EchoResponse { message: "server reply: \"msg1 from client\"" }
reply: EchoResponse { message: "server reply: \"msg2 from client\"" }
reply: EchoResponse { message: "server reply: \"msg3 from client\"" }
trailer: Some(Metadata { inner: {"grpc-message": "poll trailer successfully.", "content-type": "application/grpc", "grpc-accept-encoding": "gzip,identity", "grpc-status": "0"} })
parts: Metadata { inner: {"content-type": "application/grpc", "date": "Mon, 05 Dec 2022 10:43:58 GMT"} }
reply: EchoResponse { message: "msg1 from server" }
reply: EchoResponse { message: "msg2 from server" }
reply: EchoResponse { message: "msg3 from server" }
trailer: Some(Metadata { inner: {"grpc-status": "0", "grpc-message": "poll trailer successfully.", "grpc-accept-encoding": "gzip,identity", "content-type": "application/grpc"} })
```
