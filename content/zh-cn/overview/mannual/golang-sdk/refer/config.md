---
aliases:
    - /zh/docs3-v2/golang-sdk/refer/config/
    - /zh-cn/docs3-v2/golang-sdk/refer/config/
description: Dubbo-go 配置项
title: 配置项参考指南
type: docs
weight: 1
---






## 根配置

## 客户端配置

## 服务端配置

## 注册中心配置

### 使用配置 API

- 客户端使用配置 API 设置注册中心

可通过调用config.NewRegistryConfigWithProtocolDefaultPort方法，快速设置用于调试的注册中心，支持zookeeper(127.0.0.1:2181) 和nacos(127.0.0.1:8848)

```go
rc := config.NewRootConfigBuilder().
    SetConsumer(config.NewConsumerConfigBuilder().
        SetRegistryIDs("zookeeperID"). // use defined registryID
        Build()).
    AddRegistry("zookeeperID", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
    Build()
```

全部接口：可通过调用RegistryConfigBuilder提供的丰富接口进行配置。

```go
rc := config.NewRootConfigBuilder().
    SetConsumer(config.NewConsumerConfigBuilder().
        SetRegistryIDs("nacosRegistryID"). // use defined registryID
        AddReference("GreeterClientImpl",/*...*/).
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

- 服务端使用配置 API 设置配置中心

简易接口 config.NewRegistryConfigWithProtocolDefaultPort

```go
rc := config.NewRootConfigBuilder().
    SetProvider(config.NewProviderConfigBuilder().
        AddService("GreeterProvider", /*...*/).
        SetRegistryIDs("registryKey").  // use defined registryID
        Build()).
    AddRegistry("registryKey", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
    Build()
```

全部接口：可通过调用RegistryConfigBuilder提供的丰富接口进行配置。

```go
rc := config.NewRootConfigBuilder().
    SetProvider(config.NewProviderConfigBuilder().
        AddService("GreeterProvider",/*...*/)
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

## 网络协议

### 配置文件

### 使用配置 API

- 客户端使用配置 API 设置网络协议

```go
rc := config.NewRootConfigBuilder().
    SetConsumer(config.NewConsumerConfigBuilder().
        AddReference("GreeterClientImpl", config.NewReferenceConfigBuilder().
            SetInterface("org.apache.dubbo.UserProvider").
            SetProtocol("tri"). // set reference protcol to triple
            Build()).
        Build()).
    Build()
```

- 服务端使用配置 API 设置网络协议

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
