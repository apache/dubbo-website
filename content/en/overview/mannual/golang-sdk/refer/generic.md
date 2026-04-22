---
aliases:
    - /en/docs3-v2/golang-sdk/preface/concept/generic/
    - /en/docs3-v2/golang-sdk/preface/concept/generic/
    - /en/overview/mannual/golang-sdk/preface/concept/generic/
description: Generic Invocation
keywords: Generic Invocation
title: Generic Invocation
type: docs
weight: 2
---

Generic invocation is a special way of calling in Dubbo-Go that allows intermediary nodes to pass call information without interface information, commonly used in testing and gateway scenarios. Generic invocation supports both Dubbo and Triple protocols. When creating a generic service via `client.NewGenericService`, Hessian2 is used as the default transport serialization.

## Background

For better understanding, this document introduces generic invocation with a gateway usage scenario. Let's first consider a normal invocation (non-generic invocation). The diagram below includes two key roles: consumer and provider (hereinafter referred to as endpoint, representing either a consumer or a provider), each having a definition of the org.apache.dubbo.sample.User interface. Suppose the org.apache.dubbo.sample.User interface needs to be used in the calling behavior.

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1631941941270-86ce9845-5a88-4cb5-8c8a-da8ae7eeb4d5.png)

RPC requires transmission over a network medium; therefore, data cannot be transmitted as go struct and must be transmitted in binary form. This requires that the consumer side serialize the struct implementing the org.apache.dubbo.sample.User interface into binary format before transmission. Likewise, for the provider side, the binary data needs to be deserialized into struct information. **In summary, normal invocation requires that interface information must have the same definition at each endpoint to ensure that the results of serialization and deserialization meet expectations.**

In gateway scenarios, it is impractical for the gateway to store all interface definitions. For example, if a gateway needs to forward 100 service calls, each requiring 10 interfaces, normal invocation would necessitate storing 1000 (100 * 10) interface definitions in advance, which is clearly difficult. So is there a way that does not require prior storage of interface definitions while still forwarding calls correctly? The answer is yes, which is the reason for using generic invocation.

## Principle

Generic invocation essentially transforms a complex structure into a generic structure, where the generic structure refers to maps, strings, etc., which the gateway can smoothly parse and pass.

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1632207075184-25939db4-f384-452e-a0b8-e1deff7971de.png)

Dubbo-go v3 supports multiple generic invocation modes, including Map (default), Gson, Protobuf-JSON, and Bean. Among these, Map is the most commonly used. The following uses it as an example. Taking the User interface as an example, its definition is as follows:

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

Suppose a service call requires a user as an input parameter, which is defined as follows:

```go
// an instance of the User
user := &User{
    ID:   "1",
    Name: "Zhangsan",
    Age:  20,
}
```

Then under the Map generic invocation, the user will be automatically converted to Map format as follows:

```go
usermap := map[interface{}]interface{} {
    "iD": 	 "1",
    "name":  "zhangsan",
    "age": 	 20,
    "class": "org.apache.dubbo.sample.User",
}
```

Note that:

- The Map generic invocation will automatically convert the first letter to lowercase, so ID will become iD. If you need to align with Dubbo-Java, consider changing ID to Id;
- To precisely control the key names in the Map, you can use the `m` struct tag. For example, `` Name string `m:"userName"` `` will set the key to `userName` instead of the default `name`;
- When the struct implements the `hessian.POJO` interface, a `class` field will be automatically inserted into the generalized result to identify the original interface class. This behavior can be disabled by setting `generic.include.class=false`, which is suitable for generic invocation between pure Go services.

## Usage

Generic invocation is transparent to the provider side, meaning the provider does not need any explicit configuration to handle generic requests correctly.

### Generic Invocation over Triple Protocol

The Triple protocol (dubbo3) supports generic invocation. `NewGenericService` uses a unified dial flow internally, supporting both service discovery via a registry and direct connection via `client.WithURL`. For a complete example, see [dubbo-go-samples/generic](https://github.com/apache/dubbo-go-samples/tree/main/generic). The following uses direct connection as an example.

First, create a dubbo instance and a client, then create a generic service via `cli.NewGenericService`, as shown below.

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

The `NewGenericService` method accepts the following parameters:

- Service interface name;
- `client.WithURL`: direct connection address, using the `tri://` protocol prefix;
- `client.WithVersion`: service version;
- `client.WithGroup`: service group.

Then you can make a generic invocation on the service:

```go
resp, err := genericService.Invoke(
	context.Background(),
	"GetUser1",
	[]string{"java.lang.String"},
	[]hessian.Object{"A003"},
)
```

### Based on Dubbo URL Generic Invocation

The generic invocation based on Filter is transparent to the consumer, and a typical application scenario is a gateway. This method requires that the Dubbo URL contains a generic invocation identifier, as follows.

```plain
dubbo://127.0.0.1:20000/org.apache.dubbo.sample.UserProvider?generic=true&...
```

The semantics expressed by this Dubbo URL are:

- The RPC protocol is dubbo;
- The org.apache.dubbo.sample.UserProvider interface is located at 127.0.0.1:20000;
- Using generic invocation (generic=true).

The consumer's Filter will automatically convert normal calls to generic calls based on the configuration carried by the Dubbo URL. When `inv.Reply()` is set to a target struct pointer, the consumer-side Filter will automatically deserialize the map result into the corresponding object during the `OnResponse` phase; if not set, the response will still be returned in generic format (e.g., map).

### Manual Generic Invocation (Legacy)

> It is recommended to use `client.NewGenericService` as described above. The following is the legacy approach based on `config.ReferenceConfig`, provided for reference only.

Manual generic invocation constructs a reference via `config.ReferenceConfig` and explicitly initiates a generic invocation, a typical application scenario for testing.

Generic invocation does not require creating a configuration file (dubbogo.yaml), but requires manual configuration of the registry, reference, and other information in the code. The initialization method is encapsulated in the newRefConf method, as follows.

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

The newRefConf method takes three parameters:

- appName: application name;
- iface: service interface name;
- protocol: RPC protocol, currently only supporting dubbo and tri (triple protocol).

In the above method, for simplicity, the registry is set as a fixed value, using ZooKeeper at 127.0.0.1:2181 as the registry, which can be customized according to actual conditions in practice.

We can easily obtain a ReferenceConfig instance, temporarily named refConf.

```go
refConf := newRefConf("example.dubbo.io", "org.apache.dubbo.sample.UserProvider", "tri")
```

Next, we can invoke the GetUser method of the org.apache.dubbo.sample.UserProvider service using generic invocation.

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

The Invoke method of GenericService takes four parameters:

- context;
- method name: in this example, it refers to calling the GetUser method;
- parameter types: GetUser method accepts a string type parameter. If the target method accepts multiple parameters, you can write it as `[]string{"type1", "type2", ...}`. If the method is parameterless, you need to fill in an empty array `[]string{}`;
- actual parameters: written the same way as parameter types. If it is a parameterless function, you still need to fill in an empty array `[]hessian.Object{}` as a placeholder.

### Automatic Deserialization with InvokeWithType

In the `Invoke` method, the return value `resp` is a `map` type (for `MapGeneralizer`), requiring users to manually perform type conversion. To simplify this process, dubbo-go provides the `InvokeWithType` method, which can automatically deserialize the result into a user-specified struct.

The following example uses the `client.NewGenericService` approach:

```go
// Define the result struct
type User struct {
    ID   string
    Name string
    Age  int32
}

var user User
// Deserialize the result directly into the user struct
err := genericService.InvokeWithType(
    context.Background(),
    "GetUser1",
    []string{"java.lang.String"},
    []hessian.Object{"A003"},
    &user,
)

if err != nil {
    // Handle error
}
fmt.Println(user.Name)
```

When using the legacy `config.ReferenceConfig` approach, the calling method is as follows:

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
    // Handle error
}
fmt.Println(user.Name)
```

Note: `InvokeWithType` currently only supports the default Map generic invocation.

## Generic Mode Selection

Dubbo-go supports the following four generic invocation modes, distinguished by the `generic` parameter value:

| Mode | Parameter Value | Generalized Format | Use Case |
|------|----------------|-------------------|----------|
| Map (default) | `true` | `map[string]any` | General purpose, Go and Java interoperability |
| Gson | `gson` | JSON string | Scenarios requiring JSON format interaction |
| Protobuf-JSON | `protobuf-json` | JSON string | Generic invocation of Protobuf messages |
| Bean | `bean` | `JavaBeanDescriptor` | Alignment with Java Bean serialization |

When using `client.NewGenericService`, the Map mode is used by default. To use other modes, set the `Generic` field in `ReferenceConfig` to the corresponding parameter value.

In most scenarios, the default Map generic mode is recommended.

## Cross-language RPC contract guidance

In generic invocation or cross-language scenarios, Go variadic method signatures such as `args ...string` can introduce contract ambiguity.
Existing variadic services remain supported, but `...T` is not recommended in new RPC contracts for cross-language or generic-invocation-facing services.

The reason is that variadic parameters have special semantics in Go, while cross-language invocation, dynamic argument assembly, generic invocation, and serialization usually represent them as ordinary arrays or lists.
This increases the risk that callers and providers interpret the argument shape differently.

### Recommended patterns

For new service contracts, prefer the following patterns:

- Use `[]T` instead of `...T` for repeated values of the same type
- Use request/response structs when the input shape may evolve over time
- Use Triple + Protobuf IDL for new cross-language services, and model repeated inputs with `repeated` fields

### Migration examples

Avoid introducing new cross-language contracts like this:

```go
func MultiArgs(ctx context.Context, args ...string) error
```

Prefer a slice parameter instead:

```go
func MultiArgs(ctx context.Context, args []string) error
```

If the contract may evolve further, prefer a request object:

```go
type MultiArgsRequest struct {
    Args []string
}

func MultiArgs(ctx context.Context, req *MultiArgsRequest) error
```

For new Triple + Protobuf services, use a `repeated` field to model repeated inputs:

```proto
message MultiArgsRequest {
  repeated string args = 1;
}
```

### Compatibility note

Existing variadic services remain supported. This guidance is mainly intended for new service contract design.
If a service is expected to support cross-language consumers, gateway forwarding, or generic invocation, it is better not to expose variadic parameters as part of the public RPC contract.

In general, business inputs should be modeled explicitly as structured fields. Non-business context should be passed through attachments or IDL metadata instead of variadic parameters.

Related reading: [【Dubbo-go Service Proxy Model】](https://blog.csdn.net/weixin_39860915/article/details/122738548)
