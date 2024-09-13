---
aliases:
    - /zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/idl/
description: "本文介绍 protobuf 序列化，如何在 triple 协议场景下使用 protobuf、json 序列化。"
linkTitle: Protobuf
title: 如何在 triple 协议场景下使用 protobuf、json 序列化
type: docs
weight: 1
---

## 1 介绍

<a href="" target="_blank">Protobuf（Protocol Buffers）</a> 是由 Google 开发的一种轻量级、高效的数据交换格式，它被用于结构化数据的序列化、反序列化和传输。 相比于XML 和JSON 等文本格式，Protobuf 具有更小的数据体积、更快的解析速度和更强的可扩展性。

## 2 使用方式
**在使用 [Protobuf(IDL) 开发 triple 通信服务](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/) 的时候，dubbo server 将自动启用 protobuf、protobuf-json 序列化模式支持。**

### 2.1 添加依赖
使用 triple + protobuf 模式，必须添加以下依赖：

```xml
<dependencies>
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java</artifactId>
		<version>3.19.6</version>
	</dependency>
	<!-- 提供 protobuf-json 格式请求支持 -->>
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java-util</artifactId>
		<version>3.19.6</version>
	</dependency>
</dependencies>
```

### 2.2 配置启用
只要是基于 [Protobuf(IDL) 开发模式进行 triple 协议通信](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/) ，就会使用 protobuf 序列化，只要定义 protobuf 文件并启用 triple 协议即可。

当使用 cURL 访问 triple 服务时，是会启用 protobuf-json 序列化模式

```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name":"Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.samples.tri.unary.Greeter/greet/
```

protobuf 服务定义示例：

```protobuf
syntax = "proto3";
option java_multiple_files = true;
package org.apache.dubbo.samples.tri.unary;

message GreeterRequest {
  string name = 1;
}
message GreeterReply {
  string message = 1;
}

service Greeter{
  rpc greet(GreeterRequest) returns (GreeterReply);
}
```


协议配置：

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   name: tri
```
或
```properties
# dubbo.properties
dubbo.protocol.name=tri
```

或
```xml
<dubbo:protocol name="tri" />
