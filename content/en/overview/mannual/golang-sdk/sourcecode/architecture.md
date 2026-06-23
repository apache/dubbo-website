---
aliases:
    - /en/docs3-v2/golang-sdk/preface/design/architecture/
    - /en/overview/mannual/golang-sdk/preface/design/architecture/
    - /en/overview/mannual/golang-sdk/refer/sourcecode/architecture/
description: Current Dubbo Go architecture
keywords: Architecture
title: Architecture
type: docs
weight: 1
---

Related samples:

* Quick start RPC application: <a href="https://github.com/apache/dubbo-go-samples/tree/main/helloworld" target="_blank">dubbo-go-samples/helloworld</a>
* Registry-based microservice application: <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>
* Multi-protocol application: <a href="https://github.com/apache/dubbo-go-samples/tree/main/rpc/multi-protocols" target="_blank">dubbo-go-samples/rpc/multi-protocols</a>

Dubbo Go is organized around a small set of runtime concepts: an application instance, providers, consumers, protocols, registries, metadata, and governance extensions. Current applications are usually built with the API entry points in `dubbo.go`, `server`, and `client`, while configuration-file users still go through `config.RootConfig`.

## Main Runtime Layers

| Layer | Important packages | Responsibility |
| --- | --- | --- |
| Application instance | `dubbo.go`, `options.go` | Holds application, protocol, registry, metadata, metrics, tracing, router, and shutdown options. |
| Provider API | `server` | Registers service handlers, builds service options, creates invokers, and exports services. |
| Consumer API | `client` | Creates clients, dials service references, creates generated or generic services, and invokes remote methods. |
| Protocol | `protocol/base`, `protocol/triple`, `protocol/dubbo`, `protocol/rest` | Converts invokers into network servers on provider side and network clients on consumer side. |
| Registry and discovery | `registry`, `registry/protocol`, `registry/servicediscovery`, `registry/directory` | Handles registration, subscription, service discovery, and registry-backed invocation. |
| Metadata | `metadata`, `metadata/report`, `metadata/mapping` | Stores service definitions, service-to-application mapping, and metadata reports. |
| Governance extensions | `filter`, `cluster`, `cluster/router`, `cluster/loadbalance`, `common/extension` | Provides filters, routing, load balancing, cluster strategies, and extension registration. |

## Provider Flow

For the current server API, a provider normally follows this path:

1. `dubbo.NewInstance(...)` creates an application instance and initializes global options.
2. `ins.NewServer(...)` creates a server with application, protocol, registry, and provider options.
3. Generated code or user code calls `server.Register(...)` or `server.RegisterService(...)`.
4. The server builds `ServiceOptions`, records service metadata, and creates an invoker.
5. `ServiceOptions.Export()` delegates to protocol export logic.
6. If a registry is configured, `registry/protocol` coordinates service export, registry registration, and metadata reporting.

The Triple protocol implementation exports services through `protocol/triple`. The application-level discovery path registers application instances and metadata through `registry/servicediscovery`.

## Consumer Flow

A consumer normally follows this path:

1. `dubbo.NewInstance(...)` creates an application instance.
2. `ins.NewClient(...)` creates a client with registry, protocol, consumer, metadata, metrics, tracing, and router options.
3. Generated clients call `client.DialWithInfo(...)`, while generic calls use `client.NewGenericService(...)`.
4. The client builds `ReferenceOptions` and initializes metadata report if needed.
5. Direct URLs call the target protocol directly; registry URLs go through `registry/protocol`.
6. The registry directory receives address updates and applies routers, load balancers, and cluster logic before invoking a provider.

## Extension Loading

Many implementations are registered by Go package initialization. Importing:

```go
import _ "dubbo.apache.org/dubbo-go/v3/imports"
```

loads common built-in protocols, registries, filters, routers, metadata reports, tracing exporters, metrics, load balancers, and cluster strategies. Users can also import only the specific implementation packages they need.
