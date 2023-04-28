---
aliases:
    - /zh/overview/quickstart/go/install/
description: 1 - 安装 Dubbo-go 开发环境
title: 安装 Dubbo-go 开发环境
type: docs
weight: 1
---


### 1. 安装Go语言环境

> go version >= go 1.15。建议使用最新版 go 1.19

[【Go 语言官网下载地址】](https://golang.google.cn/)

安装成功后将 `$GOPATH/bin` 加入环境变量

### 2. 安装序列化工具protoc

[【protoc 下载地址】](https://github.com/protocolbuffers/protobuf/releases)

### 3. 安装 dubbogo-cli 以及相关插件

执行以下指令安装dubbogo-cli 至 `$GOPATH/bin`

```bash
$ export GOPROXY="https://goproxy.cn"
$ go install github.com/dubbogo/dubbogo-cli@latest
$ dubbogo-cli 
hello
```

安装依赖的工具插件

```bash
$ dubbogo-cli install all            
```

确保上述安装的工具位于在系统环境变量内

```bash
$ protoc --version
libprotoc 3.14.0
$ protoc-gen-go --version
protoc-gen-go v1.26.0
$ protoc-gen-go-triple --version
protoc-gen-go-triple 1.0.8
```