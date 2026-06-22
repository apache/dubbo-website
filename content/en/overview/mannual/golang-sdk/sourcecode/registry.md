---
aliases:
    - /en/docs3-v2/golang-sdk/sourcecode/registry/
    - /en/overview/mannual/golang-sdk/refer/sourcecode/registry/
description: Current registry and service discovery source code overview
title: Registry
type: docs
weight: 1
---

Related samples:

* Nacos registry: <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>
* Zookeeper registry: <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/zookeeper" target="_blank">dubbo-go-samples/registry/zookeeper</a>
* Application-level service discovery: <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>

Related documentation:

* [Application-level Service Discovery](/en/overview/mannual/golang-sdk/tutorial/service-discovery/application-level-service-discovery/)

In current Dubbo Go, the registry layer is not only about interface-level address registration. It also participates in application-level service discovery, metadata bootstrap, subscription refresh, and registry-backed protocol export.

## Core Registry Interface

The main interface is defined in `registry/registry.go`:

```go
type Registry interface {
	common.Node
	Register(url *common.URL) error
	UnRegister(url *common.URL) error
	Subscribe(*common.URL, NotifyListener) error
	UnSubscribe(*common.URL, NotifyListener) error
	LoadSubscribeInstances(*common.URL, NotifyListener) error
}
```

Compared with older explanations, `LoadSubscribeInstances(...)` is now part of the contract. It exists because subscription is asynchronous, and Dubbo Go may need an initial synchronous load before the normal subscription stream catches up.

## Current Responsibilities

The registry layer now covers several related responsibilities:

* provider registration and unregister
* consumer subscription and unsubscribe
* initial instance loading before async updates
* application-level service discovery
* registry-backed metadata report integration

In source layout, the main related packages are:

* `registry`
* `registry/protocol`
* `registry/servicediscovery`
* `registry/directory`

## Registration Modes

Current Dubbo Go supports multiple registration models through `registry/options.go`:

* `registry.WithRegisterService()`
* `registry.WithRegisterInterface()`
* `registry.WithRegisterServiceAndInterface()`

These correspond to:

* `service`: register application-level instances
* `interface`: register interface-level provider URLs
* `all`: register both during migration

This is one of the biggest differences from older Dubbo Go documentation, which mostly described only interface-level registration.

## Provider and Consumer Flow

At a high level:

1. A provider exports a service through `server` and `protocol`.
2. If registry integration is enabled, `registry/protocol` coordinates registration and metadata reporting.
3. A consumer references a service through a registry URL or registry config.
4. `registry/directory` receives address updates and maintains the effective provider list.
5. Routers, load balancers, and cluster logic consume that list during invocation.

With application-level discovery, the consumer may first resolve service-to-application mapping and then recover concrete callable endpoints through metadata.

## Built-In Registries and Extension Loading

Built-in implementations are registered through package initialization:

* `registry/nacos`
* `registry/zookeeper`
* `registry/etcdv3`
* `registry/polaris`
* `registry/servicediscovery`

They are exposed through `common/extension.SetRegistry(...)` and commonly loaded through:

```go
import _ "dubbo.apache.org/dubbo-go/v3/imports"
```

## Registry Configuration Shape

In API mode, registries are configured with:

* `dubbo.WithRegistry(...)` at instance level
* `client.WithRegistry(...)` or `client.WithRegistryIDs(...)` on references
* `server.WithRegistry(...)` or `server.WithRegistryIDs(...)` on services

In configuration-file mode, registries live under `RootConfig.Registries`.

That split explains why the registry layer appears both as a top-level application concern and as a per-service or per-reference selector.
