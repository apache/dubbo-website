---
aliases:
    - /zh/overview/what/ecosystem/serialization/protobuf/
    - /zh-cn/overview/what/ecosystem/serialization/protobuf/
description: "本文介绍 Protobuf 序列化"
linkTitle: Protobuf
title: Protobuf
type: docs
weight: 3
---




## 1 介绍

Protocol Buffers是一种开源跨平台的序列化数据结构的协议。其对于存储资料或在网络上进行通信的程序是很有用的。这个方法包含一个接口描述语言，描述一些数据结构，并提供程序工具根据这些描述产生代码，这些代码将用来生成或解析代表这些数据结构的字节流。

## 2 使用方式

### 2.1 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: protobuf
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=protobuf

# or
dubbo.consumer.serialization=protobuf

# or
dubbo.reference.com.demo.DemoService.serialization=protobuf
```
或
```xml
<dubbo:protocol serialization="protobuf" />

        <!-- or -->
<dubbo:consumer serialization="protobuf" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="protobuf" />
```
