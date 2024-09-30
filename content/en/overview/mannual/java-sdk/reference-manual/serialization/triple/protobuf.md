---
aliases:
    - /en/overview/mannual/java-sdk/reference-manual/protocol/triple/idl/
description: "This article introduces protobuf serialization, and how to use protobuf and json serialization in the context of the triple protocol."
linkTitle: Protobuf
title: How to Use Protobuf and JSON Serialization in the Context of the Triple Protocol
type: docs
weight: 1
---

## 1 Introduction

<a href="" target="_blank">Protobuf (Protocol Buffers)</a> is a lightweight and efficient data interchange format developed by Google, used for the serialization, deserialization, and transmission of structured data. Compared to text formats like XML and JSON, Protobuf has smaller data sizes, faster parsing speeds, and better scalability.

## 2 Usage
**When using [Protobuf (IDL) to develop triple communication services](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/), the Dubbo server will automatically enable support for protobuf and protobuf-json serialization modes.**

### 2.1 Add Dependencies
To use the triple + protobuf mode, the following dependencies must be added:

```xml
<dependencies>
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java</artifactId>
		<version>3.19.6</version>
	</dependency>
	<!-- Provides support for protobuf-json format requests -->
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java-util</artifactId>
		<version>3.19.6</version>
	</dependency>
</dependencies>
```

### 2.2 Configuring Enablement
As long as the communication is based on [Protobuf (IDL)](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/), protobuf serialization will be used once the protobuf file is defined and the triple protocol is enabled.

When accessing the triple service with cURL, the protobuf-json serialization mode will be enabled.

```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name":"Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.samples.tri.unary.Greeter/greet/
```

Example of protobuf service definition:

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

Protocol configuration:

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   name: tri
```
or
```properties
# dubbo.properties
dubbo.protocol.name=tri
```

or
```xml
<dubbo:protocol name="tri" />
```

