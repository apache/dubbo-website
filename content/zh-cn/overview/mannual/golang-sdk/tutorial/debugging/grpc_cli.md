---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/debugging/grpc_cli/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/debugging/grpc_cli/
description: 使用 grpc_cli 调试 Dubbo-go 服务
title: 使用 grpc_cli 调试 Dubbo-go 服务
type: docs
weight: 1
---






grpc_cli 工具是 gRPC 生态用于调试服务的工具，在 server 开启[反射服务](https://github.com/grpc/grpc/blob/master/doc/server-reflection.md)的前提下，可以获取到服务的 proto 文件、服务名、方法名、参数列表，以及发起 gRPC 调用。

Triple 协议兼容 gRPC 生态，并默认开启 gRPC 反射服务，因此可以直接使用 grpc_cli 调试 triple 服务。

## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用
- 安装grpc_cli，参考 [grpc_cli 文档](https://github.com/grpc/grpc/blob/master/doc/command_line_tool.md)

## 2. 使用 grpc_cli 工具进行 Triple 服务调试

### 2.1 启动 demo 应用 server

```bash
$ mkdir grpc_cli_test
$ cd grpc_cli_test
$ dubbogo-cli newDemo .
$ go mod tidy
$ cd go-server/cmd
$ go run .
```

### 2.2 使用 grpc_cli 进行服务调试

1. 查看 triple 服务的接口定义

```shell
$ grpc_cli ls localhost:20000 -l
filename: samples_api.proto
package: api;
service Greeter {
  rpc SayHello(api.HelloRequest) returns (api.User) {}
  rpc SayHelloStream(stream api.HelloRequest) returns (stream api.User) {}
}
```

2. 查看请求参数类型

   例如开发者期望测试上述端口的 SayHello 方法，尝试获取 HelloRequest 的具体定义，需要执行如下指令，可查看到对应参数的定义。

```shell
$ grpc_cli type localhost:20000 api.HelloRequest
message HelloRequest {
  string name = 1 [json_name = "name"];
}
```

3. 请求接口

   已经知道了请求参数的具体类型，可以发起调用来测试对应服务。查看返回值是否符合预期。

```shell
$ grpc_cli call localhost:20000 SayHello "name: 'laurence'"
connecting to localhost:20000
name: "Hello laurence"
id: "12345"
age: 21
Received trailing metadata from server:
accept-encoding : identity,gzip
grpc-accept-encoding : identity,deflate,gzip
Rpc succeeded with OK status
```

​	可看到获得了正确的返回值。在 server 侧可以观察到被正确请求的日志：

```shell
Dubbo3 GreeterProvider get user name = laurence
```