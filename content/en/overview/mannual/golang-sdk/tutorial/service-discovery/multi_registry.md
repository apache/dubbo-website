---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/multi_registry/
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/multi_registry/
description: Multiple Registration Centers
title: Multiple Registration Centers
type: docs
weight: 100
---

A Dubbo application can configure multiple registration centers at different interface dimensions. Multiple registration centers can be used for cluster isolation, migration, and various other scenarios. For a more detailed explanation, refer to the <a href="https://dubbo.apache.org/zh-cn/overview/mannual/java-sdk/reference-manual/registry/multiple-registry/" target="_blank">Dubbo Java Multiple Registration Center Documentation</a>.

## Usage Scenarios

### Migration Scenario

Migrate smoothly between different registration centers without service interruption. For example, when migrating from ZooKeeper to Nacos, dual registration keeps the business running during the transition.

### Canary Release Scenario

Deploy an independent canary registration center so that only specific traffic can access the testing version. The new version is registered to the canary center first, and after validation passes, it is released to all traffic, reducing the risk of going live.

### Cluster/Environment Isolation Scenario

Use completely independent registration centers to isolate different service environments so that they do not interfere with each other. Development, testing, and production each have their own independent center, so debugging services will not affect production traffic.

## API Configuration Method

### Server

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_multi_registry_server"),
	dubbo.WithRegistry(
		registry.WithID("nacos"),
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithRegistry(
		registry.WithID("zookeeper"),
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
)
```

Specify which registration center the services under a server should register to:

```go
// Register the services under the server to the zookeeper registration center
srv, _ := ins.NewServer(server.WithServerRegistryIDs([]string{"zookeeper"}))

// Register the services under the server to the nacos registration center
srv2, _ := ins.NewServer(server.WithServerRegistryIDs([]string{"nacos"}))
```

Specify which registration center a particular service should register to:

```go
srv, _ := ins.NewServer()

greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}, server.WithRegistryIDs([]string{"zookeeper"}))
```

### Client

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_multi_registry_client"),
	dubbo.WithRegistry(
		registry.WithID("nacos"),
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithRegistry(
		registry.WithID("zookeeper"),
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
)
```

Specify which registration center the client subscribes from:

```go
// Subscribe from the nacos registration center
cli, _ := ins.NewClient(client.WithClientRegistryIDs([]string{"nacos"}))

// Or subscribe from the zookeeper registration center
cli2, _ := ins.NewClient(client.WithClientRegistryIDs([]string{"zookeeper"}))
```

## YAML Configuration Method

### Server

Modify the server configuration at go-server/conf/dubbogo.yaml to register the service in both registration centers.

```yaml
dubbo:
  application:
    name: dubbo_multi_registry_server
  registries:
    zookeeper: # Specify the zookeeper registration center
      protocol: zookeeper
      address: 127.0.0.1:2181
    nacos: # Specify the nacos registration center
      protocol: nacos
      address: 127.0.0.1:8848
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        registry-ids: # Register to both registration centers
          - zookeeper
          - nacos
        interface: "" # Interface name
```

### Client

```yaml
dubbo:
  application:
    name: dubbo_multi_registry_client
  registries:
    nacos:
      protocol: nacos
      address: 127.0.0.1:8848
    zookeeper:
      protocol: zookeeper
      address: 127.0.0.1:2181
  consumer:
    references:
      GreeterClientImpl:
        registry-ids: # Subscribe from the nacos registration center
          - nacos
        protocol: tri
        interface: ""
      GreeterClientImpl2:
        registry-ids: # Subscribe from the zookeeper registration center
          - zookeeper
        protocol: tri
        interface: "" # Interface name
```

## Additional Notes

### How to Choose the Registration Center at Different Levels

**Server level** `server.WithServerRegistryIDs` Default registration center for all services under the server

**Service level** `server.WithRegistryIDs` Registration center for a single service

**Client level** `client.WithClientRegistryIDs` Which registration centers the client subscribes from

### How to Verify Registration to Both Nacos and ZooKeeper

After completing the configuration above and starting the server and client, you can verify whether the multi-registration-center setup is successful in the following ways.

**Method 1: Check the client logs**

The client logs should contain content similar to the following (time, log level, and code location prefixes may vary depending on the environment):

```text
nacos client resp: greeting:"from nacos", err: <nil>
zookeeper client resp: greeting:"from zookeeper", err: <nil>
```

Both logs show err as nil, which means the client has discovered and invoked the service from Nacos and ZooKeeper respectively.

**Method 2: Check the service instances in both registration centers**

Query the service instances via the Nacos OpenAPI:

```shell
curl -s 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=dubbo_multi_registry_server&groupName=DEFAULT_GROUP'
```

> Note: `serviceName` needs to be replaced with the application name you configured (the value set by `dubbo.WithName()` or `application.name`); the ZooKeeper node path `/services/<application-name>` is the same.

The expected hosts should contain the provider address (e.g. `<provider-ip>:20000`) and healthy should be true.

Query the service node via the ZooKeeper client:

```shell
docker exec dubbo-go-zookeeper zkCli.sh -server 127.0.0.1:2181 ls /services/dubbo_multi_registry_server
```

The expected output is similar to `[<provider-ip>:20000]`. `<provider-ip>` is the actual IP address registered by the service provider, which depends on the local network environment.

If both registration centers can see the service instances, it means the service has been successfully registered to both Nacos and ZooKeeper, and the client can discover and invoke the service from both registration centers.

## Supported Registration Centers

- Nacos
- ZooKeeper
- Polaris
- Kubernetes

For example, when using Polaris as a registration center, you need to specify the following content, either via the API or the YAML configuration file:

```yaml
dubbo:
  registries:
    polarisMesh:
      protocol: polaris
      address: ${Polaris Server IP}:8091
      namespace: ${Polaris Namespace Info}
      token: ${Polaris Resource Authorization Token}   # If Polaris server enables client authorization, this parameter needs to be configured
```

For usage with Kubernetes registration centers, please refer to the [Control Plane](/en/overview/mannual/control-plane/) documentation.