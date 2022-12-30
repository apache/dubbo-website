---
type: docs
title: "Rust and Java interoperability"
linkTitle: "Rust and Java interoperability"
weight: 2
description: "Use Dubbo-rust call Duboo Java service"
---

## 1 Prerequisite
- Install [Rust development environment](https://rustup.rs/).
- Install [protoc](https://grpc.io/docs/protoc-installation/).
- Install Java development environment.

## 2 Run example of Java Dubbo provider

Java version of Dubbo provider example <https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple>.

Clone the source code, compile, and run provider:

```sh
$ # clone the source code
$ git clone https://github.com/apache/dubbo-samples.git
$ cd dubbo-samples/dubbo-samples-triple/

$ # compile and build
$ mvn clean compile package -DskipTests

$ # run provider
$ java -Dprovider.port=8888 -jar ./target/dubbo-samples-triple-1.0-SNAPSHOT.jar
# … some logs
Dubbo triple stub server started, port=8888
```

[The interface defination on Java side](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main/proto/greeter.proto)

## 3 Run Rust version of  Dubbo consumer

Rust version of Dubbo consumer <https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple>.

Clone the source code, compile and run consumer:

```sh
$ # clone the source code
$ git clone https://github.com/apache/dubbo-rust.git
$ cd dubbo-rust/examples/greeter/

$ # build
$ cargo build

$ # run consumer, call provider
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

[The interface defination on Rust side](https://github.com/apache/dubbo-rust/blob/main/examples/greeter/proto/greeter.proto)
