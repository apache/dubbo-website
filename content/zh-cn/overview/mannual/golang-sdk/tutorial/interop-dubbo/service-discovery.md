---
description: "dubbo-java 和 dubbo-go 使用相同的服务发现模型，本文档演示如何基于应用级服务发现实现地址互通。"
title: 基于应用级服务发现实现地址互通
linkTitle: 服务发现实现地址互通
type: docs
weight: 6
---

前面两篇示例我们演示了 dubbo java 和 dubbo go 在协议层面的互通能力，涵盖 triple 和 dubbo 两种协议，
* [非 protoubf 模式协议互通（triple 和 dubbo 协议）](../call_java_protocol_dubbo_non_protobuf)
* [protobuf+triple 协议互通（triple 协议）](../call_java_protocol_triple_protobuf)

在本篇文档中，我们将演示 dubbo java 和 dubbo go 的服务发现互通能力，这样结合协议兼容性，我们就能实现完整的打通 dubbo java 和 dubbo go 微服务体系。


本文档使用 Nacos 注册中心作为演示，可在此查看本文档 [示例完整源码](https://github.com/apache/dubbo-go-samples/tree/main/java_interop/service_discovery)。


> before run the code , you should Follow this instruction to install and start Nacos server.

## 应用级别服务发现

```shell
cd service
```
**start java server**
```shell
cd java-server
sh run.sh
```

**start go client**
```shell
cd go-client
go run client.go

```

#### go server <-> java client
**start go server**
```shell
cd go-server
go run server.go
```
**start java client**
```shell
cd java-client
sh run.sh
```

## 接口级别服务发现（仅dubbo2用户关注）
### how to run
#### java server <-> go client
```shell
cd interface
```
**start java server**
```shell
cd java-server
sh run.sh
```

**start go client**
```shell
cd go-client
go run client.go

```

#### go server <-> java client
**start go server**
```shell
cd go-server
go run server.go
```
**start java client**
```shell
cd java-client
sh run.sh
```
