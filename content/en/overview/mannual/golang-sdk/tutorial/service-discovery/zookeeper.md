---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
description: Using Zookeeper as a registry
title: Using Zookeeper as a registry
type: docs
weight: 11
---


This example shows dubbo-go's service discovery feature with Zookeeper as registry.

## Usage

Specify the registry address as follows:

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_nacos_server"),
	dubbo.WithRegistry(
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
	dubbo.WithProtocol(
		protocol.WithTriple(),
		protocol.WithPort(20000),
	),
)

srv, err := ins.NewServer()
```

## How to run

### Start Zookeeper server
This example relies on Zookeeper as the registry; follow the steps below to start a Zookeeper server first.

1. Start Zookeeper with Docker, run `docker run --rm -p 2181:2181 zookeeper` or `make -f $DUBBO_GO_SAMPLES_ROOT_PATH/build/Makefile docker-up`.
2. [Download and start Zookeeper](https://zookeeper.apache.org/releases.html#download) locally on your machine.

### Run server
```shell
$ go run ./go-server/cmd/server.go
```

Test RPC server works as expected:
```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:20000/greet.GreetService/Greet
```

Check URL address has been successfully registered into Zookeeper:
```shell
# Enter Zookeeper bin directory, for example '$HOST_PATH/apache-zookeeper-3.5.9-bin/bin'
$ ./zkCli.sh
[zk: localhost:2181(CONNECTED) 0] ls /services/dubbo_registry_zookeeper_server
[30.221.147.198:20000]
```

### Run client
```shell
$ go run ./go-client/cmd/client.go
hello world
```

