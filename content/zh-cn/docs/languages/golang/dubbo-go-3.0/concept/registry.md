---
aliases:
    - /zh/docs/languages/golang/dubbo-go-3.0/concept/registry/
description: Dubbo-go 的注册中心
keywords: Dubbo-go 的注册中心
linkTitle: 注册中心
title: Dubbo-go 的注册中心
type: docs
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/golang-sdk/tutorial/develop/registry/)。
{{% /pageinfo %}}

# 注册中心

## 1. Dubbo 的注册中心是什么

对于 Dubbo-go 微服务框架，注册中心在 RPC 场景下复杂保存 Provider 应用的服务信息。Provider 注册地址到注册中心，Consumer 从注册中心读取和订阅 Provider 地址列表。如图所示：

![img](/imgs/architecture.png)

关于 Dubbo 服务发现细节，详情可参考 [Dubbo 官网的概念介绍](/zh-cn/docs/concepts/service-discovery/)

Dubbo-go 为注册中心抽象了一套接口如下：

```go
// Registry Extension - Registry
type Registry interface {
	common.Node

	// Register is used for service provider calling, register services
	// to registry. And it is also used for service consumer calling, register
	// services cared about, for dubbo's admin monitoring.
	Register(url *common.URL) error

	// UnRegister is required to support the contract:
	// 1. If it is the persistent stored data of dynamic=false, the
	//    registration data can not be found, then the IllegalStateException
	//    is thrown, otherwise it is ignored.
	// 2. Unregister according to the full url match.
	// url Registration information, is not allowed to be empty, e.g:
	// dubbo://10.20.153.10/org.apache.dubbo.foo.BarService?version=1.0.0&application=kylin
	UnRegister(url *common.URL) error

	// Subscribe is required to support the contract:
	// When creating new registry extension, pls select one of the
	// following modes.
	// Will remove in dubbogo version v1.1.0
	// mode1: return Listener with Next function which can return
	//        subscribe service event from registry
	// Deprecated!
	// subscribe(event.URL) (Listener, error)
	// Will replace mode1 in dubbogo version v1.1.0
	// mode2: callback mode, subscribe with notify(notify listener).
	Subscribe(*common.URL, NotifyListener) error

	// UnSubscribe is required to support the contract:
	// 1. If don't subscribe, ignore it directly.
	// 2. Unsubscribe by full URL match.
	// url Subscription condition, not allowed to be empty, e.g.
	// consumer://10.20.153.10/org.apache.dubbo.foo.BarService?version=1.0.0&application=kylin
	// listener A listener of the change event, not allowed to be empty
	UnSubscribe(*common.URL, NotifyListener) error
}
```

该接口主要包含四个方法，分别是注册、反注册、订阅、取消订阅。顾名思义，概括了客户端和服务端与注册中心交互的动作。针对普通接口级服务注册发现场景，在Provider 服务启动时，会将自身服务接口信息抽象为一个 url，该 url 包含了客户端发起调用所需的所有信息（ip、端口、协议等），服务端的注册中心组件会将该 url 写入注册中心（例如zk）。客户端启动后，在服务引用 Refer 步骤会通过注册中心组件订阅（Subscribe）需要的服务信息，获取到的服务信息以异步事件更新的形式写入客户端缓存，从而在服务发现成功后，可以根据拿到的服务 url 参数，向对应服务提供者发起调用。

## 2. Dubbo-go 3.0 支持的注册中心类型

Dubbogo 3.0 版本支持的注册中心类型如下：

| 注册中心  | 注册中心名（用于配置） |
| --------- | ---------------------- |
| Zookeeper | zookeeper              |
| Nacos     | nacos                  |
| Etcd      | etcd                   |
| Consul    | consul                 |

## 3. 如何配置注册中心

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

### 使用配置文件 

- 客户端/服务端

```yaml
dubbo:
  registries:
    demoZK: # define registry-id 'demoZK'
      protocol: zookeeper # set registry protocol
      timeout: 3s
      address: 127.0.0.1:2181
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    registry-ids:
      - demoZK # use registry-id 'demoZK'
    services:
      GreeterProvider:
        protocol-ids: triple
        interface: com.apache.dubbo.sample.basic.IGreeter 
  consumer:
    registry-ids:
      - demoZK # use registry-id 'demoZK'
    references:
      GreeterClientImpl:
        protocol: tri
        interface: com.apache.dubbo.sample.basic.IGreeter 
```
