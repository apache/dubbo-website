---
aliases:
   - /zh/docs3-v2/golang-sdk/quickstart/
   - /zh-cn/docs3-v2/golang-sdk/quickstart/
description: Dubbo-go 快速开始
linkTitle: 开发RPC服务
title: 开发 RPC Server & RPC Client
type: docs
weight: 1
---

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Go SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

本示例演示了基于 Triple 协议的 RPC 通信模式，示例使用 Protocol Buffer 定义 RPC 服务，并演示了代码生成、服务发布和服务访问等过程。

## 前置条件

因为使用 Protocol Buffer 的原因，我们首先需要安装相关的代码生成工具，这包括 `protoc`、`protoc-gen-go`、`protoc-gen-go-triple`。

1. 安装 `protoc`

    查看 <a href="/zh-cn/overview/reference/protoc-installation/" target="_blank">Protocol Buffer Compiler 安装指南</a>

2. 安装 `protoc` 插件

    接下来，我们安装插件 `protoc-gen-go`、`protoc-gen-go-triple`。

    ```shell
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    go install dubbo.apache.org/dubbo-go/v3/cmd/protoc-gen-go-triple@v3.0.1
    ```

    确保 `protoc-gen-go`、`protoc-gen-go-triple` 在你的 `PATH` 中。这可以通过 `which protoc-gen-go` 验证，如果该命令不能正常工作的话，请执行以下命令：

    ```shell
    [ -n "$(go env GOBIN)" ] && export PATH="$(go env GOBIN):${PATH}"
    [ -n "$(go env GOPATH)" ] && export PATH="$(go env GOPATH)/bin:${PATH}"
    ```

## 快速运行示例
### 下载示例源码
我们在 <a href="https://github.com/apache/dubbo-go-samples/" target="_blank">apache/dubbo-go-samples</a> 仓库维护了一系列 dubbo-go 使用示例，用来帮助用户快速学习 dubbo-go 使用方式。

你可以 <a href="https://github.com/apache/dubbo-go-samples/archive/refs/heads/master.zip" target="_blank">下载示例zip包并解压</a>，或者克隆仓库：

```shell
$ git clone --depth 1 https://github.com/apache/dubbo-go-samples
```

切换到快速开始示例目录：

```shell
$ cd dubbo-go-samples/helloworld
```

### 运行 server
在 `go-server/cmd` 目录：

运行以下命令，启动 server：

```shell
$ go run server.go
```

使用 `cURL` 验证 server 已经正常启动：

```shell
$ curl \
      --header "Content-Type: application/json" \
      --data '{"name": "Dubbo"}' \
      http://localhost:20000/greet.GreetService/Greet

Greeting: Hello world
```

### 运行 client

打开一个新的 terminal，运行以下命令，在 `go-client/cmd` 目录运行以下命令，启动 client

```shell
$ go run client.go

Greeting: Hello world
```

以上就是一个完整的 dubbo-go RPC 通信服务开发过程。

## 源码讲解
接下来，我们将对 `dubbo-go-samples/helloworld` 示例进行源码层面的讲解。

### 定义服务
示例使用 Protocol Buffer (IDL) 来定义 Dubbo 服务。

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

这个文件声明了一个叫做 `GreetService` 的服务，为这个服务定义了 Greet 方法以及它的请求参数 GreetRequest 和返回值 GreetResponse。

### 生成代码

在运行 server 或者 client 之前，我们需要使用 `protoc-gen-go`、`protoc-gen-go-triple` 生成相关的代码

```bash
protoc --go_out=. --go_opt=paths=source_relative \
    --go-triple_out=. --go-triple_opt=paths=source_relative \
    ./greet.proto
```

运行以上命令后，在目标目录中看到以下生成的文件：

```
 proto
    ├── greet.pb.go
    ├── greet.proto
    └── greet.triple.go
```

在 proto/greet/v1 包下有两部分内容：

- `greet.pb.go` 是由谷歌标准的 `protoc-gen-go`生成，它包含 `GreetRequest`、`GreetResponse` 结构体和响应的编解码规则。
- `greet.triple.go` 是由 Dubbo 自定义的插件`protoc-gen-go-triple`成，其中关键的信息包括生成的接口 `GreetService`、构造器等。

### 实现服务

接下来我们就需要添加业务逻辑了，实现 `greet.GreetService` 接口即可。

```go
type GreetTripleServer struct {
}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	resp := &greet.GreetResponse{Greeting: req.Name}
	return resp, nil
}
```

### 启动 Server

创建一个新的 Server，把我们上一步中实现的 `GreeterServer`注册给它，接下来就可以直接初始化和启动 Server 了，它将在指定的端口接收请求。

```go
func main() {
	srv, err := server.NewServer(
		server.WithServerProtocol(
			protocol.WithPort(20000),
			protocol.WithTriple(),
		),
	)
	if err != nil {
		panic(err)
	}

	if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
		panic(err)
	}

	if err := srv.Serve(); err != nil {
		logger.Error(err)
	}
}
```

### 访问服务

最简单方式是使用 HTTP/1.1 POST 请求访问服务，参数则作以标准 JSON 格式作为 HTTP 负载传递。如下是使用 cURL 命令的访问示例：
```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:20000/greet.GreetService/Greet
```

也可以使用 Dubbo client 请求服务，我们首先需要从生成代码即 `greet` 包中获取服务代理，为它指定 server 地址并初始化，之后就可以发起 RPC 调用了。

```go
func main() {
	cli, err := client.NewClient(
		client.WithClientURL("127.0.0.1:20000"),
	)
	if err != nil {
		panic(err)
	}

	svc, err := greet.NewGreetService(cli)
	if err != nil {
		panic(err)
	}

	resp, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"})
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("Greet response: %s", resp.Greeting)
}
```

以上即是 dubbo-go rpc 的基本工作原理！

## 更多内容
{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../tutorial/rpc" >}}'>RPC 框架更多特性</a>
                </h4>
                <p>学习 Streaming 通信模型、配置超时时间、传递headers等更多框架配置。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../tutorial" >}}'>服务发现等治理能力</a>
                </h4>
                <p>学习如何使用 dubbo-go 开发微服务，引入服务发现、可观测性、流量管控等服务治理能力。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>
{{< /blocks/section >}}




