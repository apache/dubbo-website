---
description: 配置通信协议
title: 通信协议
linkTitle: 通信协议
type: docs
weight: 3
---

Dubbo-go 框架内置提供了两款协议：triple、dubbo，除此之外，框架还提供了多种协议扩展接入方式。
* triple，基于 HTTP/1、HTTP/2 的高性能通信协议，100% 兼容 gRPC，支持 Unary、Streming 等通信模式；支持发布 REST 风格的 HTTP 服务。
 * dubbo，基于 TCP 的高性能私有通信协议，缺点是通用性较差，更适合在 Dubbo SDK 间使用；
 * 任意协议扩展，通过扩展 protocol 可以之前任意 RPC 协议，官方生态库提供 JsonRPC、thrift 等支持。

本篇文档中，我们将介绍关于 triple 协议的使用方式、如何实现与已有 dubbo2 系统的互相调用、扩展更多协议支持等。更多原理性介绍请参考 [协议规范]() 或者 [dubbo java 中相关描述文档]()。

## triple 协议
triple 协议支持使用 protobuf 和 non-protobuf 两种开发模式，我们推荐使用 protobuf 模式开发服务。

### protobuf 开发模式
目前我们大部分示例都是使用这个模式开发，可查看 [快速开始]() 学习完整开发示例，以下是基本步骤：

1. 先使用 protobuf 定义服务

```protobuf

```

2. 安装 protoc 插件，编译生成代码：
```go

```

3. server 端发布服务
```go

```

4. client 端调用服务
```go

```

### 非 protobuf 开发模式
非 protobuf 即 non-protobuf 模式下，我们不需要先定义 protobuf 服务，直接使用 golang 定义接口即可：

1. 定义服务

```go
```

2. server 发布服务

```go
```

3. client 调用服务

```go
```

## 协议扩展
除了 triple 协议之外，dubbo-go 框架支持多种协议模式。

### dubbo协议

### 与老版本dubbo-java互调

### 多协议发布
### 其他扩展协议

