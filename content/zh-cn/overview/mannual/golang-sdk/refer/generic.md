---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/concept/generic/
    - /zh-cn/docs3-v2/golang-sdk/preface/concept/generic/
    - /zh-cn/overview/mannual/golang-sdk/preface/concept/generic/
description: 泛化调用
keywords: 泛化调用
title: 泛化调用
type: docs
weight: 2
---

泛化调用是一种 Dubbo-Go 的特殊调用方式，它允许中间节点在没有接口信息的情况下传递调用信息，常被用于测试、网关的场景下。泛化调用支持 Dubbo 和 Triple 协议。通过 `client.NewGenericService` 创建泛化服务时，默认使用 Hessian2 作为传输序列化方案。

## 背景

为了便于理解，这篇文档中以网关使用场景介绍泛化调用。我们先来考虑普通调用（非泛化调用）。下图包含了 consumer 和 provider 两个关键角色（后文中用 endpoint 代表一个 consumer 或一个 provider），各自都有一份关于 org.apache.dubbo.sample.User 接口的定义。假定在调用行为中需要使用 org.apache.dubbo.sample.User 接口。

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1631941941270-86ce9845-5a88-4cb5-8c8a-da8ae7eeb4d5.png)

RPC 需要借助网络介质传输，因此数据不能以 go struct 形式传输，而必须以二进制形式传输。这就要求 consumer 端在传输前，需要将实现 org.apache.dubbo.sample.User 接口的结构体序列化为二进制格式。同样的，对于 provider 端，需要将二进制数据反序列化为结构体信息。**总之，普通调用要求接口信息在每一个 endpoint 必须有相同的定义，这样才能保证数据序列化和反序列化的结果与预期一致**。

在网关场景下，网关不可能存储全部接口定义。比如一个网关需要转发 100 个服务调用，每个服务需要的接口数量为 10 个，普通调用要求把 1000 个（100 * 10）接口定义提前全部存储在网关内，这显然是难以做到的。所以有没有一种方式可以既不需要提前存储接口定义，又能正确转发调用呢？答案是肯定的，这就是使用泛化调用的原因。

## 原理

泛化调用本质上就是把复杂结构转化为通用结构，这里说的通用结构是指 map、string 等，网关是可以顺利解析并传递这些通用结构的。

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1632207075184-25939db4-f384-452e-a0b8-e1deff7971de.png)

Dubbo-go v3 支持多种泛化方式，包括 Map（默认）、Gson、Protobuf-JSON 和 Bean。其中 Map 泛化方式最为常用，下面以此为例进行说明。以 User 接口为例，其定义如下所示。

```go
// definition
type User struct {
	ID   string
	Name string
	Age  int32
}

func (u *User) JavaClassName() string {
	return "org.apache.dubbo.sample.User"
}
```

假定调用一个服务需要一个 user 作为入参，其定义如下所示。

```go
// an instance of the User
user := &User{
    ID:   "1",
    Name: "Zhangsan",
    Age:  20,
}
```

那么在使用 Map 泛化方式下，user 会被自动转换为 Map 格式，如下所示。

```go
usermap := map[interface{}]interface{} {
    "iD": 	 "1",
    "name":  "zhangsan",
    "age": 	 20,
    "class": "org.apache.dubbo.sample.User",
}
```

需要注意的是：

- Map 泛化方式会自动将首字母小写，即 ID 会被转换为 iD，如果需要对齐 Dubbo-Java 请考虑将 ID 改为 Id；
- 如果需要精确控制 Map 中的 key 名称，可以通过 `m` struct tag 显式指定。例如 `` Name string `m:"userName"` `` 会使 key 变为 `userName` 而非默认的 `name`；
- 当结构体实现了 `hessian.POJO` 接口时，泛化结果中会自动插入 `class` 字段，用于标识原有接口类。可通过配置 `generic.include.class=false` 关闭此行为，适用于纯 Go 服务间的泛化调用场景。

## 使用

泛化调用对 provider 端是透明的，即 provider 端不需要任何显式配置就可以正确处理泛化请求。

### 基于 Triple 协议泛化调用

Triple 协议（dubbo3）已支持泛化调用。`NewGenericService` 内部走统一的 dial 流程，既支持通过注册中心发现服务，也支持通过 `client.WithURL` 进行直连调用。完整示例请参见 [dubbo-go-samples/generic](https://github.com/apache/dubbo-go-samples/tree/main/generic)。以下以直连调用为例。

首先创建 dubbo 实例和客户端，然后通过 `cli.NewGenericService` 创建泛化服务，如下所示。

```go
ins, err := dubbo.NewInstance(dubbo.WithName("generic-client"))

cli, err := ins.NewClient(
	client.WithClientProtocolTriple(),
	client.WithClientSerialization(constant.Hessian2Serialization),
)

genericService, err := cli.NewGenericService(
	"org.apache.dubbo.samples.UserProvider",
	client.WithURL("tri://127.0.0.1:50052"),
	client.WithVersion("1.0.0"),
	client.WithGroup("triple"),
)
```

`NewGenericService` 方法接收的参数分别是：

- 服务接口名；
- `client.WithURL`: 直连地址，使用 `tri://` 协议前缀；
- `client.WithVersion`: 服务版本；
- `client.WithGroup`: 服务分组。

接着可以对服务发起泛化调用：

```go
resp, err := genericService.Invoke(
	context.Background(),
	"GetUser1",
	[]string{"java.lang.String"},
	[]hessian.Object{"A003"},
)
```

### 基于 Dubbo URL 泛化调用

基于 Filter 泛化调用对 consumer 是透明的，典型应用场景是网关。这种方式需要要求 Dubbo URL 中包含泛化调用标识，如下所示。

```plain
dubbo://127.0.0.1:20000/org.apache.dubbo.sample.UserProvider?generic=true&...
```

这个 Dubbo URL 表达的语意是：

- RPC 协议为 dubbo；
- org.apache.dubbo.sample.UserProvider 接口位于 127.0.0.1:20000；
- 使用泛化调用（generic=true）。

Consumer 端的 Filter 会自动根据 Dubbo URL 携带的配置将普通调用转化为泛化调用。当 `inv.Reply()` 设置了目标结构体指针时，consumer 侧 Filter 会在 `OnResponse` 阶段自动将 map 结果反序列化为相应的对象；若未设置，则响应结果仍以泛化格式（如 map）返回。

### 手动泛化调用（传统方式）

> 推荐使用上文中 `client.NewGenericService` 的方式进行泛化调用，以下为基于 `config.ReferenceConfig` 的传统方式，仅作参考。

手动泛化调用通过 `config.ReferenceConfig` 构建引用并显式发起泛化调用，典型应用场景是测试。

泛化调用不需要创建配置文件（dubbogo.yaml），但是需要在代码中手动配置注册中心、reference 等信息，初始化方法被封装到 newRefConf 方法中，如下所示。

```go
func newRefConf(appName, iface, protocol string) config.ReferenceConfig {
	registryConfig := &config.RegistryConfig{
		Protocol: "zookeeper",
		Address:  "127.0.0.1:2181",
	}

	refConf := config.ReferenceConfig{
		InterfaceName: iface,
		Cluster:       "failover",
		Registry:      []string{"zk"},
		Protocol:      protocol,
		Generic:       "true",
	}

	rootConfig := config.NewRootConfig(config.WithRootRegistryConfig("zk", registryConfig))
	_ = rootConfig.Init()
	_ = refConf.Init(rootConfig)
	refConf.GenericLoad(appName)

	return refConf
}
```

newRefConf 方法接收三个参数，分别是：

- appName: 应用名；
- iface: 服务接口名；
- protocol: RPC 协议，目前只支持 dubbo 和 tri（triple 协议）。

在上述方法中，为了保持函数简单性，把注册中心设置为一个固定值，即使用在 127.0.0.1:2181 的 ZooKeeper 作为注册中心，在实践中可以根据实际情况自由定制。

我们可以很容易的获取一个 ReferenceConfig 实例，暂时命名为 refConf。

```go
refConf := newRefConf("example.dubbo.io", "org.apache.dubbo.sample.UserProvider", "tri")
```

接着我们可以对 org.apache.dubbo.sample.UserProvider 服务的 GetUser 方法发起泛化调用。

```go
resp, err := refConf.
	GetRPCService().(*generic.GenericService).
	Invoke(
		context.TODO(),
		"GetUser",
		[]string{"java.lang.String"},
		[]hessian.Object{"A003"},
    )
```

GenericService 的 Invoke 方法接收四个参数，分别是：

- context；
- 方法名: 在这个例子中表示调用 GetUser 方法；
- 参数类型: GetUser 方法接收一个 string 类型的参数，如果目标方法接收多个参数，可以写为 `[]string{"type1", "type2", ...}`，如果目前方法是无参的，则需要填入一个空数组 `[]string{}`；
- 实参: 写法同参数类型，如果是无参函数，依然要填入一个空数组 `[]hessian.Object{}` 占位。

### 泛化调用获取结果自动反序列化

在 `Invoke` 方法中，返回值 `resp` 是一个 `map` 类型（对于 `MapGeneralizer`），用户需要手动进行类型转换。为了简化这一过程，dubbo-go 提供了 `InvokeWithType` 方法，可以将结果自动反序列化为用户指定的结构体。

以下示例基于 `client.NewGenericService` 方式：

```go
// 定义结果结构体
type User struct {
    ID   string
    Name string
    Age  int32
}

var user User
// 直接将结果反序列化到 user 结构体中
err := genericService.InvokeWithType(
    context.Background(),
    "GetUser1",
    []string{"java.lang.String"},
    []hessian.Object{"A003"},
    &user,
)

if err != nil {
    // 处理错误
}
fmt.Println(user.Name)
```

如果使用传统的 `config.ReferenceConfig` 方式，调用方式如下：

```go
var user User
err := refConf.
    GetRPCService().(*generic.GenericService).
    InvokeWithType(
        context.TODO(),
        "GetUser",
        []string{"java.lang.String"},
        []hessian.Object{"A003"},
        &user,
    )

if err != nil {
    // 处理错误
}
fmt.Println(user.Name)
```

注意：`InvokeWithType` 目前仅支持默认的 Map 泛化方式。

## 泛化方式选择

Dubbo-go 支持以下四种泛化方式，通过 `generic` 参数值区分：

| 泛化方式 | 参数值 | 泛化格式 | 适用场景 |
|---------|-------|---------|---------|
| Map（默认） | `true` | `map[string]any` | 通用场景，Go 与 Java 互通 |
| Gson | `gson` | JSON 字符串 | 需要 JSON 格式交互的场景 |
| Protobuf-JSON | `protobuf-json` | JSON 字符串 | Protobuf 消息的泛化调用 |
| Bean | `bean` | `JavaBeanDescriptor` | 与 Java Bean 序列化对齐 |

使用 `client.NewGenericService` 时默认采用 Map 泛化方式。如需使用其他方式，可在 `ReferenceConfig` 中将 `Generic` 字段设置为对应的参数值。

在大多数场景下，推荐使用默认的 Map 泛化方式。

## 跨语言 RPC 接口定义建议

在泛化调用或跨语言调用场景下，Go 的 variadic 方法签名（例如 `args ...string`）容易引入额外的接口定义歧义。
现有 variadic 服务仍保持兼容，但对于新的跨语言服务或需要面向泛化调用的服务，不建议继续将 `...T` 作为 RPC 接口定义的一部分。

这是因为 variadic 参数在 Go 中具有特殊语义，而在跨语言调用、动态参数组装、泛化调用和序列化过程中，通常只能被表示为普通数组或列表。
这会增加调用侧与服务侧对参数形态理解不一致的风险。

### 推荐模式

对于新的服务接口定义，建议优先采用以下方式：

- 对于“多个同类型参数”的场景，使用 `[]T` 替代 `...T`
- 对于参数可能继续演进的场景，使用 request/response struct
- 对于新的跨语言服务，优先使用 Triple + Protobuf IDL，并通过 `repeated` 字段表达重复参数

### 迁移示例

不建议在新的跨语言接口定义中继续使用：

```go
func MultiArgs(ctx context.Context, args ...string) error
```

更推荐使用切片参数：

```go
func MultiArgs(ctx context.Context, args []string) error
```

如果接口后续还可能继续扩展，建议使用请求对象：

```go
type MultiArgsRequest struct {
    Args []string
}

func MultiArgs(ctx context.Context, req *MultiArgsRequest) error
```

对于新的 Triple + Protobuf 服务，可以使用 `repeated` 字段表达同类输入：

```proto
message MultiArgsRequest {
  repeated string args = 1;
}
```

### 边界说明

现有 variadic 服务仍保持兼容，这里的建议主要面向新的服务接口定义设计。
如果服务需要面向跨语言消费者、网关转发或泛化调用，建议尽量避免将 variadic 参数作为公开 RPC 接口定义的一部分。

通常情况下，业务输入应尽量显式建模为结构化字段；非业务上下文信息应通过 attachments 或 IDL metadata 传递，而不是依赖 variadic 参数表达。

相关阅读：[【Dubbo-go 服务代理模型】](https://blog.csdn.net/weixin_39860915/article/details/122738548)
