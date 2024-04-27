---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/debugging/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/debugging/
    - /zh-cn/overview/mannual/golang-sdk/refer/basic_concept/
    - /zh-cn/overview/mannual/golang-sdk/refer/config/
description: "使用 dubbogo.yml 配置文件形式开发微服务应用。"
title: 配置文件
type: docs
weight: 30
---

## 1. 框架配置

Dubbo-go 框架需要依赖配置进行启动。配置中包含了开发者希望使用框架的各种能力。

### 配置格式

yaml

### 配置路径

默认从 `../conf/dubbogo.yaml ` 加载框架配置

可通过指定环境变量：DUBBO_GO_CONFIG_PATH=$(your_config_path)/dubbogo.yaml 来修改配置文件路径。

### 配置根结构

位于 [dubbo.apache.org/dubbo-go/v3/config/root_config.go: RootConfig](https://github.com/apache/dubbo-go/blob/e00cf8d6fb2be3cd9c6e42cc3d6efa54e10229d3/config/root_config.go#L50)

框架加载时，任何形式的配置都会被解析成 RootConfig，在 RootConfig.Init 方法中加载。

## 2. 配置API

开发者可以使用 API 的形式构建配置，从而启动框架。该方法较适合 dubbo-go 作为第三方组件引入的情况。

## 3. 配置中心

开发者可以将配置放置在配置中心，从而便于配置的管理和修改。







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
