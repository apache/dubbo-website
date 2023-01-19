---
title: Network Protocol
type: docs
weight: 1
---

For the Dubbogo microservice framework, the network protocol is the module responsible for network communication in the remote procedure call, responsible for data serialization, packaging, request initiation, network port monitoring and other functions from the application layer to the network layer. Dubbogo abstracts a set of interfaces for the protocol as follows:

```go
type Protocol interface {
// Export service for remote invocation
Export (invoker Invoker) Exporter
// Refer a remote service
Refer(url *common.URL) Invoker
// Destroy will destroy all invoker and exporter, so it only is called once.
Destroy()
}
```

This interface contains three methods. Among them, the Export method is responsible for the exposure process of the service. The input parameter invoker is the concept of dubbo, which encapsulates an instance that can be invoked. In the Export method implemented by a specific network protocol (such as Triple), for a specific protocol, the callable instance Invoker encapsulated with certain logic will be exposed to external services in the form of network port monitoring, and external requests for this network port will be It will be obtained by the monitoring coroutine opened by the Export method, and then the package will be disassembled and deserialized according to the network protocol to obtain the parsed request data.

The Refer method is responsible for the referral process of the service. The input parameter url is a common structure of the dubbo framework, which can describe a service that you want to refer to. The url parameter contains multiple parameters that you want to refer to the service, such as the interface name of the corresponding service. Version number (version), usage agreement (protocol) and so on. In the Refer method implemented by a specific network protocol (such as Triple), the specific network protocol will be encapsulated into the method of the Invoker callable instance, and the RPC call initiated by the user layer can directly initiate the network of the specific protocol through the returned Invoker object. ask.

The Destroy method is used to destroy the currently exposed service and is used in service offline scenarios. The Dubbogo framework has an elegant offline mechanism, which can log off all started services in the form of listening signals before the service process terminates.