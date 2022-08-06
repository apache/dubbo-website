---
title: 使用 grpc_cli 调试 Dubbo-go 服务
weight: 10
type: docs
---

## 1. 简介

grpc_cli 工具是 gRPC 生态用于调试服务的工具，在 server 开启[反射服务](https://github.com/grpc/grpc/blob/master/doc/server-reflection.md)的前提下，可以获取到服务的 proto 文件、服务名、方法名、参数列表，以及发起 gRPC 调用。

Triple 协议兼容 gRPC 生态，并默认开启 gRPC 反射服务，因此可以直接使用 grpc_cli 调试 triple 服务。

## 2. 安装grpc_cli

参考[文档](https://github.com/grpc/grpc/blob/master/doc/command_line_tool.md)

## 3. 例子

参考 [3.0 快速开始](../../quickstart/quickstart_triple/)


