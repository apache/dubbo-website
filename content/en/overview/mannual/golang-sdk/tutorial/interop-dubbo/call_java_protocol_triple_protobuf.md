---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
    - /en/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
description: “Realization of intercommunication between dubbo-java and dubbo-go using the triple protocol based on protobuf.”
title: Intercommunication of the triple protocol based on protobuf (suitable for scenarios developed with protobuf on both sides)
linkTitle: protobuf+triple protocol intercommunication
type: docs
weight: 4
---


Here we provide an example demonstrating how to implement intercommunication between dubbo-java and dubbo-go using the triple protocol. The complete source code can be viewed [here](https://github.com/apache/dubbo-go-samples/tree/main/java_interop/protobuf-triple).

The main content of the example is as follows:
- Go: RPC server and client implemented in Go
- Java: RPC server and client implemented in Java

## Shared protobuf service definition

The shared service definition is as follows. Please pay attention to the specific definitions of `package`, `go_package`, and `java_package`:

```protobuf
//protoc --go_out=. --go_opt=paths=source_relative --go-triple_out=. greet.proto
syntax = "proto3";
package org.apache.dubbo.sample;

option go_package = "github.com/apache/dubbo-go-samples/java_interop/protobuf-triple/go/proto;proto";
//package of go
option java_package = 'org.apache.dubbo.sample';
option java_multiple_files = true;
option java_outer_classname = "HelloWorldProto";
option objc_class_prefix = "WH";

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello(HelloRequest) returns (HelloReply);
  // Sends a greeting via stream
  //  rpc SayHelloStream (stream HelloRequest) returns (stream HelloReply) {}
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

## java-client calls go-server

1. First, start the go server:

```shell
go run go/go-server/cmd/server.go
```

After running the above command, the go server runs on port 50052. You can test if the service runs normally with the following command:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.sample.Greeter/sayHello
```

2. Start the java client 

Run the following command to start the java client and see the service call output from the go server:

```shell
./java/java-client/run.sh
```

## go-client calls java-server

1. Start the java server

Run the following command to start the java server:

> Note: Please close the previously started go server to avoid port conflict.

```shell
./java/java-server/run.sh
```

You can test if the service runs normally with the following command:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.sample.Greeter/sayHello
```

2. Run the go client

Run the following command to start the go client and see the service call output from the java server:

```shell
go run go/go-client/cmd/client.go
```

