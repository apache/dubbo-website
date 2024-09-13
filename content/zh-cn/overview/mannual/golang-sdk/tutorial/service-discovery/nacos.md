---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
description: 使用 Nacos 作为注册中心
title: 使用 Nacos 作为注册中心
type: docs
weight: 10
---


This example shows dubbo-go's service discovery feature with Nacos as registry.

## 使用方式

通过以下方式指定注册中心地址：

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_nacos_server"),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithProtocol(
		protocol.WithTriple(),
		protocol.WithPort(20000),
	),
)

srv, err := ins.NewServer()
```

## How to run

### Start Nacos server
Follow this instruction to [install and start Nacos server](/zh-cn/overview/reference/integrations/nacos/).

### Run server
```shell
$ go run ./go-server/cmd/server.go
```

test rpc server work as expected:
```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:20000/greet.GreetService/Greet
```

Open `https://localhost:8848/nacos/` with browser, check url address successfully registered into Nacos.

### Run client
```shell
$ go run ./go-client/cmd/client.go
hello world
```