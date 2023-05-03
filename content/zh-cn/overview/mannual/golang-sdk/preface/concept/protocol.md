---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/concept/protocol/
    - /zh-cn/docs3-v2/golang-sdk/preface/concept/protocol/
description: 网络协议
title: 网络协议
type: docs
---






## 1. RPC 服务框架与网络协议

网络协议在 RPC 场景十分重要，在微服务场景下，服务进程之间的通信依赖可以连通的网络，以及client与server 端保持一致的网络协议。网络协议是一个抽象的概念，站在 Dubbo-go 应用开发的角度，不妨把我们关注的协议分为三个维度来讨论。

### 1.1 打解包协议

Dubbo-go 服务框架内置的打解包协议都是基于 TCP/IP 协议栈的，在此基础之上，封装/引入了多种协议，例如 Triple(dubbo3)、Dubbo、gRPC。

这一类协议重点关注 TCP 报文的封装和拆解过程，保证点对点的可靠通信。

在 dubbo-go 生态中，支持多种网络往往指的这一类协议。



### 1.2 序列化协议

序列化协议负责将内存中的对象以特定格式序列化为二进制流。一些主流的序列化库有：具有较好可读性、应用广泛的 json 序列化方式；较高压缩效率，性能较好的 protobuf 序列化方式；适配与 Java 语言的 hessian2 序列化方式等。Dubbo-go 内置了这三种序列化方式

序列化协议是需要开发者在业务开发过程中关注的，序列化协议往往需要特定的对象标注：

一个由 protoc-gen-go 生成的 protobuf 序列对象的例子：

```protobuf
type HelloRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
}
```

一个可与 java 服务互通的 hessian2 序列化对象

```go
type HelloRequest struct {
	Name   string `hessian:"name"`
}

func (u *HelloRequest) JavaClassName() string {
	return "org.apache.dubbo.sample.User"
}
```

序列化协议与打解包协议的关系

- 一种打解包协议可以适配于多种序列化协议支持：例如，您可以使用 dubbogo 的 triple 协议来传递 hessian序列化参数与 Dubbo-java 服务框架互通；传递 pb 序列化参数与原生 gRPC 服务互通；通过实现接口来自定义您的希望的序列化方式例如 json，从而传递具有较强可读性的参数。

### 1.3 接口协议

接口协议，是由业务开发人员开发并且维护的协议，用于描述服务接口的信息。例如接口名、方法、参数类型。

以 Triple/gRPC 为例，开发人员可以使用插件，从 proto 文件中定义的接口生成存根(.pb.go 文件)，存根文件内包含接口所有信息，及接口协议。

在编写服务时，客户端和服务端同时引入相同的接口，即可保证客户端发起针对特定接口和方法的调用，能被服务端正确识别和响应。

一个由 proto 编写的接口描述文件：

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

接口协议与序列化协议的关系

- 接口协议是抽象的概念，一种接口协议可以使用多种接口描述语言来编写，并且可以转化成多种序列化协议对象。

## 2. Dubbo-go 支持的网络协议

Dubbo-go 支持的网络协议和序列化方式如下：

| 协议            | 协议名 (用于配置) |         序列化方式         | 默认序列化方式 |
| --------------- | ----------------- | :------------------------: | -------------- |
| Triple 【推荐】 | tri               | pb/hessian2/msgpack/自定义 | pb             |
| Dubbo           | dubbo             |          hessian2          | hessian2       |
| gRPC            | grpc              |             pb             | pb             |
| jsonRPC         | jsonrpc           |            json            | json           |



相关阅读：[【Dubbo-go 服务代理模型】](https://developer.aliyun.com/article/878252)