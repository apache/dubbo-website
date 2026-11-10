---
description: 开发可配置的 Dubbo-Go 扩展
title: 开发自定义扩展
type: docs
weight: 10
---

本文通过示例介绍如何为扩展添加独立配置、Go 选项和 Filter。示例使用 [dubbo-go#3687](https://github.com/apache/dubbo-go/pull/3687) 加入的 Extension API。

## 扩展接口

`common/extension/config.go` 中的 `extension.Config` 接口定义了扩展如何接收配置并完成初始化：

```go
// Scope 标识扩展所处的生命周期
type Scope uint8

const (
	InstanceScope Scope = iota + 1 // dubbo.Instance 级别生命周期
	ClientScope                    // Client/Consumer 级别生命周期
	ServerScope                    // Server/Provider 级别生命周期
)

// Config 是外部扩展需要实现的配置与初始化契约
type Config interface {
	Prefix() string
	New() Config
	Init(scope Scope) error
	FilterNames(scope Scope) []string
}

// Option 为扩展提供类型安全的配置选项
type Option interface {
	Prefix() string
	Apply(config Config) error
}
```

* `Prefix()` 是注册名，也是 `dubbo.extensions` 下的配置键，可以与 Go 包名、Filter 名不同。
* `New()` 创建带默认值的独立配置。
* `Init(scope)` 初始化扩展，并检查是否支持该作用域。
* `FilterNames(scope)` 返回加入客户端或服务端调用链的 Filter 名称；`InstanceScope` 会跳过这一步。

## 开发自定义扩展

下面逐步实现扩展的配置、Filter 和 Go 选项。

### 步骤一：实现 Filter 拦截逻辑

```go
package customext

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3/protocol/base"
	"dubbo.apache.org/dubbo-go/v3/protocol/result"
)

type customFilter struct{}

func (f *customFilter) Invoke(ctx context.Context, invoker base.Invoker, inv base.Invocation) result.Result {
	// 执行拦截逻辑
	return invoker.Invoke(ctx, inv)
}

func (f *customFilter) OnResponse(ctx context.Context, res result.Result, invoker base.Invoker, inv base.Invocation) result.Result {
	return res
}
```

### 步骤二与三：注册 Filter 并定义配置结构

在 `init()` 中注册 Filter 和配置。结构体字段使用 `yaml` 标签，随服务变化的命令名使用 `yaml:",remain"`：

```go
package customext

import (
	"errors"
	"dubbo.apache.org/dubbo-go/v3/common/extension"
	"dubbo.apache.org/dubbo-go/v3/filter"
)

const (
	ExtensionPrefix = "mycustom"
	internalFilterName = "mycustom_internal_filter"
)

func init() {
	// 1. 注册底层 Filter 工厂（必须步骤，供后续 FilterNames 校验）
	extension.SetFilter(internalFilterName, func() filter.Filter {
		return &customFilter{}
	})

	// 2. 注册 Extension Config 原型
	extension.MustRegisterConfig(&CustomConfig{})
}

type CustomConfig struct {
	Timeout  int                       `yaml:"timeout"`
	Commands map[string]CommandConfig  `yaml:",remain"`
}

type CommandConfig struct {
	MaxConcurrent int `yaml:"max-concurrent"`
}
```

`RegisterConfig` 和 `MustRegisterConfig` 注册的是同一种 `Config` 原型。前者遇到非法前缀、重复注册或无效原型时返回错误；后者遇错会 panic，因此适合扩展包在 `init()` 中通过导入副作用完成注册。

### 步骤四：实现 `extension.Config`

```go
func (c *CustomConfig) Prefix() string {
	return ExtensionPrefix
}

// New 返回包含默认值的全新独立配置副本
func (c *CustomConfig) New() extension.Config {
	return &CustomConfig{
		Timeout:  1000,
		Commands: make(map[string]CommandConfig),
	}
}

// Init 处理生命周期初始化与 Scope 校验
func (c *CustomConfig) Init(scope extension.Scope) error {
	switch scope {
	case extension.InstanceScope, extension.ClientScope, extension.ServerScope:
		// 初始化当前生命周期所需资源
		return nil
	default:
		return errors.New("invalid scope")
	}
}

// FilterNames 返回关联的 Filter（框架会严格通过 HasFilter 检查 Filter 是否已注册）
func (c *CustomConfig) FilterNames(scope extension.Scope) []string {
	if scope == extension.ClientScope || scope == extension.ServerScope {
		return []string{internalFilterName}
	}
	return nil
}
```

{{% alert title="提示" color="primary" %}}
启动时，框架会检查 `FilterNames` 返回的名称是否已注册。若名称不存在，初始化会失败。
{{% /alert %}}

### 步骤五：添加 Go 选项

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

// WithTimeout 提供面向业务开发者的 Typed Option
func WithTimeout(timeout int) extension.Option {
	return customOption{
		fn: func(c *CustomConfig) error {
			c.Timeout = timeout
			return nil
		},
	}
}
```

应用中按所需作用域选择入口，并按[配置教程](../../tutorial/configuration/extension/)处理返回的错误：

```go
// InstanceScope（应用实例级）
dubbo.NewInstance(dubbo.WithExtension(customext.WithTimeout(1000)))

// ClientScope（客户端 / consumer 级）
ins.NewClient(client.WithExtension(customext.WithTimeout(800)))

// ServerScope（服务端 / provider 级）
ins.NewServer(server.WithExtension(customext.WithTimeout(1200)))
```

同一个扩展是否支持上述入口由其 `Init(scope)` 的实现决定。如果扩展不支持某个作用域，应在 `Init(scope)` 中返回错误，框架在初始化时会中断并报错。本例支持全部三个作用域。使用 YAML 时，先导入 `customext` 包（不调用 Go 选项时可以空白导入），再加载：

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

加载器会根据生命周期选择 `instance`、`consumer` 或 `provider`，再按 `yaml` 标签解码字段。`WithTimeout(...)` 会覆盖所选 YAML 中的 `timeout`。

## 初始化与校验

创建 Client 或 Server 时，Dubbo-Go 会先准备并校验所有扩展，再调用 `Init(scope)`：

```
收集当前生命周期激活的扩展
          ↓
按 prefix 字母序排序
          ↓
【阶段一：准备与校验】
对所有扩展执行：
Config.New() 获取独立实例
  → 解码并填充 YAML 配置（支持配置中心远程覆盖）
  → 按源码声明顺序应用同一扩展的 Typed Option
  → 调用 FilterNames(scope)（InstanceScope 跳过）并校验 Filter 是否已注册
          ↓
全部扩展准备并校验成功
          ↓
【阶段二：逐个初始化】
按 prefix 排序逐个调用各扩展的 Init(scope)
```

如果配置解析失败或 Filter 未注册，初始化会在任何扩展执行 `Init(scope)` 前停止。

## 初始化失败回滚

如果 `Init(scope)` 会申请资源，扩展可以实现 `extension.Rollbacker`，以便在初始化失败后释放资源：

```go
type Rollbacker interface {
	Rollback(scope Scope) error
}
```

如果某个扩展在 `Init(scope)` 中失败，框架会对该扩展及之前已初始化的扩展逆序调用 `Rollback(scope)`。

应用中通过 YAML 或 Go 选项配置扩展的方法，见[扩展配置与使用](../../tutorial/configuration/extension/)。
