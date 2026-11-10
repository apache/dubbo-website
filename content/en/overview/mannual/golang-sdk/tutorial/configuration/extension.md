---
description: Guide to using and configuring the unified Extension mechanism in Dubbo-Go
title: Extension Configuration and Usage
linkTitle: Extension Configuration
type: docs
weight: 2
---

An extension can read settings from Go options or `dubbogo.yaml` and add filters to an RPC call chain. Use the Instance, Client, or Server entry point according to where the extension should run.

{{% alert title="Version notice" color="primary" %}}
The unified Extension API was added in [dubbo-go#3687](https://github.com/apache/dubbo-go/pull/3687) and is targeted for Dubbo-Go 3.3.3.
{{% /alert %}}

## 1. Choose an Extension Scope

Choose the option for the part of the application that needs the extension:

```go
// Application instance
dubbo.WithExtension(options ...extension.Option)

// Client (consumer)
client.WithExtension(options ...extension.Option)

// Server (provider)
server.WithExtension(options ...extension.Option)
```

The framework supplies `InstanceScope`, `ClientScope`, or `ServerScope` from the chosen entry point, so there is no `role` argument to pass. Each entry point accepts `extension.Option`; the extension package defines its own option functions. An extension returns an error during initialization if it does not support the selected scope.

## 2. Import the Extension Package

Importing the package runs its `init()` function, which registers the extension configuration and any filters. The import form depends on how you configure it.

### 2.1 Use Go Options

Use a named import when calling option functions from the extension package. For example, using Hystrix:

```go
import (
    "github.com/apache/dubbo-go-extensions/filter/hystrix"
)
```

### 2.2 Use YAML Only

Use a blank import if the application configures an extension only in YAML and does not call its Go functions:

```go
import (
    _ "github.com/apache/dubbo-go-extensions/filter/hystrix"
)
```

The extension's `Config.Prefix()` is the key under `dubbo.extensions`. It may differ from the Go package name and the internal filter name. Users do not need to specify the filter name. If a configured extension is not registered, initialization returns `extension "<prefix>": config is not registered`.

## 3. Configure with Go Options

Each extension defines its own typed options. Pass them to the Client, Server, or Instance entry point. See [Developing a Custom Extension](../../../sourcecode/custom_extension/) for an option implementation. For example, configuring Hystrix on the client:

```go
client.WithExtension(
    hystrix.WithConfig(
        hystrix.WithCommandName("greet.GreetService:::Greet"),
        hystrix.WithTimeout(1000),
        hystrix.WithMaxConcurrentRequests(10),
    ),
)
```

If you pass several options for the same extension, they apply in the order written. Each Instance, Client, and Server receives its own configuration; changing one does not change the others.

## 4. Configure with YAML

Add the extension below `dubbo.extensions` and load the file with `dubbo.Load()`. This example shows the Hystrix configuration for consumers and providers:

```yaml
dubbo:
  extensions:
    hystrix:
      consumer:
        "greet.GreetService:::Greet":
          timeout: 1000
          max-concurrent-requests: 10
          request-volume-threshold: 5
          sleep-window: 5000
          error-percent-threshold: 50
      provider:
        "greet.GreetService:::Greet":
          timeout: 2000
          max-concurrent-requests: 20
```

The `consumer` block applies to clients and `provider` applies to servers. Extensions that support `InstanceScope` can also use an `instance` block; see the [`mycustom` example](../../../sourcecode/custom_extension/). Hystrix does not support `InstanceScope`, so do not add `instance: {}` under `hystrix`.

Quote command keys such as `"greet.GreetService:::Greet"` in YAML. The loader keeps the dots and colons in a single key.

### Configuration Precedence

For the same setting, later sources take precedence:

1. Defaults supplied by the extension's `Config.New()`.
2. Local YAML for the selected scope.
3. Remote YAML from the config center, which overrides matching local values at startup.
4. Typed Go options, applied in the order written.

## 5. Hystrix Example

The following example shows how to configure and use the Hystrix circuit breaker extension using the unified Extension API. The client and server snippets import the generated `greet` package from the [Hystrix sample's proto directory](https://github.com/apache/dubbo-go-samples/tree/main/filter/hystrix/proto). In a separate Go module, fetch that package with `go get github.com/apache/dubbo-go-samples@main`.

### 5.1 Client

```go
package main

import (
	"context"

	"dubbo.apache.org/dubbo-go/v3"
	"dubbo.apache.org/dubbo-go/v3/client"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"github.com/apache/dubbo-go-extensions/filter/hystrix"
	greet "github.com/apache/dubbo-go-samples/filter/hystrix/proto"
)

func main() {
	ins, err := dubbo.NewInstance()
	if err != nil {
		panic(err)
	}

	cli, err := ins.NewClient(
		client.WithClientURL("tri://127.0.0.1:20000"),
		// Declare Hystrix extension
		client.WithExtension(
			hystrix.WithConfig(
				hystrix.WithCommandName("greet.GreetService:::Greet"),
				hystrix.WithTimeout(1000),
				hystrix.WithMaxConcurrentRequests(10),
			),
		),
	)
	if err != nil {
		panic(err)
	}
	svc, err := greet.NewGreetService(cli)
	if err != nil {
		panic(err)
	}
	if _, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "test"}); err != nil {
		panic(err)
	}
}
```

### 5.2 Server

```go
package main

import (
	"context"

	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/protocol"
	"dubbo.apache.org/dubbo-go/v3/server"
	"github.com/apache/dubbo-go-extensions/filter/hystrix"
	greet "github.com/apache/dubbo-go-samples/filter/hystrix/proto"
)

type greetServer struct{}

func (*greetServer) Greet(_ context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	return &greet.GreetResponse{Greeting: "Hello, " + req.Name}, nil
}

func main() {
	srv, err := server.NewServer(
		server.WithServerProtocol(protocol.WithPort(20000), protocol.WithTriple()),
		server.WithExtension(hystrix.WithConfig(
			hystrix.WithCommandName("greet.GreetService:::Greet"),
			hystrix.WithTimeout(1000),
			hystrix.WithMaxConcurrentRequests(10),
		)),
	)
	if err != nil {
		panic(err)
	}
	if err := greet.RegisterGreetServiceHandler(srv, &greetServer{}); err != nil {
		panic(err)
	}
	if err := srv.Serve(); err != nil {
		panic(err)
	}
}
```

### 5.3 YAML

When configuring extensions with YAML, the application can blank-import the extension package (`_ "github.com/apache/dubbo-go-extensions/filter/hystrix"`) to register the configuration and filters, then call `dubbo.Load()`. The following YAML has no `instance` block because Hystrix does not support `InstanceScope`:

```yaml
dubbo:
  extensions:
    hystrix:
      consumer:
        "greet.GreetService:::Greet":
          timeout: 1000
          max-concurrent-requests: 10
          request-volume-threshold: 5
          sleep-window: 5000
          error-percent-threshold: 50
      provider:
        "greet.GreetService:::Greet":
          timeout: 1000
          max-concurrent-requests: 10
          request-volume-threshold: 5
          sleep-window: 5000
          error-percent-threshold: 50
```

## 6. Configuration Changes

Extension settings are loaded when the application starts. Changes to local or config-center extension settings require a restart. The local file watcher rejects such changes with `hot reload denied: extension configuration changes require restart`; config-center push events do not reinitialize extensions.

For the initialization sequence, filter validation, and rollback behavior, see [Developing a Custom Extension](../../../sourcecode/custom_extension/).

## 7. See Also

* [AOP and Extension Mechanism Source Design](../../../sourcecode/aop_and_extension/)
* [Developing a Custom Extension](../../../sourcecode/custom_extension/)
* [Local Configuration File Tutorial](../file/)
* [Remote Configuration File Tutorial](../remote/)
* [Filter Interceptor Guide](../../rpc/filter/)
