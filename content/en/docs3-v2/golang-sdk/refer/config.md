---
title: configuration item reference
type: docs
weight: 1
---

## root configuration

## Client configuration

## Server configuration

## Registry configuration

### Using the Configuration API

- The client sets up the registry using the configuration API

You can quickly set the registry for debugging by calling the config.NewRegistryConfigWithProtocolDefaultPort method, and support zookeeper(127.0.0.1:2181) and nacos(127.0.0.1:8848)

```go
rc := config. NewRootConfigBuilder().
    SetConsumer(config. NewConsumerConfigBuilder().
        SetRegistryIDs("zookeeperID"). // use defined registryID
        Build()).
    AddRegistry("zookeeperID", config. NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
    build()
```

All interfaces: can be configured by calling the rich interfaces provided by RegistryConfigBuilder.

```go
rc := config. NewRootConfigBuilder().
    SetConsumer(config. NewConsumerConfigBuilder().
        SetRegistryIDs("nacosRegistryID"). // use defined registryID
        AddReference("GreeterClientImpl", /*...*/).
        build()
    AddRegistry("nacosRegistryID", config. NewRegistryConfigBuilder().
        SetProtocol("nacos").
        SetAddress("127.0.0.1:8848").
        SetGroup("dubbo-go").
        SetNamespace("dubbo").
        SetUsername("admin").
        SetPassword("admin").
        SetTimeout("3s").
        Build()).
    build()
```

- The server uses the configuration API to set the configuration center

Simple interface config.NewRegistryConfigWithProtocolDefaultPort

```go
rc := config. NewRootConfigBuilder().
    SetProvider(config. NewProviderConfigBuilder().
        AddService("GreeterProvider", /*...*/).
        SetRegistryIDs("registryKey"). // use defined registryIDs
        Build()).
    AddRegistry("registryKey", config. NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
    build()
```

All interfaces: can be configured by calling the rich interfaces provided by RegistryConfigBuilder.

```go
rc := config. NewRootConfigBuilder().
    SetProvider(config. NewProviderConfigBuilder().
        AddService("GreeterProvider", /*...*/)
        SetRegistryIDs("registryKey"). // use defined registryIDs
        Build()).
    AddRegistry("registryKey", config. NewRegistryConfigBuilder().
        SetProtocol("nacos").
        SetAddress("127.0.0.1:8848").
        SetGroup("dubbo-go").
        SetNamespace("dubbo").
        SetUsername("admin").
        SetPassword("admin").
        SetTimeout("3s").
        Build()).
    build()
```

###

## Network protocol

### configuration file

### Using the Configuration API

- The client sets the network protocol using the configuration API

```go
rc := config. NewRootConfigBuilder().
    SetConsumer(config. NewConsumerConfigBuilder().
        AddReference("GreeterClientImpl", config. NewReferenceConfigBuilder().
            SetInterface("org. apache. dubbo. UserProvider").
            SetProtocol("tri"). // set reference protocol to triple
            Build()).
        Build()).
    build()
```

- The server uses the configuration API to set the network protocol

```go
rc := config. NewRootConfigBuilder().
    SetProvider(config. NewProviderConfigBuilder().
        AddService("GreeterProvider", config. NewServiceConfigBuilder().
            SetInterface("org. apache. dubbo. UserProvider").
            SetProtocolIDs("tripleProtocolKey"). // use protocolID 'tripleProtocolKey'
            Build()).
        Build()).
    AddProtocol("tripleProtocolKey", config. NewProtocolConfigBuilder(). // define protocol config with protocolID 'tripleProtocolKey'
        SetName("tri"). // set service protocol to triple
        Build()).
    build()
```

###