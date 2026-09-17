---
description: Dubbo-Go 扩展的导入、配置与使用
title: 扩展配置与使用
linkTitle: 扩展配置
type: docs
weight: 2
---

扩展可以读取 Go 选项或 `dubbogo.yaml` 中的配置，并将 Filter 加入 RPC 调用链。根据扩展生效的位置，选择实例、客户端或服务端入口。

{{% alert title="版本说明" color="primary" %}}
统一 Extension API 已由 [dubbo-go#3687](https://github.com/apache/dubbo-go/pull/3687) 加入内核，目标版本为 3.3.3。当前 Hystrix 包尚未接入该 API（[#3730](https://github.com/apache/dubbo-go/issues/3730)）。下文的 Hystrix `WithConfig` 和 YAML 示例展示目标用法；需要运行示例时，请使用[当前示例工程](https://github.com/apache/dubbo-go-samples/tree/main/filter/hystrix)。
{{% /alert %}}

## 1. 选择扩展的作用域

根据扩展要在哪一侧生效，选择相应的配置入口：

```go
// 应用实例
dubbo.WithExtension(options ...extension.Option)

// 客户端（consumer）
client.WithExtension(options ...extension.Option)

// 服务端（provider）
server.WithExtension(options ...extension.Option)
```

框架根据入口传入 `InstanceScope`、`ClientScope` 或 `ServerScope`，使用者无需额外指定 `role`。这三个入口都接收 `extension.Option`；具体的选项函数由扩展包定义。如果扩展不支持所选作用域，初始化时会返回错误。

## 2. 导入扩展包

导入扩展包会执行其 `init()` 函数，注册扩展配置和底层 Filter。导入方式取决于配置方法。

### 2.1 使用 Go 选项

调用扩展包的选项函数时，使用具名导入。Hystrix 迁移后的导入方式为：

```go
import (
    "github.com/apache/dubbo-go-extensions/filter/hystrix"
)
```

### 2.2 只使用 YAML

如果应用只通过 YAML 配置扩展，不调用该包的 Go 函数，则使用空白导入。Hystrix 接入统一 API 后将使用：

```go
import (
    _ "github.com/apache/dubbo-go-extensions/filter/hystrix"
)
```

扩展的 `Config.Prefix()` 对应 `dubbo.extensions` 下的节点名，它可以与 Go 包名、内部 Filter 名不同。使用者无需指定内部 Filter 名。若当前作用域中启用的扩展未注册，初始化会返回 `extension "<prefix>": config is not registered`。

## 3. 使用 Go 选项配置

扩展可以定义自己的强类型选项，传给客户端、服务端或实例入口。选项的实现示例见[开发自定义扩展](../../../sourcecode/custom_extension/)。Hystrix 计划采用以下客户端配置方式：

```go
client.WithExtension(
    hystrix.WithConfig(
        hystrix.WithCommandName("greet.GreetService:::Greet"),
        hystrix.WithTimeout(1000),
        hystrix.WithMaxConcurrentRequests(10),
    ),
)
```

同一扩展传入多个选项时，框架按书写顺序应用。每个实例、客户端和服务端使用独立配置，相互之间不会覆盖。

## 4. 使用 YAML 配置

在 `dubbo.extensions` 下声明扩展，再通过 `dubbo.Load()` 加载配置文件。以下是 Hystrix 计划支持的 consumer 和 provider 配置：

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

`consumer` 配置用于客户端，`provider` 配置用于服务端。支持 `InstanceScope` 的扩展还可使用 `instance` 节点，示例见[自定义扩展中的 `mycustom` 配置](../../../sourcecode/custom_extension/)。Hystrix 不支持 `InstanceScope`，因此不要在 `hystrix` 下添加 `instance: {}`。

对于 `"greet.GreetService:::Greet"` 这类包含点号和冒号的 command key，建议在 YAML 中加双引号。加载器会将它保留为一个完整的 key。

### 配置优先级

同一配置项存在于多个来源时，后面的来源覆盖前面的来源：

1. 扩展通过 `Config.New()` 提供的默认值；
2. 当前作用域的本地 YAML；
3. 配置中心的远程 YAML，启动时覆盖本地同名配置；
4. Go 强类型选项，按书写顺序应用。

## 5. Hystrix 示例

当前 Hystrix 包需要手动选择 Filter 并配置 `hystrix-go` command。迁移后的用法会通过统一的扩展入口完成这些配置。

### 5.1 当前用法与计划用法

| 对比项 | 当前 Hystrix 包 | #3730 目标方案 |
| :--- | :--- | :--- |
| **API 调用** | 手动调用 `hystrix.ConfigureCommand(...)` | 使用 `client.WithExtension(hystrix.WithConfig(...))` |
| **Filter 配置** | 手动指定 `client.WithFilter("hystrix_consumer")` / `server.WithFilter("hystrix_provider")` | **自动注入**：扩展在对应 Scope 初始化成功后自动合并 Filter |
| **资源名称** | 必须携带 `dubbo:consumer:` 或 `dubbo:provider:` 前缀 | 直接使用接口与方法名（如 `"greet.GreetService:::Greet"`），由扩展自动处理前缀 |
| **YAML 配置** | 无法直接在 `dubbogo.yaml` 中配置熔断规则 | 统一在 `dubbo.extensions.hystrix.consumer/provider` 中声明 |

### 5.2 当前示例

[Hystrix 示例工程](https://github.com/apache/dubbo-go-samples/tree/main/filter/hystrix)包含当前客户端、服务端、proto 与运行说明。其中[客户端](https://github.com/apache/dubbo-go-samples/blob/main/filter/hystrix/go-client/cmd/main.go)调用 `hystrix.ConfigureCommand("dubbo:consumer:greet.GreetService:::Greet", ...)`，并在生成的服务上使用 `client.WithFilter("hystrix_consumer")`。这是当前扩展包的旧 API，并非统一 Extension API。

以下代码使用示例仓库 `main` 分支的 proto 包。在独立 Go 模块中需先执行 `go get github.com/apache/dubbo-go-samples@main`；较早的 `@latest` 标签版本不含该路径。启动示例工程中监听 20000 端口的[服务端](https://github.com/apache/dubbo-go-samples/blob/main/filter/hystrix/go-server/cmd/main.go)后，当前客户端写法为：

```go
package main

import (
	"context"

	"dubbo.apache.org/dubbo-go/v3/client"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	hystrixgo "github.com/afex/hystrix-go/hystrix"
	_ "github.com/apache/dubbo-go-extensions/filter/hystrix"
	greet "github.com/apache/dubbo-go-samples/filter/hystrix/proto"
)

func main() {
	hystrixgo.ConfigureCommand("dubbo:consumer:greet.GreetService:::Greet", hystrixgo.CommandConfig{
		Timeout:                1000,
		MaxConcurrentRequests:  10,
		RequestVolumeThreshold: 5,
		SleepWindow:            5000,
		ErrorPercentThreshold:  50,
	})
	cli, err := client.NewClient(client.WithClientURL("127.0.0.1:20000"))
	if err != nil {
		panic(err)
	}
	svc, err := greet.NewGreetService(cli, client.WithFilter("hystrix_consumer"))
	if err != nil {
		panic(err)
	}
	if _, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "test"}); err != nil {
		panic(err)
	}
}
```

### 5.3 计划中的 API 示例

以下客户端和服务端代码复用上述示例工程生成的 `greet` 包，展示目标 API。**当前 Hystrix 包尚不能编译这些示例。** #3730 完成后，请先核对扩展包发布的最终 API。

#### 客户端

```go
package main

import (
	"context"

	"dubbo.apache.org/dubbo-go/v3"
	"dubbo.apache.org/dubbo-go/v3/client"
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
		// 统一声明 Hystrix 扩展
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

#### 服务端

```go
package main

import (
	"context"

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

#### YAML

扩展注册统一 `Config` 后，应用可空白导入扩展包，并像上述示例工程那样注册服务，再调用 `dubbo.Load()`。下列 YAML 不含 `instance` 节点，因为 Hystrix 不支持 `InstanceScope`：

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
```

## 6. 配置更新

扩展配置在应用启动时加载。本地文件或配置中心的扩展配置发生变化后，都需要重启应用。修改本地文件会收到 `hot reload denied: extension configuration changes require restart` 错误；配置中心的推送事件不会重新初始化扩展。

初始化顺序、Filter 校验和失败回滚的细节见[开发自定义扩展](../../../sourcecode/custom_extension/)。

## 7. 相关参考

* [AOP 与可扩展机制源码设计](../../../sourcecode/aop_and_extension/)
* [开发自定义扩展](../../../sourcecode/custom_extension/)
* [本地配置文件开发应用](../file/)
* [远程配置文件开发应用](../remote/)
* [Filter 拦截器使用指南](../../rpc/filter/)
