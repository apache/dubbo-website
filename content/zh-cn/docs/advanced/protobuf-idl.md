---
aliases:
    - /zh/docs/advanced/protobuf-idl/
description: 使用 IDL 定义服务
linkTitle: Protobuf
title: Protobuf
type: docs
weight: 17
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/migration-triple/#多语言用户)。
{{% /pageinfo %}}

当前 Dubbo 的服务定义和具体的编程语言绑定，没有提供一种语言中立的服务描述格式，比如 Java 就是定义 Interface 接口，到了其他语言又得重新以另外的格式定义一遍。
2.7.5 版本通过支持 Protobuf IDL 实现了语言中立的服务定义。

日后，不论我们使用什么语言版本来开发 Dubbo 服务，都可以直接使用 IDL 定义如下服务，具体请[参见示例](https://github.com/apache/dubbo-samples/tree/master/3-extensions/serialization/dubbo-samples-protobuf)

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
