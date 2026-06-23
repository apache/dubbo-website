---
aliases:
    - /en/docs3-v2/golang-sdk/preface/concept/generic/
    - /en/docs3-v2/golang-sdk/preface/concept/generic/
    - /en/overview/mannual/golang-sdk/preface/concept/generic/
description: Generic invocation reference
keywords: Generic invocation
title: Generic Invocation
type: docs
weight: 2
---

Related samples:

* Generic invocation sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/generic" target="_blank">dubbo-go-samples/generic</a>
* Triple sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple" target="_blank">dubbo-go-samples/rpc/triple</a>

See also: [Source Code Guide: Generic Call](/en/overview/mannual/golang-sdk/sourcecode/generic/).

Generic invocation lets a caller invoke a remote service without generated stubs for the target interface. It is commonly used in gateway, testing, interoperability, and dynamic invocation scenarios.

## Recommended Entry

For current Dubbo Go, the recommended entry is:

* `client.NewGenericService(...)`
* `filter/generic.GenericService.Invoke(...)`
* `filter/generic.GenericService.InvokeWithType(...)`

This is the normal runtime path for new generic invocation code. Older `config.ReferenceConfig`-style examples are compatibility paths and should not be the default choice for new docs.

## Typical Triple Usage

For direct connection:

```go
ins, err := dubbo.NewInstance(dubbo.WithName("generic-client"))
if err != nil {
	panic(err)
}

cli, err := ins.NewClient()
if err != nil {
	panic(err)
}

genericService, err := cli.NewGenericService(
	"org.apache.dubbo.samples.UserProvider",
	client.WithProtocolTriple(),
	client.WithSerialization(constant.Hessian2Serialization),
	client.WithURL("tri://127.0.0.1:50052"),
	client.WithVersion("1.0.0"),
	client.WithGroup("triple"),
)
if err != nil {
	panic(err)
}
```

Then invoke the remote method dynamically:

```go
resp, err := genericService.Invoke(
	context.Background(),
	"GetUser1",
	[]string{"java.lang.String"},
	[]hessian.Object{"A003"},
)
```

This mode is the easiest way to understand generic invocation, and it matches the current `dubbo-go-samples/generic` layout.

## Automatic Result Mapping

If you want a typed Go result instead of manually converting the returned map, use `InvokeWithType(...)`:

```go
type User struct {
	ID   string
	Name string
	Age  int32
}

var user User
err = genericService.InvokeWithType(
	context.Background(),
	"GetUser1",
	[]string{"java.lang.String"},
	[]hessian.Object{"A003"},
	&user,
)
```

`InvokeWithType(...)` is useful when the transport is generic but the caller still wants a concrete Go struct result.

## Generic Modes

Dubbo Go supports several generic modes through the `generic` setting:

| Mode | Value | Result shape | Typical usage |
| --- | --- | --- | --- |
| Map | `true` | `map[string]any`-style data | default and most common |
| Gson | `gson` | JSON string | JSON-oriented interoperability |
| Protobuf-JSON | `protobuf-json` | JSON string | protobuf service interoperability |
| Bean | `bean` | Java bean descriptor | Java-specific compatibility |

For most Go and Go/Java interoperability scenarios, the default Map mode is still the most practical choice.

## Contract Guidance

When a service is expected to support generic invocation or cross-language consumers:

* prefer explicit request structs over complex ad hoc argument lists;
* prefer `[]T` over variadic `...T` in public RPC contracts;
* prefer Triple + Protobuf IDL for new cross-language services.

This keeps method signatures easier to model in dynamic callers, gateways, and generic serializers.
