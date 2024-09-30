---
aliases:
    - /en/docs3-v2/rust-sdk/quick-start/
    - /en/docs3-v2/rust-sdk/quick-start/
    - /en/overview/quickstart/rust/
    - /en/overview/quickstart/rust/
description: Quickly develop Dubbo services using Rust.
linkTitle: Quick Start
title: Quick Start
type: docs
weight: 1
---






View the complete [example](https://github.com/apache/dubbo-rust/tree/main/examples/greeter) here.

## 1 Prerequisites
- Install the [Rust](https://rustup.rs/) development environment
- Install the [protoc](https://grpc.io/docs/protoc-installation/) tool

## 2 Define Dubbo Services Using IDL

The Greeter service is defined as follows, including a Dubbo service with a Unary (request-response) model.

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
}
```

## 3 Add Dubbo-rust and Related Dependencies to the Project
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

## 4 Configure dubbo-build to Compile IDL

Create a `build.rs` file in the project root directory (not /src) and add the following content:

```rust
// ./build.rs
fn main() {
    dubbo_build::prost::configure()
        .compile(&["proto/greeter.proto"], &["proto/"])
        .unwrap();
}
```
After this configuration, compiling the project will generate related Dubbo Stub code, usually located at `./target/debug/build/example-greeter-<id>/out/org.apache.dubbo.sample.tri.rs`.

## 5 Write Dubbo Business Code

### 5.1 Write Dubbo Server

```rust
// ./src/greeter/server.rs
use ...

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
}
```

### 5.2 Configure dubbo.yaml

The dubbo.yaml file specifies the server-side configuration, including the exposed service list, protocol configuration, listening configuration, etc.

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

### 5.3 Write Dubbo Client

```rust
// ./src/greeter/client.rs
use ...

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
}
```

## 6 Run and Summarize

1. Compile

Run `cargo build` to compile the server and client.

2. Run the server

Run `./target/debug/greeter-server` to start the server, which will listen on port 8888 and provide RPC services using the triple protocol as configured in dubbo.yaml:

```sh
$ ./target/debug/greeter-server
2022-09-28T23:33:28.104577Z  INFO dubbo::framework: url: Some(Url { uri: "triple://0.0.0.0:8888/org.apache.dubbo.sample.tri.Greeter", protocol: "triple", location: "0.0.0.0:8888", ip: "0.0.0.0", port: "8888", service_key: ["org.apache.dubbo.sample.tri.Greeter"], params: {} })
```

3. Run the client to verify successful invocation

Run `./target/debug/greeter-client` to execute the client and call various methods under `triple://127.0.0.1:8888/org.apache.dubbo.sample.tri.Greeter`:

```sh
$ ./target/debug/greeter-client
Response: GreeterReply { message: "hello, dubbo-rust" }
```

## 7 More Examples

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/rust-sdk/streaming/" >}}'>Streaming Communication Mode</a>
                </h4>
                <p>Implement Streaming communication model using Dubbo Rust.</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/rust-sdk/java-interoperability/" >}}'>Interoperability with Dubbo Java</a>
                </h4>
                <p>Implement interoperability with other Dubbo multi-language services.</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}

