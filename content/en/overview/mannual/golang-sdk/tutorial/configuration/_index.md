---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/debugging/
    - /en/docs3-v2/golang-sdk/tutorial/debugging/
    - /en/overview/manual/golang-sdk/refer/basic_concept/
    - /en/overview/manual/golang-sdk/refer/config/
description: "Develop microservice applications using the dubbogo.yml configuration file."
title: Configuration File
type: docs
weight: 30
---

## 1. Framework Configuration

The Dubbo-go framework relies on configuration for startup. The configuration includes various capabilities that the developer wishes to use within the framework.

### Configuration Format

yaml

### Configuration Path

By default, the framework configuration is loaded from `../conf/dubbogo.yaml`.

You can modify the configuration file path by specifying the environment variable: DUBBO_GO_CONFIG_PATH=$(your_config_path)/dubbogo.yaml.

### Configuration Root Structure

Located at [dubbo.apache.org/dubbo-go/v3/config/root_config.go: RootConfig](https://github.com/apache/dubbo-go/blob/e00cf8d6fb2be3cd9c6e42cc3d6efa54e10229d3/config/root_config.go#L50).

When the framework loads, any form of configuration will be parsed into RootConfig and loaded in the RootConfig.Init method.

## 2. Configuration API

Developers can build configurations using APIs to start the framework. This method is more suitable when dubbo-go is introduced as a third-party component.

## 3. Configuration Center

Developers can place the configuration in a configuration center for easier management and modification.

## Root Configuration

## Client Configuration

## Server Configuration

## Registry Configuration

### Using Configuration API

- Clients use the configuration API to set up the registry.

You can quickly set up the registry for debugging by calling the config.NewRegistryConfigWithProtocolDefaultPort method, supporting zookeeper (127.0.0.1:2181) and nacos (127.0.0.1:8848).

```go
rc := config.NewRootConfigBuilder().
    SetConsumer(config.NewConsumerConfigBuilder().
        SetRegistryIDs("zookeeperID"). // use defined registryID
        Build()).
    AddRegistry("zookeeperID", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
    Build()
```

All interfaces: You can configure through the rich interfaces provided by RegistryConfigBuilder.

```go
rc := config.NewRootConfigBuilder().
    SetConsumer(config.NewConsumerConfigBuilder().
        SetRegistryIDs("nacosRegistryID"). // use defined registryID
        AddReference("GreeterClientImpl", /*...*/).
        Build()
    AddRegistry("nacosRegistryID", config.NewRegistryConfigBuilder().
        SetProtocol("nacos").
        SetAddress("127.0.0.1:8848").
        SetGroup("dubbo-go").
        SetNamespace("dubbo").
        SetUsername("admin").
        SetPassword("admin").
        SetTimeout("3s").
        Build()).
    Build()
```

- Servers use the configuration API to set up the configuration center.

Simple interface config.NewRegistryConfigWithProtocolDefaultPort.

```go
rc := config.NewRootConfigBuilder().
    SetProvider(config.NewProviderConfigBuilder().
        AddService("GreeterProvider", /*...*/).
        SetRegistryIDs("registryKey").  // use defined registryID
        Build()).
    AddRegistry("registryKey", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
    Build()
```

All interfaces: You can configure through the rich interfaces provided by RegistryConfigBuilder.

```go
rc := config.NewRootConfigBuilder().
    SetProvider(config.NewProviderConfigBuilder().
        AddService("GreeterProvider", /*...*/).
        SetRegistryIDs("registryKey"). // use defined registryID
        Build()).
    AddRegistry("registryKey", config.NewRegistryConfigBuilder().
        SetProtocol("nacos").
        SetAddress("127.0.0.1:8848").
        SetGroup("dubbo-go").
        SetNamespace("dubbo").
        SetUsername("admin").
        SetPassword("admin").
        SetTimeout("3s").
        Build()).
    Build()
```

###

## Network Protocol

### Configuration File

### Using Configuration API

- Clients use the configuration API to set the network protocol.

```go
rc := config.NewRootConfigBuilder().
    SetConsumer(config.NewConsumerConfigBuilder().
        AddReference("GreeterClientImpl", config.NewReferenceConfigBuilder().
            SetInterface("org.apache.dubbo.UserProvider").
            SetProtocol("tri"). // set reference protocol to triple
            Build()).
        Build()).
    Build()
```

- Servers use the configuration API to set the network protocol.

```go
rc := config.NewRootConfigBuilder().
    SetProvider(config.NewProviderConfigBuilder().
        AddService("GreeterProvider", config.NewServiceConfigBuilder().
            SetInterface("org.apache.dubbo.UserProvider").
            SetProtocolIDs("tripleProtocolKey"). // use protocolID 'tripleProtocolKey'
            Build()).
        Build()).
    AddProtocol("tripleProtocolKey", config.NewProtocolConfigBuilder(). // define protocol config with protocolID 'tripleProtocolKey'
        SetName("tri"). // set service protocol to triple
        Build()).
    Build()
```

###

