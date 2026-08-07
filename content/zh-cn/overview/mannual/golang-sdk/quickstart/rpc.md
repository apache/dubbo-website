---
aliases:
   - /zh/docs3-v2/golang-sdk/quickstart/
   - /zh-cn/docs3-v2/golang-sdk/quickstart/
   - /zh-cn/overview/mannual/golang-sdk/quickstart/quickstart_triple/
description: Dubbo-go 快速开始
linkTitle: 开发RPC服务
title: 开发 RPC Server & RPC Client
type: docs
weight: 1
---

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Go SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

本示例演示了基于 Triple 协议的 RPC 通信模式，示例使用 Protocol Buffer 定义 RPC 服务，并演示了代码生成、服务发布和服务访问等过程。

示例源码：<a href="https://github.com/apache/dubbo-go-samples/tree/main/helloworld" target="_blank">dubbo-go-samples/helloworld</a>。

## 前置条件

因为使用 Protocol Buffer 的原因，我们首先需要安装相关的代码生成工具，这包括 `protoc`、`protoc-gen-go`、`protoc-gen-go-triple`。

1. 安装 `protoc`

    查看 <a href="/zh-cn/overview/reference/protoc-installation/" target="_blank">Protocol Buffer Compiler 安装指南</a>

2. 安装 `protoc` 插件

    接下来，我们安装插件 `protoc-gen-go`、`protoc-gen-go-triple`。

    ```shell
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

    git clone --depth 1 https://github.com/apache/dubbo-go.git
    (cd dubbo-go/tools/protoc-gen-go-triple && go install .)
    ```

    确保 `protoc-gen-go`、`protoc-gen-go-triple` 在你的 `PATH` 中。这可以通过 `which protoc-gen-go` 和 `which protoc-gen-go-triple` 验证。如果命令不能正常工作，请执行以下命令：

    ```shell
    [ -n "$(go env GOBIN)" ] && export PATH="$(go env GOBIN):${PATH}"
    [ -n "$(go env GOPATH)" ] && export PATH="$(go env GOPATH)/bin:${PATH}"
    ```

    `protoc-gen-go-triple` 现在维护在 dubbo-go 仓库的
    <a href="https://github.com/apache/dubbo-go/tree/main/tools/protoc-gen-go-triple" target="_blank">tools/protoc-gen-go-triple</a>
    目录下。请从该目录安装；修改 `.proto` 服务定义后，请同步重新生成 `*.triple.go` 文件。

## 快速运行示例

### 下载示例源码
我们在 <a href="https://github.com/apache/dubbo-go-samples/" target="_blank">apache/dubbo-go-samples</a> 仓库维护了一系列 dubbo-go 使用示例，用来帮助用户快速学习 dubbo-go 使用方式。

你可以 <a href="https://github.com/apache/dubbo-go-samples/archive/refs/heads/main.zip" target="_blank">下载示例 zip 包并解压</a>，或者克隆仓库：

```shell
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/helloworld
```

### 运行 server

以下命令均从 `helloworld` 根目录运行。启动 server：

```shell
go run ./go-server/cmd/main.go
```

使用 `cURL` 验证 server 已经正常启动：

```shell
curl \
  --header "Content-Type: application/json" \
  --data '{"name":"Dubbo"}' \
  http://localhost:20000/greet.GreetService/Greet
```

响应为：

```json
{"greeting":"Dubbo"}
```

### 运行 client

打开一个新的终端，重新进入 `helloworld` 根目录并启动 client：

```shell
cd dubbo-go-samples/helloworld
go run ./go-client/cmd/main.go
```

日志中包含以下响应（时间、日志级别和调用位置等前缀会因运行环境而异）：

```text
Greet response: hello world
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

`proto/greet.proto` 声明了名为 `GreetService` 的服务，并定义了 RPC 方法 `Greet`、请求 `GreetRequest` 和响应 `GreetResponse`。

### 生成代码

在运行 server 或 client 之前，需要在 `helloworld` 根目录使用 `protoc-gen-go` 和 `protoc-gen-go-triple` 生成相关代码：

```bash
protoc \
  --go_out=. \
  --go_opt=paths=source_relative \
  --go-triple_out=. \
  --go-triple_opt=paths=source_relative \
  ./proto/greet.proto
```

运行后，`proto` 目录结构如下：

```text
proto/
├── greet.proto
├── greet.pb.go
└── greet.triple.go
```

其中：

- `greet.pb.go` 由标准的 `protoc-gen-go` 生成，主要包含 `GreetRequest`、`GreetResponse` 等 Protobuf 消息及编解码代码。
- `greet.triple.go` 由 `protoc-gen-go-triple` 生成，主要包含 Triple 服务端注册、客户端代理和 RPC 调用相关代码，例如 `RegisterGreetServiceHandler` 和 `NewGreetService`。

修改 `proto/greet.proto` 后，需要重新运行上述命令，同时更新这两个生成文件。

### 实现服务

接下来添加业务逻辑。`GreetTripleServer` 实现生成代码中的 `greet.GreetServiceHandler` 接口：

```go
type GreetTripleServer struct{}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	resp := &greet.GreetResponse{Greeting: req.Name}
	return resp, nil
}
```

### 启动 Server

创建 Server，并通过 `RegisterGreetServiceHandler` 注册上一步实现的 `GreetTripleServer`。Server 在 `20000` 端口接收请求：

```go
package main

import (
	"context"

	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/protocol"
	"dubbo.apache.org/dubbo-go/v3/server"
	"github.com/dubbogo/gost/log/logger"

	greet "github.com/apache/dubbo-go-samples/helloworld/proto"
)

type GreetTripleServer struct{}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	resp := &greet.GreetResponse{Greeting: req.Name}
	return resp, nil
}

func main() {
	srv, err := server.NewServer(
		server.WithServerProtocol(
			protocol.WithPort(20000),
			protocol.WithTriple(),
		),
	)
	if err != nil {
		logger.Errorf("failed to create server: %v", err)
		return
	}

	if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
		logger.Errorf("failed to register greet service handler: %v", err)
		return
	}

	if err := srv.Serve(); err != nil {
		logger.Errorf("failed to serve: %v", err)
		return
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
package main

import (
	"context"
	"time"

	"dubbo.apache.org/dubbo-go/v3/client"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"github.com/dubbogo/gost/log/logger"

	greet "github.com/apache/dubbo-go-samples/helloworld/proto"
)

func main() {
	cli, err := client.NewClient(
		client.WithClientURL("127.0.0.1:20000"),
	)
	if err != nil {
		logger.Errorf("failed to create client: %v", err)
		return
	}

	svc, err := greet.NewGreetService(cli)
	if err != nil {
		logger.Errorf("failed to create greet service: %v", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	resp, err := svc.Greet(ctx, &greet.GreetRequest{Name: "hello world"})
	if err != nil {
		logger.Errorf("failed to greet: %v", err)
		return
	}
	logger.Infof("Greet response: %s", resp.Greeting)
}
```

以上即是 dubbo-go rpc 的基本工作原理！

完成基础 unary 调用后，同一套生成的 Triple client 和 server 还支持服务端流、客户端流、双向流、请求
metadata、响应 header/trailer、filter、健康检查、超时、重试和 OpenAPI 暴露等能力。可以继续阅读 RPC
框架部分的专题文档。

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
