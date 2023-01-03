---
type: docs
title: Install Dubbo-go development environment
weight: 1
---
### 1. Install the Go language environment

It is recommended to use the latest version of go 1.17

go version >= go 1.15

[[Go language official website download address]](https://golang.google.cn/)

Add $GOPATH/bin to environment variable

### 2. Install the serialization tool protoc

[[protoc download address]](https://github.com/protocolbuffers/protobuf/releases)

### 3. Install dubbogo-cli and related plugins

Execute the following command to install dubbogo-cli to $GOPATH/bin

```bash
$ export GOPROXY="https://goproxy.cn"
$ go install github.com/dubbogo/dubbogo-cli@latest
$ dubbogo-cli
hello
```

Install dependent tool plugins

```bash
$ dubbogo-cli install all
```

Make sure the tools installed above are located in the system environment variables

```bash
$ protoc --version
libprotoc 3.14.0
$ protoc-gen-go --version
protoc-gen-go v1.26.0
$ protoc-gen-go-triple --version
protoc-gen-go-triple 1.0.8
```