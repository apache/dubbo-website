---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
description: Using ZooKeeper as a registry
title: Using ZooKeeper as a registry
type: docs
weight: 11
---


This guide explains how to use ZooKeeper as a registry in Dubbo-Go. The complete example is available
in the <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/zookeeper" target="_blank">dubbo-go-samples/registry/zookeeper</a>
directory.

## Start ZooKeeper

### Start with Docker

Run a local ZooKeeper instance with Docker:

```shell
docker run --name dubbo-go-zookeeper --rm -d -p 2181:2181 zookeeper:3.9.5
```

Confirm that the container is running:

```shell
docker ps --filter name=dubbo-go-zookeeper
```

### Start from a binary distribution

Download a binary distribution from the
[ZooKeeper releases page](https://zookeeper.apache.org/releases.html#download). Extract the archive,
copy the sample configuration, and start the service:

```shell
tar -xzf apache-zookeeper-3.9.5-bin.tar.gz
cd apache-zookeeper-3.9.5-bin
cp conf/zoo_sample.cfg conf/zoo.cfg
bin/zkServer.sh start
```

Check the server status:

```shell
bin/zkServer.sh status
```

`Mode: standalone` indicates that the standalone ZooKeeper server is running. Both startup methods
use `127.0.0.1:2181` as the registry address.

ZooKeeper also starts its administration server on port `8080` by default. If that port is already
in use, set another port in `conf/zoo.cfg` and restart ZooKeeper:

```properties
admin.serverPort=18080
```

## Configure the service provider

The provider selects ZooKeeper with `registry.WithZookeeper()` and sets the address with
`registry.WithAddress()`:

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_zookeeper_server"),
	dubbo.WithRegistry(
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
	dubbo.WithProtocol(
		protocol.WithTriple(),
		protocol.WithPort(20000),
	),
)
```

The options have the following purposes:

- `dubbo.WithName()` sets the application name. The example uses
  `dubbo_registry_zookeeper_server`, which becomes the application node name in ZooKeeper after
  registration.
- `dubbo.WithRegistry()` adds the registry configuration.
  - `registry.WithZookeeper()` selects ZooKeeper as the registry.
  - `registry.WithAddress()` sets the ZooKeeper address. Separate multiple addresses with commas.
- `dubbo.WithProtocol()` adds the provider protocol configuration.
  - `protocol.WithTriple()` exposes the service over the Triple protocol.
  - `protocol.WithPort()` sets the protocol listening port to `20000`.

After registration succeeds, the provider address is available under
`/services/dubbo_registry_zookeeper_server` in ZooKeeper.

## Configure the service consumer

The consumer uses the same registry address. After the client is created, Dubbo-Go subscribes to
ZooKeeper and discovers the service provider:

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_zookeeper_client"),
	dubbo.WithRegistry(
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
)
```

The consumer also configures ZooKeeper through `dubbo.WithRegistry()`. It does not need a server
protocol or listening port because it obtains the provider address from the registry.

## Run the example

Clone the sample repository and enter the ZooKeeper example directory:

```shell
git clone https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/registry/zookeeper
```

### Start the service provider

Run the following command in the first terminal:

```shell
go run ./go-server/cmd/server.go
```

The provider listens on port `20000`. Open another terminal and send an HTTP request to verify the
service:

```shell
curl \
  --header "Content-Type: application/json" \
  --data '{"name":"Dubbo"}' \
  http://localhost:20000/greet.GreetService/Greet
```

Expected response:

```json
{"greeting":"Dubbo"}
```

### Inspect the registration data

If you started ZooKeeper with the Docker command above, open the CLI inside the container:

```shell
docker exec -it dubbo-go-zookeeper zkCli.sh
```

For a local ZooKeeper installation, enter the distribution's `bin` directory, such as
`$HOST_PATH/apache-zookeeper-3.9.5-bin/bin`, and start the CLI:

```shell
./zkCli.sh
```

After the connection succeeds, query the service node:

```text
ls /services/dubbo_registry_zookeeper_server
```

Expected output:

```text
[<provider-ip>:20000]
```

`<provider-ip>` is the IP address registered by the provider and depends on the local network
environment. An address using port `20000` confirms that the provider registered successfully.

### Start the service consumer

Keep the provider running and execute the following command in the second terminal:

```shell
go run ./go-client/cmd/client.go
```

The terminal prints service discovery and invocation logs, including the following response:

```text
Greet response: greeting:"hello world"
```

This response confirms that the consumer discovered the provider through ZooKeeper and invoked the
service.

If you started ZooKeeper with Docker, stop the container after finishing the example:

```shell
docker stop dubbo-go-zookeeper
```

If you started ZooKeeper from a local distribution, return to its directory and run:

```shell
bin/zkServer.sh stop
```
