---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic/
    - /en/overview/mannual/golang-sdk/refer/sourcecode/generic/
    - /en/overview/mannual/golang-sdk/tutorial/develop/features/generic/
description: Generic invocation in current Dubbo Go
title: Generic Call
type: docs
weight: 7
---

Related samples:

* Generic invocation sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/generic" target="_blank">dubbo-go-samples/generic</a>
* Triple sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple" target="_blank">dubbo-go-samples/rpc/triple</a>

Generic invocation in current Dubbo Go is centered on `client.NewGenericService(...)` and `filter/generic.GenericService`. Older examples based on `ReferenceConfigBuilder`, `GenericLoad()`, and `GetRPCService()` describe the legacy compatibility API and are no longer the recommended entry point.

## Core API

The main runtime entry is in `client/client.go`:

```go
genericService, err := cli.NewGenericService(
	"org.apache.dubbo.samples.UserProvider",
	client.WithProtocolTriple(),
	client.WithSerialization(constant.Hessian2Serialization),
	client.WithURL("tri://127.0.0.1:20000"),
)
```

`NewGenericService(...)` does three important things by default:

* sets `NONIDL`
* enables generic invocation
* uses `hessian2` serialization

Internally it creates `filter/generic.GenericService`, then wires it into the normal reference and invocation path.

## GenericService

The core type is:

```go
type GenericService struct {
	Invoke func(ctx context.Context, methodName string, types []string, args []hessian.Object) (any, error) `dubbo:"$invoke"`
}
```

This mirrors the generic invocation model used by Dubbo: you provide:

* method name
* parameter type names
* argument list

and the framework sends a generic `$invoke` request to the remote service.

## Typed Result Helper

Current Dubbo Go also provides `InvokeWithType(...)`:

```go
var user User
err := genericService.InvokeWithType(
	ctx,
	"getUser",
	[]string{"java.lang.String"},
	[]hessian.Object{"123"},
	&user,
)
```

This helper deserializes the generic result into a concrete Go reply object. It is useful when you still want generic transport behavior but do not want to manually convert the returned map structure.

## Typical Scenarios

Generic invocation is usually used when:

* the caller does not have generated stubs
* the caller wants to invoke services dynamically by interface and method name
* the caller is interacting with Java Dubbo services using generic payloads
* migration or testing requires a dynamic client

For Triple plus Hessian2 compatibility scenarios, the `generic` sample is the best place to look first.

## Relation to the Generic Filter

The implementation is not only a client helper. It is also connected to the generic filter chain under `filter/generic`, where Dubbo Go handles generic invocation encoding, decoding, and service-side adaptation.

That is why this feature belongs both to client APIs and to the framework's filter-based extension model.
