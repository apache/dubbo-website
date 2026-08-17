---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
description: Using Nacos as the Registry
title: Using Nacos as the Registry
type: docs
weight: 10
---


This example shows dubbo-go's service discovery feature with Nacos as the registry. You can view the
<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">complete example source code</a>
in dubbo-go-samples.

## How to Start

### Start the Nacos Server

Follow this instruction to [install and start the Nacos server](../../../../reference/integrations/nacos.md).

## Server Registration Configuration

### API Configuration

```go
ins, _ := dubbo.NewInstance(
		dubbo.WithName("dubbo_registry_nacos_server"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(nacosAddr),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20000),
		),
	)
```

The meaning of each configuration item is as follows:

- `dubbo.WithName()` sets the application name. After the service is registered, `dubbo_registry_nacos_server` generates the corresponding application node in Nacos. (This is the example name)
- `dubbo.WithRegistry()` adds the registry configuration.
    - `registry.WithNacos()` specifies Nacos as the registry type.
	- `registry.WithAddress()` sets the Nacos address.
- `dubbo.WithProtocol()` adds the protocol configuration for the service provider.
  - `protocol.WithTriple()` specifies the Triple protocol to expose the service.
  - `protocol.WithPort()` sets the protocol listening port. The example uses `20000`.

After the service is successfully registered, you can see the service address under the
`/services/dubbo_registry_nacos_server` node in Nacos.

### YAML Configuration

If you pass the configuration through a configuration file instead of the API, please refer to the following YAML configuration.
```yaml
dubbo:
  registries:
    demoNacos:
      protocol: nacos
      timeout: 10s
      address: 127.0.0.1:8848
  protocols:
    tripleProtocol:
      name: tri
      port: 20000
  provider:
    services:
      GreetTripleServer:
        interface: greet.GreetService
```

## Client Service Discovery Configuration

### API Configuration

```go
ins, _ := dubbo.NewInstance(
		dubbo.WithName("dubbo_registry_nacos_client"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress("127.0.0.1:8848"),
		),
	)
```
There is no need to use `dubbo.WithProtocol()` to configure the protocol here.

### YAML Configuration

```yaml
dubbo:
  registries:
    demoNacos:
      protocol: nacos
      timeout: 3s
      address: 127.0.0.1:8848
  consumer:
    references:
      GreetServiceImpl:
        protocol: tri
        interface: greet.GreetService
        registry: demoNacos
        retries: 3
        timeout: 3000

```

## How to Run

Before running the example, make sure Nacos is started. You can follow [install and start the Nacos server](../../../../reference/integrations/nacos.md) to start it, or choose to start it using a Docker image:

```shell
docker run -d --name dubbo-go-nacos -e MODE=standalone -p 8848:8848 -p 9848:9848 nacos/nacos-server:v2.3.2
```

The JVM memory size of Nacos can be configured as needed, for example by limiting its heap memory with `-e JVM_XMS=256m -e JVM_XMX=256m`.

```shell
docker ps --filter name=dubbo-go-nacos
```

You should see that the Nacos container is running.

Then download the example repository and enter the Nacos example directory:

```shell
git clone https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/registry/nacos
```

### Start the Server

Run in the first terminal:

```shell
go run ./go-server/cmd/server.go
```

The service provider listens on port `20000`. Open another terminal and confirm that the service is available with an HTTP request:

```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:20000/greet.GreetService/Greet
```

Expected response:

```json
{"greeting":"Dubbo"}
```

#### View the Registered Data

**Method 1: Through the Nacos console**

Open `http://localhost:8848/nacos/` in a browser, go to "Service Management → Service List", and check whether the `dubbo_registry_nacos_server` service exists. The table also shows the IP, port, ephemeral instances, weight, health status, metadata, and other data.

**Method 2: Through the Nacos OpenAPI**

```shell
curl -X GET 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=dubbo_registry_nacos_server&groupName=DEFAULT_GROUP'
```

In the expected output, the hosts list should not be empty, and healthy should be true.



### Run the Client

Keep the server running, open a second terminal, and run:

```shell
$ go run ./go-client/cmd/client.go
```

After execution, the terminal outputs multiple lines of service discovery and invocation logs, including the following response:

```text
Greet response: greeting:"hello world"
```

This shows that the client has found the service provider through Nacos and completed the invocation.
