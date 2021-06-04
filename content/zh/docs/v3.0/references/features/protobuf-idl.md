---
type: docs
title: "Protobuf"
linkTitle: "Protobuf"
weight: 17
description: "使用 IDL 定义服务"
---

当前 Dubbo 的服务定义和具体的编程语言绑定，没有提供一种语言中立的服务描述格式，比如 Java 就是定义 Interface 接口，到了其他语言又得重新以另外的格式定义一遍。
2.7.5 版本通过支持 Protobuf IDL 实现了语言中立的服务定义。

日后，不论我们使用什么语言版本来开发 Dubbo 服务，都可以直接使用 IDL 定义如下服务，具体请[参见示例](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-protobuf)

```idl
syntax = "proto3";

option java_multiple_files = true;
option java_package = "org.apache.dubbo.demo";
option java_outer_classname = "DemoServiceProto";
option objc_class_prefix = "DEMOSRV";

package demoservice;

// The demo service definition.
service DemoService {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
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