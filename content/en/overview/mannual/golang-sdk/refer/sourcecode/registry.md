---
aliases:
    - /en/docs3-v2/golang-sdk/sourcecode/registry/
    - /en/docs3-v2/golang-sdk/sourcecode/registry/
description: Interpretation of the source code of the registry
title: Registry
type: docs
weight: 1
---






Dubbogo abstracts a set of interfaces for the registry as follows:

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

This interface mainly includes four methods: register, unregister, subscribe, and unsubscribe. As the names suggest, it summarizes the actions for client and server interactions with the registry. For general interface-level service registration scenarios, when the Provider service starts, it abstracts its service interface information into a URL, which contains all the information needed for the client to initiate a call (IP, port, protocol, etc.). The server's registry component writes this URL to the registry (e.g., Zookeeper). After the client starts, it will subscribe to the required service information through the registry component during the service reference step, and the obtained service information will be written to the client cache in the form of asynchronous event updates. Thus, upon successful service discovery, it can initiate calls to the corresponding service provider based on the retrieved service URL parameters.

