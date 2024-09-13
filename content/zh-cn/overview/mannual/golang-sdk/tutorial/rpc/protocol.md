---
description: 配置通信协议
title: 通信协议
linkTitle: 通信协议
type: docs
weight: 3
---

Dubbo-go 框架内置提供了两款协议：triple、dubbo，除此之外，框架还提供了多种协议扩展接入方式。
* triple，基于 HTTP/1、HTTP/2 的高性能通信协议，100% 兼容 gRPC，支持 Unary、Streming 等通信模式；支持发布 REST 风格的 HTTP 服务。
 * dubbo，基于 TCP 的高性能私有通信协议，缺点是通用性较差，更适合在 Dubbo SDK 间使用；
 * 任意协议扩展，通过扩展 protocol 可以之前任意 RPC 协议，官方生态库提供 JsonRPC、thrift 等支持。

本篇文档中，我们将介绍关于 triple 协议的使用方式、如何实现与已有 dubbo2 系统的互相调用、扩展更多协议支持等。更多原理性介绍请参考 [协议规范](/zh-cn/overview/reference/protocols/triple-spec/) 或者 [dubbo java 中相关描述文档](/zh-cn/overview/mannual/java-sdk/tasks/protocols/protocol/)。

## triple 协议
triple 协议支持使用 protobuf 和 non-protobuf 两种开发模式，我们 **推荐使用 protobuf 模式开发服务**。

目前我们大部分示例都是使用这个模式开发，可查看 [快速开始](/zh-cn/overview/mannual/golang-sdk/quickstart/rpc/) 学习完整开发示例，以下是基本步骤：

1. 先使用 protobuf 定义服务

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

2. [安装 protoc 插件](/zh-cn/overview/mannual/golang-sdk/quickstart/rpc/#前置条件)，编译生成代码：
```shell
protoc --go_out=. --go_opt=paths=source_relative \
    --go-triple_out=. --go-triple_opt=paths=source_relative \
    proto/greet.proto
```

3. server 端发布服务
```go
srv, err := server.NewServer(
	server.WithServerProtocol(
		protocol.WithPort(20000),
		protocol.WithTriple(),
	),
)

greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{})
```

4. client 端调用服务
```go
cli, err := client.NewClient(
	client.WithClientURL("127.0.0.1:20000"),
)

svc, err := greet.NewGreetService(cli)
resp, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"})
```

## dubbo-java 体系互调

如果 java 和 go 都使用 triple+protobuf  模式，很明显他们是可以直接互调通信的。

但问题是很多 java 用户是使用的 triple non-protobuf 模式，还有一些老版本用户是使用的 dubbo tcp 协议。对于这部分业务，我们要可以使用 dubbo-go 框架的以下编码模式实现协议互调：

1. 定义服务

直接使用 struct 定义服务：

```go
type GreetProvider struct {
}

func (*GreetProvider) SayHello(req string, req1 string, req2 string) (string, error) {
	return req + req1 + req2, nil
}
```

2. server 发布服务

指定要发布的协议，可以是 dubbo、triple 或其他协议，请注意 `WithInterface("GreetProvider")` 要保持和 dubbo-java 侧的服务名一致（如保持 java 全路径名）：

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

3. client 调用服务

指定要调用的协议，可以是 dubbo、triple 或其他协议，请注意 `WithInterface("GreetProvider")` 要保持和 dubbo-java 侧的服务名一致（如保持 java 全路径名）：

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

## 协议扩展

Dubbo 框架支持协议扩展，目前官方生态支持的协议包括：
* triple
* dubbo
* jsonrpc


在一些场景下，你可以在一个应用内同时发布多个协议的服务，或者同时以不同的协议调用服务，这里有一个 [多协议发布的使用示例](https://github.com/apache/dubbo-go-samples/tree/main/multirpc) 供参考。


