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
{{% alert title="Deprecation Warning" color="warning" %}}
dubbo-go generic invocation is only applicable to the dubbo2 protocol, not the triple protocol
{{% /alert %}}

Generic invocation is a special way of calling in Dubbo-Go that allows intermediary nodes to pass call information without interface information, commonly used in testing and gateway scenarios. Generic invocation supports both Dubbo and Triple protocols, but currently, the serialization scheme only supports Hessian.

## Background

For better understanding, this document introduces generic invocation with a gateway usage scenario. Let's first consider a normal invocation (non-generic invocation). The diagram below includes two key roles: consumer and provider (hereinafter referred to as endpoint, representing either a consumer or a provider), each having a definition of the org.apache.dubbo.sample.User interface. Suppose the org.apache.dubbo.sample.User interface needs to be used in the calling behavior.

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1631941941270-86ce9845-5a88-4cb5-8c8a-da8ae7eeb4d5.png)

RPC requires transmission over a network medium; therefore, data cannot be transmitted as go struct and must be transmitted in binary form. This requires that the consumer side serialize the struct implementing the org.apache.dubbo.sample.User interface into binary format before transmission. Likewise, for the provider side, the binary data needs to be deserialized into struct information. **In summary, normal invocation requires that interface information must have the same definition at each endpoint to ensure that the results of serialization and deserialization meet expectations.**

In gateway scenarios, it is impractical for the gateway to store all interface definitions. For example, if a gateway needs to forward 100 service calls, each requiring 10 interfaces, normal invocation would necessitate storing 1000 (100 * 10) interface definitions in advance, which is clearly difficult. So is there a way that does not require prior storage of interface definitions while still forwarding calls correctly? The answer is yes, which is the reason for using generic invocation.

## Principle

Generic invocation essentially transforms a complex structure into a generic structure, where the generic structure refers to maps, strings, etc., which the gateway can smoothly parse and pass.

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1632207075184-25939db4-f384-452e-a0b8-e1deff7971de.png)

Currently, Dubbo-go v3 only supports Map generic invocation (default). Taking the User interface as an example, its definition is as follows:

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
- A class field will be automatically inserted into the Map to identify the original interface class.

## Usage

Generic invocation is transparent to the provider side, meaning the provider does not need any explicit configuration to handle generic requests correctly.

### Based on Dubbo URL Generic Invocation

The generic invocation based on Filter is transparent to the consumer, and a typical application scenario is a gateway. This method requires that the Dubbo URL contains a generic invocation identifier, as follows.

```plain
dubbo://127.0.0.1:20000/org.apache.dubbo.sample.UserProvider?generic=true&...
```

The semantics expressed by this Dubbo URL are:

- The RPC protocol is dubbo;
- The org.apache.dubbo.sample.UserProvider interface is located at 127.0.0.1:20000;
- Using generic invocation (generic=true).

The consumer's Filter will automatically convert normal calls to generic calls based on the configuration carried by the Dubbo URL, but note that in this method, response results will return in generic format and will not automatically convert to the corresponding object. For example, in map generic invocation, if a User class needs to be returned, the consumer will receive a map corresponding to the User class.

### Manual Generic Invocation

Manual generic invocation requests are not processed through a filter; thus, the consumer must explicitly initiate a generic invocation, a typical application scenario for testing. In [dubbo-go-samples](https://github.com/apache/dubbo-go-samples/tree/f7febed9d686cb940ea55d34b5baa567d7574a44/generic), manual invocation is used for ease of testing.

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

Note: In the current version, parameterless calls may cause crashing issues.

Related reading: [【Dubbo-go Service Proxy Model】](https://blog.csdn.net/weixin_39860915/article/details/122738548)

