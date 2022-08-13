---
type: docs
title: "快速开始"
linkTitle: "快速开始"
weight: 1
description: "使用 Rust 快速开发 Dubbo 服务。"
---

请在此查看完整 [示例](https://github.com/apache/dubbo-rust)。

## 1 前置条件
- 安装 [Rust](https://rustup.rs/) 开发环境

## 2 使用 IDL 定义 Dubbo 服务

HelloWorld 服务定义如下，包含一个 Request - Response 模型的 Unary 服务。

```protobuf
syntax = "proto3";

option java_multiple_files = true;
option java_package = "io.grpc.examples.helloworld";
option java_outer_classname = "HelloWorldProto";

package helloworld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

## 3 添加 Dubbo 依赖到项目
```rust
[dependencies]
dubbo = <dubbo-version>

[build-dependencies]
dubbo-build = <dubbo-version>
```

## 4 配置 dubbo-build 编译 IDL
在项目根目录创建 (not /src)，创建 `build.rs` 文件并添加以下内容：

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("proto/helloworld.proto")?;
    Ok(())
}
```
这样配置之后，编译项目就可以生成 Dubbo Stub 相关代码，如下：

```rust
// 部分生成的代码
```

## 5 编写 Dubbo 业务代码

### 5.1 编写 Dubbo Server
```rust
// 用 dubbo-build 生成的基础类实现业务逻辑，注册服务并启动 server
```

### 5.2 编写 Dubbo Client
```rust
// 用 dubbo-build 生成的stub，创建连接channel，调用服务
```

## 6 运行并总结
