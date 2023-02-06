---
type: docs
title: 完成一次 RPC 调用
weight: 2
description: 完成一次 RPC 调用
---


## 1. 生成 Demo 项目

使用安装好的 dubbogo-cli 工具，创建demo工程。

```bash
$ mkdir quickstart
$ cd quickstart 
$ dubbogo-cli newDemo .
$ tree .
.
├── api
│   ├── samples_api.pb.go
│   ├── samples_api.proto
│   └── samples_api_triple.pb.go
├── go-client
│   ├── cmd
│   │   └── client.go
│   └── conf
│       └── dubbogo.yaml
├── go-server
│   ├── cmd
│   │   └── server.go
│   └── conf
│       └── dubbogo.yaml
└── go.mod
```

可看到生成的项目中包含一个 client 项目和一个 server 项目，以及相关的配置文件。

### 1.1 查看接口描述文件 helloworld.proto

```protobuf
syntax = "proto3";
package api;

option go_package = "./;api";

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (User) {}
  // Sends a greeting via stream
  rpc SayHelloStream (stream HelloRequest) returns (stream User) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message User {
  string name = 1;
  string id = 2;
  int32 age = 3;
}
```

demo项目中，默认生成了一个接口描述文件，接口服务名为 api.Greeter, 包含两个 RPC 方法，入参为 HelloRequest，返回值为 User，两个方法分别为普通 RPC 方法和 Streaming 类型 RPC 方法。

### 1.2 (*可选) 使用安装好的编译工具编译 pb 接口

```bash
$ cd api
$ protoc --go_out=. --go-triple_out=. ./samples_api.proto
```

参数意义：`--go_out=.` 使用上述安装的 `protoc-gen-go` 插件，生成文件到当前目录，`--go-triple_out=.`使用上述安装的 `protoc-gen-go-triple` 插件，生成文件到当前目录。

执行该指令后，会生成两个文件，分别是helloworld.pb (包含 proto 结构) 和 helloworld_triple.pb.go (包含 triple 协议接口)。

在 demo 工程中，预先生成好了这两个文件，修改 .proto 文件后重新执行命令生成，即可覆盖。

## 2. 开启一次RPC调用

项目根目录执行

```
$ go mod tidy
```

拉取到最新的框架依赖：

```go
module helloworld

go 1.17

require (
	dubbo.apache.org/dubbo-go/v3 v3.0.1
	github.com/dubbogo/grpc-go v1.42.9
	github.com/dubbogo/triple v1.1.8
	google.golang.org/protobuf v1.27.1
)

require (
	...
)

```

先后启动服务端和客户端: 开启两个终端，在 go-server/cmd 和 go-client/cmd 文件夹下分别执行 `go run .` , 可在客户端看到输出：

```shell
client response result: name:"Hello laurence" id:"12345" age:21
```

获得调用结果成功

## 3. 更多

细心的读者可以发现，以上例子编写的的服务端可以接受来自客户端的普通RPC、流式RPC调用请求。目前只编写了普通调用的Client，读者可以根据 samples 库中的例子来尝试编写流式客户端和服务端。
