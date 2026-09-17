---
description: Implement a configurable Dubbo-Go extension
title: Developing a Custom Extension
type: docs
weight: 10
---

This example shows how to give an extension its own configuration, Go options, and filter. It uses the Extension API added in [dubbo-go#3687](https://github.com/apache/dubbo-go/pull/3687).

## Extension Interface

The `extension.Config` interface in `common/extension/config.go` defines how an extension receives configuration and initializes:

```go
// Scope identifies the lifecycle in which an extension is initialized
type Scope uint8

const (
	InstanceScope Scope = iota + 1 // Lifecycle of dubbo.Instance
	ClientScope                    // Lifecycle of Client/Consumer
	ServerScope                    // Lifecycle of Server/Provider
)

// Config is the configuration and initialization contract for external extensions
type Config interface {
	Prefix() string
	New() Config
	Init(scope Scope) error
	FilterNames(scope Scope) []string
}

// Option applies typed configuration to one extension
type Option interface {
	Prefix() string
	Apply(config Config) error
}
```

* `Prefix()` is the registration key and the key under `dubbo.extensions`. It can differ from the Go package and filter names.
* `New()` creates a separate configuration with default values.
* `Init(scope)` initializes the extension and checks whether it supports the scope.
* `FilterNames(scope)` returns filters to add to the Client or Server call chain. It is skipped for `InstanceScope`.

## Build a Custom Extension

The following steps build an extension with configuration, a filter, and Go options.

### Step 1: Implement the Filter Logic

```go
package customext

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3/protocol/base"
	"dubbo.apache.org/dubbo-go/v3/protocol/result"
)

type customFilter struct{}

func (f *customFilter) Invoke(ctx context.Context, invoker base.Invoker, inv base.Invocation) result.Result {
	// Execute interception logic
	return invoker.Invoke(ctx, inv)
}

func (f *customFilter) OnResponse(ctx context.Context, res result.Result, invoker base.Invoker, inv base.Invocation) result.Result {
	return res
}
```

### Steps 2 and 3: Register the Filter and Define Configuration

Register the filter and configuration in `init()`. Use `yaml` tags for fields and `yaml:",remain"` for command names that vary by service:

```go
package customext

import (
	"errors"
	"dubbo.apache.org/dubbo-go/v3/common/extension"
	"dubbo.apache.org/dubbo-go/v3/filter"
)

const (
	ExtensionPrefix    = "mycustom"
	internalFilterName = "mycustom_internal_filter"
)

func init() {
	// 1. Register underlying filter factory (required for subsequent FilterNames validation)
	extension.SetFilter(internalFilterName, func() filter.Filter {
		return &customFilter{}
	})

	// 2. Register Extension Config prototype
	extension.MustRegisterConfig(&CustomConfig{})
}

type CustomConfig struct {
	Timeout  int                      `yaml:"timeout"`
	Commands map[string]CommandConfig `yaml:",remain"`
}

type CommandConfig struct {
	MaxConcurrent int `yaml:"max-concurrent"`
}
```

### Step 4: Implement `extension.Config`

```go
func (c *CustomConfig) Prefix() string {
	return ExtensionPrefix
}

// New returns a fresh independent configuration instance with defaults
func (c *CustomConfig) New() extension.Config {
	return &CustomConfig{
		Timeout:  1000,
		Commands: make(map[string]CommandConfig),
	}
}

// Init handles lifecycle initialization and scope validation
func (c *CustomConfig) Init(scope extension.Scope) error {
	switch scope {
	case extension.InstanceScope, extension.ClientScope, extension.ServerScope:
		// Initialize resources for the selected lifecycle
		return nil
	default:
		return errors.New("invalid scope")
	}
}

// FilterNames returns registered filter names (validated strictly via HasFilter)
func (c *CustomConfig) FilterNames(scope extension.Scope) []string {
	if scope == extension.ClientScope || scope == extension.ServerScope {
		return []string{internalFilterName}
	}
	return nil
}
```

{{% alert title="Note" color="primary" %}}
At startup, the framework checks that every name returned by `FilterNames` is registered. An unknown name causes initialization to fail.
{{% /alert %}}

### Step 5: Add Go Options

```go
type customOption struct {
	fn func(*CustomConfig) error
}

func (o customOption) Prefix() string {
	return ExtensionPrefix
}

func (o customOption) Apply(cfg extension.Config) error {
	return o.fn(cfg.(*CustomConfig))
}

// WithTimeout provides a typed option for business developers
func WithTimeout(timeout int) extension.Option {
	return customOption{
		fn: func(c *CustomConfig) error {
			c.Timeout = timeout
			return nil
		},
	}
}
```

This example supports all three scopes. For an unsupported scope, return an error from `Init(scope)`. To use YAML, import the `customext` package (a blank import is enough when no Go options are called) and load:

```yaml
dubbo:
  extensions:
    mycustom:
      instance:
        timeout: 1000
      consumer:
        timeout: 800
        "greet.GreetService:::Greet":
          max-concurrent: 10
      provider:
        timeout: 1200
```

The loader selects `instance`, `consumer`, or `provider` for the corresponding lifecycle before decoding the `yaml` tagged fields. Typed `WithTimeout(...)` options override the selected YAML value.

## Initialization and Validation

When creating a Client or Server, Dubbo-Go prepares and validates all extensions before calling `Init(scope)`:

```
Collect active extensions for the current scope
                    ↓
Sort by prefix alphabetically
                    ↓
[Phase 1: Preparation and Validation]
For all extensions:
Config.New() gets independent instance
  → Decode and populate YAML configuration (including config center overrides)
  → Apply typed options in declaration order for each extension
  → Call FilterNames(scope) (skipped for InstanceScope) and validate registration
                    ↓
All extensions prepared and validated successfully
                    ↓
[Phase 2: Sequential Initialization]
Call Init(scope) on each extension in sorted prefix order
```

If configuration decoding fails or a filter is unregistered, initialization stops before any extension's `Init(scope)` runs.

## Initialization Failure Rollback

If `Init(scope)` acquires resources, the extension can implement `extension.Rollbacker` to release them after an initialization failure:

```go
type Rollbacker interface {
	Rollback(scope Scope) error
}
```

If an extension fails during `Init(scope)`, the framework calls `Rollback(scope)` on that extension and previously initialized extensions in reverse order.

For instructions on configuring extensions via YAML or APIs in application code, see the [Extension Configuration and Usage Guide](../../tutorial/configuration/extension/).
