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

## API Configuration Method

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithRegistry(
	    registryWithID("nacos"),
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithRegistry(
	    registryWithID("zookeeper"),
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
)

```

Specify which registration center a service under a specific server should register to:
```go
// Specify that the service under the server registers to the zookeeper registration center
srv, _ := ins.NewServer(server.WithServerRegistryIDs([]string{"zookeeper"}))

// Specify that the service under the server registers to the nacos registration center
srv2, _ := ins.NewServer(server.WithServerRegistryIDs([]string{"nacos"}))
```

Specify which registration center a particular service should register to:
```go
srv, _ := ins.NewServer()

greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}, server.WithRegistryIDs([]string{"zookeeper"}))
```

The usage on the client side is similar.

## YAML Configuration Method

Modify the server configuration at go-server/conf/dubbogo.yaml to register the service in both registration centers.

```yaml
dubbo:
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
```

## Supported Registration Centers
* Nacos
* Zookeeper
* Polaris
* Kubernetes

For example, when using Polaris as a registration center, you need to specify the following content, both via API or YAML configuration file:

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

