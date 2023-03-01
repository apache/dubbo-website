---
aliases:
    - /zh/docs/languages/golang/dubbo-go-3.0/concept/protocol/
description: Dubbo-go 的网络协议
keywords: Dubbo-go 的网络协议
linkTitle: 网络协议
title: Dubbo-go 的网络协议
type: docs
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/golang-sdk/preface/concept/protocol/)。
{{% /pageinfo %}}

# 网络协议

## 1. 网络协议是什么

对于 Dubbo-go 微服务框架，网络协议为远程过程调用中负责网络通信的模块，负责应用层到网络层的数据序列化、打包、请求发起、网络端口监听等功能。Dubbo-go 为协议抽象了一套接口如下：

```go
type Protocol interface {
	// Export service for remote invocation
	Export(invoker Invoker) Exporter
	// Refer a remote service
	Refer(url *common.URL) Invoker
	// Destroy will destroy all invoker and exporter, so it only is called once.
	Destroy()
}
```

该接口包含三个方法。其中 Export 方法负责服务的暴露过程。入参 invoker 为dubbo 的概念，其封装了一个可以被调用的实例。在具体网络协议（例如Triple）实现的 Export 方法中，会针对特定的协议，将封装有一定逻辑的可调用实例 Invoker 以网络端口监听的形式暴露给外部服务，来自外部针对该网络端口的请求将会被 Export 方法开启的监听协程获取，进而根据网络协议进行拆解包和反序列化，得到解析后的请求数据。

Refer 方法负责服务的引用过程，其入参 url 为 dubbo 框架通用的结构，可以描述一个希望引用的服务，url 参数中包含了多个希望引用服务的参数，例如对应服务的接口名(interface)，版本号(version)，使用协议(protocol) 等等。在具体网络协议（例如Triple）实现的 Refer 方法中，会将特定的网络协议封装到 Invoker 可调用实例的方法中，用户层发起的 RPC 调用即可直接通过返回的 Invoker 对象，发起特定协议的网络请求。

Destroy 方法作用为销毁当前暴露的服务，用于服务下线场景。Dubbo-go 框架有优雅下线机制，可以在服务进程终止前以监听信号的形式，下线所有已启动的服务。

## 2. Dubbo-go 3.0 支持的网络协议

Dubbo-go 3.0 版本支持的网络协议和序列化方式如下：

| 协议    | 协议名 (用于配置) |         序列化方式          | 默认序列化方式 |
| ------- | ----------------- | :-------------------------: | -------------- |
| Triple  | tri               | pb hessian2 msgpack custome | pb             |
| Dubbo   | dubbbo            |          hessian2           | hessian2       |
| gRPC    | grpc              |             pb              | pb             |
| jsonRPC | jsonrpc           |            json             | json           |

## 3. 如何配置网络协议

在快速开始章节可以看到，在配置的过程中将 Protocol 设置为 tri，表明使用 Triple 协议进行服务暴露和服务调用。快速开始章节使用的配置 API 进行配置的写入，这样的好处是无需使用配置文件。我们摘取出和网络协议相关的内容进行说明。

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

### 使用配置文件 

参考 samples/helloworld

- 客户端使用配置文件设置网络协议

```yaml
dubbo:
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri # set protcol to tri
        interface: com.apache.dubbo.sample.basic.IGreeter 
```

- 服务端使用配置文件设置网络协议

```yaml
dubbo:
  protocols:
    triple: # define protcol-id 'triple'
      name: tri # set protcol to tri
      port: 20000 # set port to be listened
  provider:
    services:
      GreeterProvider:
        protocol-ids: triple # use protocol-ids named 'triple'
        interface: com.apache.dubbo.sample.basic.IGreeter
```
