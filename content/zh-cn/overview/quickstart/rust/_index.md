---
aliases:
    - /zh/overview/quickstart/rust/
description: Rust 微服务开发入门
hide: true
linkTitle: Rust
no_list: true
title: Rust 微服务开发入门
type: docs
weight: 3
---




请在此查看完整 [示例](https://github.com/apache/dubbo-rust/tree/main/examples/greeter)。

## 1 前置条件
- 安装 [Rust](https://rustup.rs/) 开发环境
- 安装 [protoc](https://grpc.io/docs/protoc-installation/) 工具

## 2 使用 IDL 定义 Dubbo 服务

Greeter 服务定义如下，包含一个 Unary(request-response) 模型的 Dubbo 服务。

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

## 3 添加 Dubbo-rust 及相关依赖到项目
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

## 4 配置 dubbo-build 编译 IDL

在项目根目录创建 (not /src)，创建 `build.rs` 文件并添加以下内容：

```rust
// ./build.rs
fn main() {
    dubbo_build::prost::configure()
        .compile(&["proto/greeter.proto"], &["proto/"])
        .unwrap();
}
```
这样配置之后，编译项目就可以生成 Dubbo Stub 相关代码，路径一般在`./target/debug/build/example-greeter-<id>/out/org.apache.dubbo.sample.tri.rs`。

## 5 编写 Dubbo 业务代码

### 5.1 编写 Dubbo Server

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

### 5.2 配置dubbo.yaml

dubbo.yaml指示server端的配置，包括暴露的服务列表、协议配置、监听配置等。

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

### 5.3 编写 Dubbo Client

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

## 6 运行并总结

1. 编译

执行`cargo build`来编译server和client。

2. 运行server

执行`./target/debug/greeter-server`来运行server，如上文dubbo.yaml所配置，server会监听8888端口，并以triple协议提供RPC服务：

```sh
$ ./target/debug/greeter-server
2022-09-28T23:33:28.104577Z  INFO dubbo::framework: url: Some(Url { uri: "triple://0.0.0.0:8888/org.apache.dubbo.sample.tri.Greeter", protocol: "triple", location: "0.0.0.0:8888", ip: "0.0.0.0", port: "8888", service_key: ["org.apache.dubbo.sample.tri.Greeter"], params: {} })
```

3. 运行client，验证调用是否成功

执行`./target/debug/greeter-client`来运行client，调用`triple://127.0.0.1:8888/org.apache.dubbo.sample.tri.Greeter`下的各种方法：


```sh
$ ./target/debug/greeter-client
Response: GreeterReply { message: "hello, dubbo-rust" }
```

## 7 更多示例

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/rust-sdk/streaming/" >}}'>Streaming 通信模式</a>
                </h4>
                <p>使用 Dubbo Rust 实现 Streaming 通信模型。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/rust-sdk/java-interoperability/" >}}'>与 Dubbo Java 互通</a>
                </h4>
                <p>实现与其他 Dubbo 多语言服务的互通</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
