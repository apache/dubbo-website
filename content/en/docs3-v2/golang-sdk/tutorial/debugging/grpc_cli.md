---
title: Use grpc_cli to debug Dubbo-go service
type: docs
weight: 1
---

The grpc_cli tool is a tool used by the gRPC ecosystem to debug services. It can be obtained under the premise that [reflection service] (https://github.com/grpc/grpc/blob/master/doc/server-reflection.md) is enabled on the server Go to the service's proto file, service name, method name, parameter list, and initiate a gRPC call.

The Triple protocol is compatible with the gRPC ecosystem, and the gRPC reflection service is enabled by default, so you can directly use grpc_cli to debug the triple service.

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application
- Install grpc_cli, refer to [grpc_cli documentation](https://github.com/grpc/grpc/blob/master/doc/command_line_tool.md)

## 2. Use grpc_cli tool to debug Triple service

### 2.1 Start demo application server

```bash
$ mkdir grpc_cli_test
$ cd grpc_cli_test
$ dubbogo-cli newDemo.
$ go mod tidy
$ cd go-server/cmd
$ go run .
```

### 2.2 Use grpc_cli for service debugging

1. View the interface definition of the triple service

```shell
$ grpc_cli ls localhost:20000 -l
filename: samples_api.proto
package: api;
service Greeter {
  rpc SayHello(api.HelloRequest) returns (api.User) {}
  rpc SayHelloStream(stream api.HelloRequest) returns (stream api.User) {}
}
```

2. Check the request parameter type

   For example, if a developer wants to test the SayHello method of the above port and try to obtain the specific definition of HelloRequest, he needs to execute the following command to view the definition of the corresponding parameters.

```shell
$ grpc_cli type localhost:20000 api.HelloRequest
message HelloRequest {
  string name = 1 [json_name = "name"];
}
```

3. Request interface

   Knowing the specific type of the request parameter, you can initiate a call to test the corresponding service. Check to see if the return value is as expected.

```shell
$ grpc_cli call localhost:20000 SayHello "name: 'laurence'"
connecting to localhost:20000
name: "Hello Laurence"
id: "12345"
age: 21
Received trailing metadata from server:
accept-encoding: identity, gzip
grpc-accept-encoding : identity,deflate,gzip
Rpc succeeded with OK status
```

It can be seen that the correct return value has been obtained. On the server side, you can observe the logs that are correctly requested:

```shell
Dubbo3 GreeterProvider get user name = laurence
```