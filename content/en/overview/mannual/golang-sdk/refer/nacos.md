---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
description: Using Nacos as a registry in current Dubbo Go
title: Using Nacos as a Registry
type: docs
weight: 10
---

Related samples:

* Nacos registry sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>
* Application-level discovery reference: <a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>

See also:

* [Application-level Service Discovery](/en/overview/mannual/golang-sdk/tutorial/service-discovery/application-level-service-discovery/)
* [Tools: dubbogo-cli](/en/overview/mannual/golang-sdk/tools/dubbogo-cli/)

This page is a current reference for using Nacos as a registry with Dubbo Go. Older versions of this page described a CLI debugging flow; that content is no longer the main Nacos integration path.

## What the Nacos Sample Demonstrates

The current `registry/nacos` sample shows:

* provider registration into Nacos
* consumer lookup through Nacos
* Triple-based RPC call flow
* registry-backed service discovery for Go applications

The sample includes:

* `go-server/cmd/server.go`
* `go-client/cmd/client.go`
* `proto/greet.proto`

## Start Nacos

First start a Nacos server and make sure it is reachable from your Dubbo Go applications. The sample README uses the standard Nacos server and default web console.

## Run the Provider

From the sample:

```bash
go run ./go-server/cmd/server.go
```

The provider exports the service and registers it into Nacos.

You can verify the service is up by sending an HTTP request to the sample service endpoint:

```bash
curl \
  --header "Content-Type: application/json" \
  --data '{"name": "Dubbo"}' \
  http://localhost:20000/greet.GreetService/Greet
```

## Run the Consumer

Then run:

```bash
go run ./go-client/cmd/client.go
```

The consumer resolves the target service through Nacos and performs the RPC call.

## Configuration Shape

In current Dubbo Go, Nacos can appear in several related places:

* instance-level setup with `dubbo.WithRegistry(registry.WithNacos(), ...)`
* reference-level setup with `client.WithRegistry(...)` or `client.WithRegistryIDs(...)`
* service-level setup with `server.WithRegistry(...)` or `server.WithRegistryIDs(...)`
* configuration-file setup under `registries`

Useful registry options come from `registry/options.go`, including:

* `registry.WithNacos()`
* `registry.WithAddress(...)`
* `registry.WithGroup(...)`
* `registry.WithNamespace(...)`
* `registry.WithRegisterService()`
* `registry.WithRegisterInterface()`
* `registry.WithRegisterServiceAndInterface()`

## Application-Level Discovery

For current Dubbo Go deployments, Nacos is commonly used together with application-level service discovery. In that model:

* providers register application instances and metadata;
* consumers resolve service-to-application mapping;
* metadata is used to recover callable service endpoints.

If you are deciding between old interface-level registration and current defaults, start from the application-level service discovery page linked above.

## About dubbogo-cli

`dubbogo-cli` can still be useful for debugging and interoperability workflows, but it is no longer the primary content of the Nacos registry page. If you need the CLI, install it from:

* [apache/dubbo-go/tools/dubbogo-cli](https://github.com/apache/dubbo-go/tree/main/tools/dubbogo-cli)

and read the dedicated tools page.
