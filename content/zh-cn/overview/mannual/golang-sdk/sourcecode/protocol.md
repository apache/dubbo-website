---
aliases:
    - /zh/docs3-v2/golang-sdk/sourcecode/protocol/
    - /zh-cn/docs3-v2/golang-sdk/sourcecode/protocol/
description: 网络协议源码解读
title: 网络协议
type: docs
weight: 1
---






对于 Dubbogo 微服务框架，网络协议为远程过程调用中负责网络通信的模块，负责应用层到网络层的数据序列化、打包、请求发起、网络端口监听等功能。Dubbogo 为协议抽象了一套接口如下：

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

Destroy 方法作用为销毁当前暴露的服务，用于服务下线场景。Dubbogo 框架有优雅下线机制，可以在服务进程终止前以监听信号的形式，下线所有已启动的服务。