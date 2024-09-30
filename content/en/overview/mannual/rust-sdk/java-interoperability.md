---
aliases:
    - /en/docs3-v2/rust-sdk/java-interoperability/
    - /en/docs3-v2/rust-sdk/java-interoperability/
description: Call Dubbo services developed in Java using Rust.
linkTitle: Interoperability between Rust and Java
title: Interoperability between Rust and Java
type: docs
weight: 2
---






## 1 Prerequisites
- Install the [Rust](https://rustup.rs/) development environment
- Install the [protoc](https://grpc.io/docs/protoc-installation/) tool
- Install the Java development environment

## 2 Run the Example Java Version of Dubbo Provider

The source code for the Java version of the Dubbo provider can be found at <https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple>.

Clone the source code, compile, and run the provider:

```sh
$ # clone the source code
$ git clone https://github.com/apache/dubbo-samples.git
$ cd dubbo-samples/dubbo-samples-triple/

$ # build
$ mvn clean compile package -DskipTests

$ # run the provider
$ java -Dprovider.port=8888 -jar ./target/dubbo-samples-triple-1.0-SNAPSHOT.jar
# … omitted part of the logs
Dubbo triple stub server started, port=8888
```

[Interface definition on the Java side](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main/proto/greeter.proto)

## 3 Run the Rust Version of Dubbo Consumer

The source code for the Rust version of the Dubbo consumer can be found at <https://github.com/apache/dubbo-rust/tree/main/examples/greeter>.

Clone the source code, compile, and run the consumer:

```sh
$ # clone the source code
$ git clone https://github.com/apache/dubbo-rust.git
$ cd dubbo-rust/examples/greeter/

$ # build
$ cargo build

$ # run the consumer, call the provider
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

[Interface definition on the Rust side](https://github.com/apache/dubbo-rust/blob/main/examples/greeter/proto/greeter.proto)

