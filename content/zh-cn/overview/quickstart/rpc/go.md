---
description: 使用轻量的 Go SDK 开发 RPC Server 和 Client
linkTitle: Go
title: 使用轻量的 Go SDK 开发 RPC Server 和 Client
type: docs
weight: 2
---

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Go SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

本示例演示了基于 Triple 协议的 RPC 通信模式，示例使用 Protocol Buffer 定义 RPC 服务，并演示了代码生成、服务发布和服务访问等过程。本示例完整代码请参见 <a href="https://github.com/apache/dubbo-go-samples/tree/master/helloworld" target="_blank">dubbo-go-samples</a>。

## 前置条件

因为使用 Protocol Buffer 的原因，我们首先需要安装相关的代码生成工具，这包括 `buf`、`protoc-gen-go`、`protoc-gen-triple-go`。

```shell
go install github.com/bufbuild/buf/cmd/buf@latest
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install github.com/bufbuild/connect-go/cmd/protoc-gen-triple-go@latest
```

## 定义服务

现在，使用 Protocol Buffer (IDL) 来定义一个 Dubbo 服务。

```protobuf
syntax = "proto3";

package greet.v1;

option go_package = "example/gen/greet/v1;greetv1";

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

这个文件声明了一个叫做 `GreetService` 的服务，为这个服务定义了 Greet 方法以及它的请求参数 GreetRequest 和返回值 GreetResponse。

## 生成代码

接下来，我们就使用 `protoc-gen-go`、`protoc-gen-triple-go`生成相关的代码

```bash
$ buf lint
$ buf generate
```

运行以上命令后，你应该可以在目标目录中看到以下生成的文件：

```
gen
└── greet
    └── v1
        ├── greet.pb.go
        └── greetv1triple
            └── greet.triple.go
```

在 gen/greet/v1 包下有两部分内容：

- `greet.pb.go` 是由谷歌标准的 `protoc-gen-go`生成，它包含 `GreetRequest`、`GreetResponse` 结构体和响应的编解码规则。
- `gen/greet/v1/greetv1triple` 包下的文件`reet.triple.go`是由 Dubbo 自定义的插件`protoc-gen-triple-go`成，其中关键的信息包括生成的接口 `GreeterClient`、构造器等。

## 实现服务

接下来我们就需要添加业务逻辑了，实现 `greetv1triple.GreeterClient` 接口即可。

```go
type GreeterServer struct {
	greet.UnimplementedGreeterServer
}

func (s *GreeterServer) SayHello(ctx context.Context, in *greet.HelloRequest) (*greet.User, error) {
	return &greet.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, nil
}
```

## 启动 Server

创建一个新的 Server，把我们上一步中实现的 `GreeterServer`注册给它，接下来就可以直接初始化和启动 Server 了，它将在指定的端口接收请求。

```go

func main() {
	s := config.NewServer()

	s.RegisterService(&GreeterServer{})//config.SetProviderService(s, &GreeterProvider{})
	s.Init(config.WithXxxOption())//config.Load()

	s.Serve()
	// s.Serve(net.Listen("tcp", ":50051"))
}
```

## 访问服务

最简单方式是使用 HTTP/1.1 POST 请求访问服务，参数则作以[标准 JSON 格式](aa)作为 HTTP 负载传递。如下是使用 cURL 命令的访问示例：
```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50051/org.apache.dubbo.demo.DemoService/sayHello
```

也可以使用标准的 Dubbo client 请求服务，我们首先需要从生成代码即`greetv1triple`包中获取服务代理，为它指定 server 地址并初始化，之后就可以发起 RPC 调用了。

```go
func main() {
	c := greetv1triple.NewGreeterClient()
    // Init 完成 config.Load(), config.SetConsumerService(grpcGreeterImpl)
	c.init(config.withAddressOption(), config.withTimeoutOption())
	c.SayHello(ctx, request)
}
```
恭喜您， 以上即是 Dubbo Go RPC 通信的基本使用方式！ 🎉

## 更多内容
- 请查看 [Dubbo Go 开发文档](/zh-cn/overview/mannual/go-sdk) 了解更多使用方式。



