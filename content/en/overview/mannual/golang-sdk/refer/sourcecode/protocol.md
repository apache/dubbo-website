---
aliases:
    - /en/docs3-v2/golang-sdk/sourcecode/protocol/
    - /en/docs3-v2/golang-sdk/sourcecode/protocol/
description: Interpretation of Network Protocol Source Code
title: Network Protocol
type: docs
weight: 1
---






For the Dubbogo microservice framework, the network protocol is the module responsible for network communication in remote procedure calls, handling functions such as data serialization, packaging, request initiation, and network port listening from the application layer to the network layer. Dubbogo abstracts a set of interfaces for protocols as follows:

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

This interface includes three methods. The Export method is responsible for the service exposure process. The input parameter invoker is a concept of dubbo, encapsulating a callable instance. In the specific Export method implementation for a protocol (e.g., Triple), the callable instance Invoker with certain logic is exposed to external services in the form of network port listening. Requests targeting that network port will be captured by the listening coroutine initiated by the Export method, which will then deconstruct and deserialize the data according to the network protocol to retrieve the parsed request data.

The Refer method handles the service reference process, with the input parameter url being a general structure in the dubbo framework that describes a desired referenced service. The url parameter includes multiple parameters for the referenced service, such as the service interface name, version number, protocol used, etc. In the specific Refer method implementation for a protocol (e.g., Triple), it encapsulates the specific network protocol within the Invoker callable instance method, allowing RPC calls initiated at the user layer to issue a network request using the returned Invoker object directly.

The Destroy method serves to destroy the currently exposed services, used in service offline scenarios. The Dubbogo framework has an elegant offline mechanism that can take down all started services in the form of listening signals before the service process terminates.

