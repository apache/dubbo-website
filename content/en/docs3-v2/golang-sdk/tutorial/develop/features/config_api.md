---
type: docs
title: Launching the Application Using the Configuration API
weight: 2
---

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application

## 2. Start the application using the configuration API

Users do not need to use configuration files, and can directly write configurations in the code in the form of API calls

### 2.1 Modify the server code:

```go
func main() {
config. SetProviderService(&GreeterProvider{})
  
protocolConfig := config. NewProtocolConfigBuilder().
SetPort("20000").
SetName("tri").
build()
  
serviceConfig := config. NewServiceConfigBuilder().
SetInterface(""). // read interface from pb
build()
  
providerConfig := config. NewProviderConfigBuilder().
AddService("GreeterProvider", serviceConfig).
build()
  
rootConfig := config. NewRootConfigBuilder().
AddProtocol("triple-protocol-id", protocolConfig). // add protocol, key is custom
SetProvider(providerConfig).Build()
  
if err := config.Load(config.WithRootConfig(rootConfig)); err != nil {
panic(err)
}
select {}
}

```

The configuration API looks complicated, but the construction process of a single configuration structure is consistent. Referring to the design of Java Builder, we use `New().SetA().SetB().Build()` in the configuration API module way to construct a single configuration structure layer by layer.

Once done, the go-server/conf folder can be deleted.



### 2.2 Modify the client code:

go-client/cmd/client.go

```go
func main() {
config. SetConsumerService(grpcGreeterImpl)

referenceConfig := config. NewReferenceConfigBuilder().
SetProtocol("tri").
SetURL("tri://localhost:20000").
SetInterface(""). // read interface name from pb
build()

consumerConfig := config.NewConsumerConfigBuilder().
AddReference("GreeterClientImpl", referenceConfig).
build()

rootConfig := config. NewRootConfigBuilder().
SetConsumer(consumerConfig).Build()
if err := config.Load(config.WithRootConfig(rootConfig)); err != nil {
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
logger.Infof("client response result: %v\n", reply)
}

```

Once done, the go-client/conf folder can be deleted.

### 2.3 Verify Config API

Start the server and client respectively to view the call information.

```
INFO cmd/client.go:62 client response result: name:"Hello laurence" id:"12345" age:21
```