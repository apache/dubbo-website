---
aliases:
    - /en/docs3-v2/golang-sdk/sourcecode/protocol/
    - /en/overview/mannual/golang-sdk/refer/sourcecode/protocol/
description: Current network protocol source code overview
title: Network Protocol
type: docs
weight: 1
---

Related samples:

* Triple RPC: <a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple" target="_blank">dubbo-go-samples/rpc/triple</a>
* Multi-protocol service: <a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/multi-protocols" target="_blank">dubbo-go-samples/rpc/multi-protocols</a>
* gRPC interoperability: <a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/grpc" target="_blank">dubbo-go-samples/rpc/grpc</a>

In current Dubbo Go, the protocol layer is the bridge between the invocation model and the wire protocol. It is responsible for exposing providers as network services and turning consumer-side references into callable remote invokers.

## Core Protocol Abstraction

The current protocol interface is defined in `protocol/base/base_protocol.go`:

```go
type Protocol interface {
	Export(invoker Invoker) Exporter
	Refer(url *common.URL) Invoker
	Destroy()
}
```

Its responsibilities are straightforward:

* `Export`: expose a provider-side invoker as a network service
* `Refer`: create a consumer-side invoker for a target URL
* `Destroy`: destroy protocol-owned invokers and exporters

There is also an optional capability:

```go
type RegistryUnregisterer interface {
	UnregisterRegistries()
}
```

which is used during graceful shutdown so a protocol can unregister exported services from registries before full teardown.

## Provider-Side Flow

On the provider side, Dubbo Go usually follows this path:

1. `server.Register(...)` or `server.RegisterService(...)` creates service metadata and an invoker.
2. `ServiceOptions.Export()` selects protocol and registry behavior.
3. The concrete protocol implementation calls `Export(invoker)`.
4. The exported service starts listening on the configured network endpoint.

Different protocols provide different transports and codecs, but they all fit into the same `Export` contract.

## Consumer-Side Flow

On the consumer side:

1. `client.Dial...(...)` builds a reference.
2. A direct URL or registry URL is resolved.
3. The chosen protocol implementation calls `Refer(url)`.
4. The returned invoker becomes the callable object behind generated stubs or generic calls.

This is why the protocol layer is shared by both generated clients and registry-driven references.

## Built-In Protocols

Common built-in implementations include:

* `protocol/triple`
* `protocol/dubbo`
* `protocol/rest`
* `protocol/jsonrpc`

Triple is the recommended protocol for new applications. It supports unary and streaming calls, metadata headers and trailers, reflection, and gRPC interoperability on the wire.

`rpc/multi-protocols` is a good sample to read when you want to see how one application exposes multiple protocol endpoints at the same time.

## Registry Protocol Wrapper

Dubbo Go also has a registry-backed protocol layer under `registry/protocol`.

This wrapper coordinates:

* service export
* service registration
* metadata report
* subscription and directory refresh

So in practice, many service references are not "protocol only"; they are "registry protocol + concrete business protocol".

## Filtered Protocol Chain

The raw protocol implementation is often wrapped again through `protocol/protocolwrapper`, especially for filter chaining. That makes protocol invocation one of the main integration points for cross-cutting behaviors such as:

* tracing
* metrics
* token/auth checks
* generic invocation support
* graceful shutdown

This layered structure is why the protocol package is small at the interface level but very important in the runtime call path.
