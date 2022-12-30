---
type: docs
title: "Quick start"
linkTitle: "Quick start"
weight: 1
description: "Quick start to use Dubbo-rust"
---

See the full example [here](https://github.com/apache/dubbo-rust/tree/main/examples/greeter).

## 1 Prerequisite
- Install [Rust development environment](https://rustup.rs/).
- Install [protoc](https://grpc.io/docs/protoc-installation/).

## 2 Use IDL to define Dubbo service

The Greeter service is defined as follows, contains a Unary, Client stream, Server stream, Bidirectional stream model Dubbo service:

```protobuf
// ./proto/greeter.proto
syntax = "proto3";

option java_multiple_files = true;

package org.apache.dubbo.sample.tri;


// The request message containing the user's name.
message GreeterRequest {
  string name = 1;
}

// The response message containing the greetings
message GreeterReply {
  string message = 1;
}

service Greeter{

  // unary
  rpc greet(GreeterRequest) returns (GreeterReply);

  // clientStream
  rpc greetClientStream(stream GreeterRequest) returns (GreeterReply);

  // serverStream
  rpc greetServerStream(GreeterRequest) returns (stream GreeterReply);

  // bi streaming
  rpc greetStream(stream GreeterRequest) returns (stream GreeterReply);

}
```

## 3 Add Dubbo-rust and other dependencies
```toml
# ./Cargo.toml
[package]
name = "example-greeter"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "greeter-server"
path = "src/greeter/server.rs"

[[bin]]
name = "greeter-client"
path = "src/greeter/client.rs"

[dependencies]
http = "0.2"
http-body = "0.4.4"
futures-util = {version = "0.3", default-features = false}
tokio = { version = "1.0", features = [ "rt-multi-thread", "time", "fs", "macros", "net", "signal"] }
prost-derive = {version = "0.10", optional = true}
prost = "0.10.4"
async-trait = "0.1.56"
tokio-stream = "0.1"

dubbo = "0.1.0"
dubbo-config = "0.1.0"

[build-dependencies]
dubbo-build = "0.1.0"
```

## 4 Configure dubbo-build to compile IDL

Create `build.rs` at project root directory:

```rust
// ./build.rs
fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("proto/helloworld.proto")?;
    Ok(())
}
```

After this configuration, the project compiling will generate Dubbo stub code, where the path is usually located `./target/debug/build/example-greeter-<id>/out/org.apache.dubbo.sample.tri.rs`.

## 5 Implement server and client

### 5.1 Write Dubbo-rust Server

```rust
// ./src/greeter/server.rs
pub mod protos {
    include!(concat!(env!("OUT_DIR"), "/org.apache.dubbo.sample.tri.rs"));
}

use futures_util::StreamExt;
use protos::{
    greeter_server::{register_server, Greeter},
    GreeterReply, GreeterRequest,
};

use std::{io::ErrorKind, pin::Pin};

use async_trait::async_trait;
use futures_util::Stream;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

use dubbo_config::RootConfig;
use dubbo::{codegen::*, Dubbo};

type ResponseStream =
    Pin<Box<dyn Stream<Item = Result<GreeterReply, dubbo::status::Status>> + Send>>;

#[tokio::main]
async fn main() {
    register_server(GreeterServerImpl {
        name: "greeter".to_string(),
    });

    // Dubbo::new().start().await;
    Dubbo::new()
        .with_config({
            let r = RootConfig::new();
            match r.load() {
                Ok(config) => config,
                Err(_err) => panic!("err: {:?}", _err), // response was droped
            }
        })
        .start()
        .await;
}

#[allow(dead_code)]
#[derive(Default, Clone)]
struct GreeterServerImpl {
    name: String,
}

// #[async_trait]
#[async_trait]
impl Greeter for GreeterServerImpl {
    async fn greet(
        &self,
        request: Request<GreeterRequest>,
    ) -> Result<Response<GreeterReply>, dubbo::status::Status> {
        println!("GreeterServer::greet {:?}", request.metadata);

        Ok(Response::new(GreeterReply {
            message: "hello, dubbo-rust".to_string(),
        }))
    }

    async fn greet_client_stream(
        &self,
        request: Request<Decoding<GreeterRequest>>,
    ) -> Result<Response<GreeterReply>, dubbo::status::Status> {
        let mut s = request.into_inner();
        loop {
            let result = s.next().await;
            match result {
                Some(Ok(val)) => println!("result: {:?}", val),
                Some(Err(val)) => println!("err: {:?}", val),
                None => break,
            }
        }
        Ok(Response::new(GreeterReply {
            message: "hello client streaming".to_string(),
        }))
    }

    type greetServerStreamStream = ResponseStream;
    async fn greet_server_stream(
        &self,
        request: Request<GreeterRequest>,
    ) -> Result<Response<Self::greetServerStreamStream>, dubbo::status::Status> {
        println!("greet_server_stream: {:?}", request.into_inner());

        let data = vec![
            Result::<_, dubbo::status::Status>::Ok(GreeterReply {
                message: "msg1 from server".to_string(),
            }),
            Result::<_, dubbo::status::Status>::Ok(GreeterReply {
                message: "msg2 from server".to_string(),
            }),
            Result::<_, dubbo::status::Status>::Ok(GreeterReply {
                message: "msg3 from server".to_string(),
            }),
        ];
        let resp = futures_util::stream::iter(data);

        Ok(Response::new(Box::pin(resp)))
    }

    type greetStreamStream = ResponseStream;
    async fn greet_stream(
        &self,
        request: Request<Decoding<GreeterRequest>>,
    ) -> Result<Response<Self::greetStreamStream>, dubbo::status::Status> {
        println!(
            "GreeterServer::greet_stream, grpc header: {:?}",
            request.metadata
        );

        let mut in_stream = request.into_inner();
        let (tx, rx) = mpsc::channel(128);

        // this spawn here is required if you want to handle connection error.
        // If we just map `in_stream` and write it back as `out_stream` the `out_stream`
        // will be drooped when connection error occurs and error will never be propagated
        // to mapped version of `in_stream`.
        tokio::spawn(async move {
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(v) => {
                        // if v.name.starts_with("msg2") {
                        //     tx.send(Err(dubbo::status::Status::internal(format!("err: args is invalid, {:?}", v.name))
                        //     )).await.expect("working rx");
                        //     continue;
                        // }
                        tx.send(Ok(GreeterReply {
                            message: format!("server reply: {:?}", v.name),
                        }))
                        .await
                        .expect("working rx")
                    }
                    Err(err) => {
                        if let Some(io_err) = match_for_io_error(&err) {
                            if io_err.kind() == ErrorKind::BrokenPipe {
                                // here you can handle special case when client
                                // disconnected in unexpected way
                                eprintln!("\tclient disconnected: broken pipe");
                                break;
                            }
                        }

                        match tx.send(Err(err)).await {
                            Ok(_) => (),
                            Err(_err) => break, // response was droped
                        }
                    }
                }
            }
            println!("\tstream ended");
        });

        // echo just write the same data that was received
        let out_stream = ReceiverStream::new(rx);

        Ok(Response::new(
            Box::pin(out_stream) as Self::greetStreamStream
        ))
    }
}

fn match_for_io_error(err_status: &dubbo::status::Status) -> Option<&std::io::Error> {
    let mut err: &(dyn std::error::Error + 'static) = err_status;

    loop {
        if let Some(io_err) = err.downcast_ref::<std::io::Error>() {
            return Some(io_err);
        }

        err = match err.source() {
            Some(err) => err,
            None => return None,
        };
    }
}
```

### 5.2 Configure dubbo.yaml

`dubbo.yaml` indicates the configuration of the server, including the exposed service list, protocol configuration, listening configuration, and so on.

```yaml
# ./dubbo.yaml
name: dubbo
service:
  org.apache.dubbo.sample.tri.Greeter:
    version: 1.0.0
    group: test
    protocol: triple
    registry: ''
    serializer: json
    protocol_configs:
      triple:
        ip: 0.0.0.0
        port: '8888'
        name: triple
protocols:
  triple:
    ip: 0.0.0.0
    port: '8888'
    name: triple
```

### 5.3 Write Dubbo-rust Client

```rust
// ./src/greeter/client.rs
pub mod protos {
    include!(concat!(env!("OUT_DIR"), "/org.apache.dubbo.sample.tri.rs"));
}

use dubbo::codegen::*;
use futures_util::StreamExt;
use protos::{greeter_client::GreeterClient, GreeterRequest};

#[tokio::main]
async fn main() {
    let mut cli = GreeterClient::new().with_uri("http://127.0.0.1:8888".to_string());

    println!("# unary call");
    let resp = cli
        .greet(Request::new(GreeterRequest {
            name: "message from client".to_string(),
        }))
        .await;
    let resp = match resp {
        Ok(resp) => resp,
        Err(err) => return println!("{:?}", err),
    };
    let (_parts, body) = resp.into_parts();
    println!("Response: {:?}", body);

    println!("# client stream");
    let data = vec![
        GreeterRequest {
            name: "msg1 from client streaming".to_string(),
        },
        GreeterRequest {
            name: "msg2 from client streaming".to_string(),
        },
        GreeterRequest {
            name: "msg3 from client streaming".to_string(),
        },
    ];
    let req = futures_util::stream::iter(data);
    let resp = cli.greet_client_stream(req).await;
    let client_streaming_resp = match resp {
        Ok(resp) => resp,
        Err(err) => return println!("{:?}", err),
    };
    let (_parts, resp_body) = client_streaming_resp.into_parts();
    println!("client streaming, Response: {:?}", resp_body);

    println!("# bi stream");
    let data = vec![
        GreeterRequest {
            name: "msg1 from client".to_string(),
        },
        GreeterRequest {
            name: "msg2 from client".to_string(),
        },
        GreeterRequest {
            name: "msg3 from client".to_string(),
        },
    ];
    let req = futures_util::stream::iter(data);

    let bidi_resp = cli.greet_stream(req).await.unwrap();

    let (parts, mut body) = bidi_resp.into_parts();
    println!("parts: {:?}", parts);
    while let Some(item) = body.next().await {
        match item {
            Ok(v) => {
                println!("reply: {:?}", v);
            }
            Err(err) => {
                println!("err: {:?}", err);
            }
        }
    }
    let trailer = body.trailer().await.unwrap();
    println!("trailer: {:?}", trailer);

    println!("# server stream");
    let resp = cli
        .greet_server_stream(Request::new(GreeterRequest {
            name: "server streaming req".to_string(),
        }))
        .await
        .unwrap();

    let (parts, mut body) = resp.into_parts();
    println!("parts: {:?}", parts);
    while let Some(item) = body.next().await {
        match item {
            Ok(v) => {
                println!("reply: {:?}", v);
            }
            Err(err) => {
                println!("err: {:?}", err);
            }
        }
    }
    let trailer = body.trailer().await.unwrap();
    println!("trailer: {:?}", trailer);
}
```

## 6 Run

1. Compile

Run `cargo build` to compile server and client.

2. Run server

Run `./target/debug/greeter-server` to start server. as configured above by dubbo.yaml, the server listens on port 8888 and provides RPC services over triple protocol:

```sh
$ ./target/debug/greeter-server
2022-09-28T23:33:28.104577Z  INFO dubbo::framework: url: Some(Url { uri: "triple://0.0.0.0:8888/org.apache.dubbo.sample.tri.Greeter", protocol: "triple", location: "0.0.0.0:8888", ip: "0.0.0.0", port: "8888", service_key: ["org.apache.dubbo.sample.tri.Greeter"], params: {} })
```

3. Run client, verify that the call was successful

Run `./target/debug/greeter-client` to start client, which will call methods under `triple://127.0.0.1:8888/org.apache.dubbo.sample.tri.Greeter`:


```sh
$ ./target/debug/greeter-client
# unary call
Response: GreeterReply { message: "hello, dubbo-rust" }
# client stream
client streaming, Response: GreeterReply { message: "hello client streaming" }
# bi stream
parts: Metadata { inner: {"content-type": "application/grpc", "date": "Wed, 28 Sep 2022 23:34:20 GMT"} }
reply: GreeterReply { message: "server reply: \"msg1 from client\"" }
reply: GreeterReply { message: "server reply: \"msg2 from client\"" }
reply: GreeterReply { message: "server reply: \"msg3 from client\"" }
trailer: Some(Metadata { inner: {"content-type": "application/grpc", "grpc-status": "0", "grpc-message": "poll trailer successfully.", "grpc-accept-encoding": "gzip,identity"} })
# server stream
parts: Metadata { inner: {"content-type": "application/grpc", "date": "Wed, 28 Sep 2022 23:34:20 GMT"} }
reply: GreeterReply { message: "msg1 from server" }
reply: GreeterReply { message: "msg2 from server" }
reply: GreeterReply { message: "msg3 from server" }
trailer: Some(Metadata { inner: {"content-type": "application/grpc", "grpc-status": "0", "grpc-message": "poll trailer successfully.", "grpc-accept-encoding": "gzip,identity"} })
```
