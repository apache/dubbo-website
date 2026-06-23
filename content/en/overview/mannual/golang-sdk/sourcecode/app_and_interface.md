---
aliases:
    - /en/docs3-v2/golang-sdk/preface/design/app_and_interface/
    - /en/overview/mannual/golang-sdk/preface/design/app_and_interface/
    - /en/overview/mannual/golang-sdk/refer/sourcecode/app_and_interface/
description: Application-level and interface-level concepts in current Dubbo Go
keywords: Basic concepts
title: Application and Interface
type: docs
---

Related samples:

* Hello world application: <a href="https://github.com/apache/dubbo-go-samples/tree/main/helloworld" target="_blank">dubbo-go-samples/helloworld</a>
* YAML-based configuration: <a href="https://github.com/apache/dubbo-go-samples/tree/main/config_yaml" target="_blank">dubbo-go-samples/config_yaml</a>
* Registry-based application: <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>

Current Dubbo Go still separates concepts into application-level configuration and interface-level service references, but the runtime model is broader than the older "application vs interface" explanation. The real source of truth is now the application instance options in `options.go` and the compatibility configuration model in `config/root_config.go`.

## Application-Level Configuration

Application-level configuration is shared by all services and references inside one Dubbo Go process.

In configuration-file mode, that model is represented by `config.RootConfig`:

* `Application`
* `Protocols`
* `Registries`
* `ConfigCenter`
* `MetadataReport`
* `Provider`
* `Consumer`
* `Otel`
* `Metrics`
* `Tracing`
* `Logger`
* `Shutdown`
* `Router`
* `TLSConfig`

In API mode, the same shape appears in `InstanceOptions` from `options.go`, which is filled by helpers such as:

* `dubbo.WithProtocol(...)`
* `dubbo.WithRegistry(...)`
* `dubbo.WithConfigCenter(...)`
* `dubbo.WithMetadataReport(...)`
* `dubbo.WithMetrics(...)`
* `dubbo.WithTracing(...)`
* `dubbo.WithShutdown(...)`
* `dubbo.WithRouter(...)`
* `dubbo.WithRemoteMetadata()`
* `dubbo.WithMetadataServiceProtocol(...)`

These options describe the runtime environment of the whole application, not one single service.

## Interface-Level Configuration

Interface-level configuration is attached to one exposed service or one referenced remote interface.

On the provider side, the main unit is a registered service:

* `server.Register(...)`
* `server.RegisterService(...)`
* `server.ServiceOptions`

This layer carries interface name, implementation handler, protocol IDs, registry IDs, serialization, and service metadata.

On the consumer side, the main unit is a reference:

* generated client stubs with `client.DialWithInfo(...)`
* plain service references with `client.DialWithService(...)`
* generic references with `client.NewGenericService(...)`

This layer carries interface name, URL or registry target, protocol selection, group/version, timeout, and per-reference routing or metadata behavior.

## Why Both Levels Matter

The distinction is especially important in current Dubbo Go because application-level service discovery is now common.

At the application level, Dubbo Go manages:

* application identity
* registry and metadata center integration
* protocol server/client setup
* tracing, metrics, and logging
* router and shutdown policies

At the interface level, Dubbo Go manages:

* which service is exported or referenced
* which method signatures are callable
* per-service protocol and registry binding
* generic or generated invocation behavior

That is why one process can expose multiple services and reference multiple remote services while still sharing the same application identity, registries, protocol servers, and governance settings.

## Provider and Consumer Are Not Separate Applications

A single Dubbo Go process can contain both provider and consumer roles at the same time. In practice:

* one application instance may host multiple services;
* the same application instance may also dial multiple remote services;
* all of them share the same top-level instance options unless overridden at the service or reference layer.

This is the runtime reason behind the directory and package split you see in `server`, `client`, `registry`, `metadata`, and `protocol`.
