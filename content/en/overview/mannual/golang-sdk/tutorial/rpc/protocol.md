---
description: Configuration of Communication Protocol
title: Communication Protocol
linkTitle: Communication Protocol
type: docs
weight: 3
---

The Dubbo-go framework provides two built-in protocols: triple and dubbo. In addition, the framework offers various ways to extend protocol access.
* triple, a high-performance communication protocol based on HTTP/1 and HTTP/2, 100% compatible with gRPC, supports Unary, Streaming, and other communication modes; supports publishing REST-style HTTP services.
 * dubbo, a high-performance private communication protocol based on TCP, with the disadvantage of poor universality, more suitable for use between Dubbo SDKs;
 * Any protocol extension, by extending the protocol, it can support any RPC protocol. The official ecosystem provides support for JsonRPC, thrift, etc.

In this document, we will introduce the usage of the triple protocol, how to achieve mutual calls with existing dubbo2 systems, and extend support for more protocols. For more principled introductions, please refer to [Protocol Specification](/en/overview/reference/protocols/triple-spec/) or [related documents in dubbo java](/en/overview/mannual/java-sdk/tasks/protocols/protocol/) .

## triple Protocol
The triple protocol supports two development modes: protobuf and non-protobuf. We **recommend using the protobuf mode for service development**.

Currently, most of our examples use this mode, you can refer to [Quick Start](/en/overview/mannual/golang-sdk/quickstart/rpc/) to learn complete development examples. Here are the basic steps:

1. First, define the service using protobuf

```protobuf
syntax = "proto3";
package greet;
option go_package = "github.com/apache/dubbo-go-samples/helloworld/proto;greet";

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string greeting = 1;
}

service GreetService {
  rpc Greet(GreetRequest) returns (GreetResponse) {}
}
```

2. [Install the protoc plugin](/en/overview/mannual/golang-sdk/quickstart/rpc/), compile and generate the code:
```shell
protoc --go_out=. --go_opt=paths=source_relative \
    --go-triple_out=. --go-triple_opt=paths=source_relative \
    proto/greet.proto
```

3. Publish service on the server side
```go
srv, err := server.NewServer(
	server.WithServerProtocol(
		protocol.WithPort(20000),
		protocol.WithTriple(),
	),
)

greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{})
```

4. Client calls the service
```go
cli, err := client.NewClient(
	client.WithClientURL("127.0.0.1:20000"),
)

svc, err := greet.NewGreetService(cli)
resp, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"})
```

## dubbo-java Intercommunication System

If both java and go use the triple+protobuf mode, they can clearly call each other directly.

However, the problem is that many java users use the triple non-protobuf mode, and some older version users use the dubbo tcp protocol. For this business, we can implement protocol mutual calls using the following coding modes of the dubbo-go framework:

1. Define services

Directly use struct to define the service:

```go
type GreetProvider struct {
}

func (*GreetProvider) SayHello(req string, req1 string, req2 string) (string, error) {
	return req + req1 + req2, nil
}
```

2. Publish service on the server

Specify the protocol to be published, which can be dubbo, triple or other protocols. Please note that `WithInterface("GreetProvider")` must be consistent with the service name on the dubbo-java side (e.g., keep the full path name in java):

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName("dubbo_server"),
	dubbo.WithProtocol(
		protocol.WithTriple(),
		protocol.WithPort(20001)),
)

srvDubbo, err := ins.NewServer()
if err != nil {
	panic(err)
}
if err = srvDubbo.Register(&GreetProvider{}, nil, server.WithInterface("GreetProvider")); err != nil {
	panic(err)
}
if err = srvDubbo.Serve(); err != nil {
	logger.Error(err)
}
```

3. Client calls the service

Specify the protocol to be called, which can be dubbo, triple, or other protocols. Please note that `WithInterface("GreetProvider")` must be consistent with the service name on the dubbo-java side (e.g., keep the full path name in java):

```go
cliDubbo, _ := client.NewClient(
	client.WithClientProtocolTriple(),
	client.WithClientSerialization(constant.Hessian2Serialization),
)

connDubbo, _ := cliDubbo.Dial("GreetProvider")
ipanic(err)
}
var respDubbo string
if err = connDubbo.CallUnary(context.Background(), []interface{}{"hello", "new", "dubbo"}, &respDubbo, "SayHello"); err != nil {
	logger.Errorf("GreetProvider.Greet err: %s", err)
	return
}
```

## Protocol Extension

The Dubbo framework supports protocol extensions. Currently, the officially supported protocols in the ecosystem include:
* triple
* dubbo
* jsonrpc

In some scenarios, you can publish services of multiple protocols simultaneously within one application or call services with different protocols simultaneously. Here is a [usage example for multi-protocol publishing](https://github.com/apache/dubbo-go-samples/tree/main/multirpc) for reference.

