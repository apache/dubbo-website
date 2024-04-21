---
aliases:
    - /zh/docs3-v2/golang-sdk/quickstart/install/
    - /zh-cn/docs3-v2/golang-sdk/quickstart/install/
description: 安装 Dubbo-go 开发环境
title: 安装 Dubbo-go 开发环境
type: docs
weight: 1
---
### 1. 推荐 Go 版本

[Go](https://golang.google.cn/) >= `1.15`
> 建议使用最新 `1.19`

安装成功后将 `$GOPATH/bin` 加入环境变量

### 2. 安装序列化工具

[protoc](https://github.com/protocolbuffers/protobuf/releases)

### 3. 安装工具以及相关插件

执行以下指令安装 dubbogo-cli 至 `$GOPATH/bin`

添加 Go 模块代理
```bash
$ export GOPROXY="https://goproxy.cn"
```
安装 dubbogo-cli 工具
```bash
$ go install github.com/dubbogo/dubbogo-cli@latest
```
执行 dubbogo-cli 命令
```bash
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
```
```bash
$ protoc-gen-go --version
protoc-gen-go v1.26.0
```
```bash
$ protoc-gen-go-triple --version
protoc-gen-go-triple 1.0.8
```
