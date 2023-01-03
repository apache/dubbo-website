---
title: Multiple Registries
type: docs
weight: 100
---

A registration center for multiple interface dimensions that can be configured by a Dubbo-go application.

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application
- Start Nacos and Zookeeper locally

## 2. Using multiple registries

Modify the server configuration go-server/conf/dubbogo.yaml, and register the service on two registration centers at the same time.

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
  provider:
    services:
      GreeterProvider:
        registry-ids: # Simultaneous registration
          - zookeeper
          - nacos
        interface: ""
```

Modify client configuration go-client/conf/dubbogo.yaml

```yaml
dubbo:
  registries:
    nacos: # Specify the nacos registration center
      protocol: nacos
      address: 127.0.0.1:8848
    zookeeper: # Specify the zookeeper registration center
      protocol: zookeeper
      address: 127.0.0.1:2181
  consumer:
    references:
      GreeterClientImpl:
        registry-ids: # Discovered from the nacos registry service
          - nacos
        protocol: tri
        interface: ""
      GreeterClientImpl2:
        registry-ids: # service discovery from zookeeper registry
          - zookeeper
        protocol: tri
        interface: ""
```

Modify the client code and define a client stub class named GreeterClientImpl2:

```go
var grpcGreeterImpl2 = new(GreeterClientImpl2)

type GreeterClientImpl2 struct{
api. GreeterClientImpl
}
```

The client writes the calling code:

```go
func main() {
config. SetConsumerService(grpcGreeterImpl)
config.SetConsumerService(grpcGreeterImpl2)
if err := config.Load(); err != nil {
panic(err)
}

logger.Info("start to test dubbo")
req := &api.HelloRequest{
Name: "Laurence",
}
reply, err := grpcGreeterImpl.SayHello(context.Background(), req)
if err != nil {
logger. Error(err)
}
logger.Infof("nacos server response result: %v\n", reply)

reply, err = grpcGreeterImpl2. SayHello(context. Background(), req)
if err != nil {
logger. Error(err)
}
logger.Infof("zk server response result: %v\n", reply)
}

```



## 3. Multi-registry service discovery verification

Start go-server/cmd and go-client/cmd respectively to view two logs of successful calls:

```
INFO cmd/client.go:55 nacos server response result: name:"Hello laurence" id:"12345" age:21

INFO cmd/client.go:61 zk server response result: name:"Hello laurence" id:"12345" age:21

```