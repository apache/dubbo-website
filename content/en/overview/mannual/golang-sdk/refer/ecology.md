---
aliases:
    - /en/docs3-v2/golang-sdk/refer/ecology/
    - /en/docs3-v2/golang-sdk/refer/ecology/
description: Current Dubbo Go ecosystem repositories and tooling
title: Ecosystem Components
type: docs
weight: 1
---

Related repositories and samples:

* Main runtime: [apache/dubbo-go](https://github.com/apache/dubbo-go)
* Samples: [apache/dubbo-go-samples](https://github.com/apache/dubbo-go-samples)
* Generic invocation sample: [dubbo-go-samples/generic](https://github.com/apache/dubbo-go-samples/tree/main/generic)
* Nacos registry sample: [dubbo-go-samples/registry/nacos](https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos)
* Triple sample: [dubbo-go-samples/rpc/triple](https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple)

This page gives a current map of the main Dubbo Go ecosystem repositories. Some older documents still refer to repositories or tools under `dubbogo/*`; for daily development, use the Apache repositories below as the primary entry points.

## dubbo-go

[github.com/apache/dubbo-go](https://github.com/apache/dubbo-go)

The main Dubbo Go runtime repository. It includes:

* core runtime code
* built-in protocols, registries, filters, routers, and load balancers
* tools such as `tools/protoc-gen-go-triple`
* tools such as `tools/dubbogo-cli`

## dubbo-go-samples

[github.com/apache/dubbo-go-samples](https://github.com/apache/dubbo-go-samples)

This is the best place to look for runnable examples. Useful directories include:

* `helloworld`
* `config_yaml`
* `generic`
* `registry/nacos`, `registry/zookeeper`, `registry/etcd`, `registry/polaris`
* `rpc/triple`, `rpc/multi-protocols`, `rpc/grpc`
* `filter/custom`, `filter/token`, `filter/sentinel`
* `router/condition`, `router/tag`, `router/script`, `router/static_config`
* `mesh`
* `java_interop/*`
* `triple_header_trailer`

## protoc-gen-go-triple

[apache/dubbo-go/tools/protoc-gen-go-triple](https://github.com/apache/dubbo-go/tree/main/tools/protoc-gen-go-triple)

The protobuf code generation plugin for Dubbo Go Triple services. New documentation should point to this location instead of the older standalone tool repositories.

## dubbogo-cli

[apache/dubbo-go/tools/dubbogo-cli](https://github.com/apache/dubbo-go/tree/main/tools/dubbogo-cli)

Command-line helper tool for Dubbo/Dubbo Go debugging and interoperability scenarios. It now lives inside the main `apache/dubbo-go` repository.

## dubbo-go-hessian2

[github.com/apache/dubbo-go-hessian2](https://github.com/apache/dubbo-go-hessian2)

The Hessian2 serialization library used by Dubbo Go, especially in Dubbo protocol and generic invocation interoperability scenarios.

## dubbo-getty

[github.com/apache/dubbo-getty](https://github.com/apache/dubbo-getty)

An asynchronous network IO library used in parts of the Dubbo Go ecosystem.

## Notes on Older Repositories

Older articles may still mention:

* non-Apache historical tool repositories
* older standalone Triple codegen tool repos
* older CLI installation instructions

For current Dubbo Go development, prefer the Apache repositories and the `tools/` directories inside `apache/dubbo-go`.
