---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
description: Using Nacos as the Registry
title: Using Nacos as the Registry
type: docs
weight: 10
---


This example shows dubbo-go's service discovery feature with Nacos as the registry.

## Usage

Specify the registry address in the following way:

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
Follow this instruction to [install and start Nacos server](/en/overview/reference/integrations/nacos/).

### Run server
```shell
$ go run ./go-server/cmd/server.go
```

Test if the RPC server works as expected:
```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:20000/greet.GreetService/Greet
```

Open `https://localhost:8848/nacos/` with a browser, check if the URL address is successfully registered into Nacos.

### Run client
```shell
$ go run ./go-client/cmd/client.go
hello world
```
