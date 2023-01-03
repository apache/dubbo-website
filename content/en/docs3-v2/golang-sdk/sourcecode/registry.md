---
title: 注册中心
type: docs
weight: 1
---

Dubbogo 为注册中心抽象了一套接口如下：

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

##