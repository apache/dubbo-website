---
type: docs
title: "Dubbo3 简介"
linkTitle: "简介"
weight: 1
description: "这篇文档是关于 Dubbo 的简单介绍，涵盖 Dubbo 的核心概念、基本使用方式以及 Dubbo3 核心功能，无论你是 Dubbo 的老用户还是新用户，都可以通过这篇
文档快速了解 Dubbo 及新版本带来的变化。"
---

Apache Dubbo 是一个款微服务开发框架，它提供了 RPC通信 与 微服务治理 两大关键能力。这意味着，使用 Dubbo 开发的微服务，将具备相互之间的远程发现与通信能力，
同时利用 Dubbo 提供的丰富服务治理能力，实现诸如服务发现、负载均衡、流量调度等服务治理诉求。同时 Dubbo 是高度可扩展的，用户几乎可以在任意功能点去定制自己的实现，
以改变框架的默认行为满足自己的业务需求。

Dubbo 提供了丰富的多语言客户端实现，其中 Java、Golang 版本是目前稳定性、活跃度最好的版本，其他多语言客户端也在持续建设中。

This page introduces you to gRPC and protocol buffers. gRPC can use protocol buffers as both its Interface Definition Language (IDL) and as its underlying message interchange format. If you’re new to gRPC and/or protocol buffers, read this! If you just want to dive in and see gRPC in action first, select a language and try its Quick start.

## 简介
In gRPC, a client application can directly call a method on a server application on a different machine as if it were a local object, making it easier for you to create distributed applications and services. As in many RPC systems, gRPC is based around the idea of defining a service, specifying the methods that can be called remotely with their parameters and return types. On the server side, the server implements this interface and runs a gRPC server to handle client calls. On the client side, the client has a stub (referred to as just a client in some languages) that provides the same methods as the server.

## 核心概念
Dubbo 提供的核心能力包括:
* 服务定义
* 服务远程通信
* 服务发现
* 负载均衡
* 流量管理
* 动态配置

以下是对一些关键概念的简单介绍。

服务定义

服务定义

服务定义
## Dubbo3 vs Dubbo2


