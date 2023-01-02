---
type: docs
title: generalization call
keywords: generalization call
---

Generalized call is a special call method of Dubbo-Go, which allows intermediate nodes to pass call information without interface information, and is often used in test and gateway scenarios. Generalized calls support Dubbo and Triple protocols, but the current serialization scheme only supports Hessian.

## background

For ease of understanding, this document uses gateway usage scenarios to introduce generalized calls. Let's consider ordinary calls first (non-generic calls). The figure below contains two key roles of consumer and provider (endpoint is used to represent a consumer or a provider in the following), and each has a definition of the org.apache.dubbo.sample.User interface. Assume that the org.apache.dubbo.sample.User interface needs to be used in the calling behavior.

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1631941941270-86ce9845-5a88-4cb5-8c8a-da8ae7eeb4d5.png)

RPC needs to be transmitted through network media, so data cannot be transmitted in go struct form, but must be transmitted in binary form. This requires the consumer side to serialize the structure that implements the org.apache.dubbo.sample.User interface into a binary format before transmission. Similarly, for the provider side, binary data needs to be deserialized into structure information. **In short, common calls require that the interface information must have the same definition at each endpoint, so as to ensure that the results of data serialization and deserialization are consistent with expectations**.

In the gateway scenario, it is impossible for the gateway to store all interface definitions. For example, a gateway needs to forward 100 service calls, and the number of interfaces required for each service is 10. Common calls require all 1000 (100 * 10) interface definitions to be stored in the gateway in advance, which is obviously difficult to achieve. So is there a way to forward calls correctly without storing interface definitions in advance? The answer is yes, which is why generic calls are used.

## principle

The essence of generalized calls is to transform complex structures into general structures. The general structures mentioned here refer to maps, strings, etc., and the gateway can smoothly parse and transfer these general structures.

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1632207075184-25939db4-f384-452e-a0b8-e1deff7971de.png)

Currently, Dubbo-go v3 only supports Map generalization (default). Let's take the User interface as an example, and its definition is as follows.

```go
// definition
type User struct {
ID string
name string
Age int32
}

func (u *User) JavaClassName() string {
return "org.apache.dubbo.sample.User"
}
```

Assume that calling a service requires a user as an input parameter, and its definition is as follows.

```go
// an instance of the User
user := &User{
    ID: "1",
    Name: "Zhangsan",
    Age: 20,
}
```

Then, when using Map generalization, user will be automatically converted to Map format, as shown below.

```go
usermap := map[interface{}]interface{} {
    "iD": "1",
    "name": "zhangsan",
    "age": 20,
    "class": "org.apache.dubbo.sample.User",
}
```

have to be aware of is:

- Map generalization will automatically lowercase the first letter, that is, ID will be converted to iD. If you need to align Dubbo-Java, please consider changing ID to Id;
- A class field is automatically inserted in the Map to identify the original interface class.

## use

The generalization call is transparent to the provider side, that is, the provider side can correctly handle the generalization request without any explicit configuration.

### Generalized call based on Dubbo URL

The call based on Filter generalization is transparent to the consumer, and the typical application scenario is a gateway. This method needs to require the Dubbo URL to include a generic call identifier, as shown below.

```plain
dubbo://127.0.0.1:20000/org.apache.dubbo.sample.UserProvider?generic=true&...
```

The meaning expressed by this Dubbo URL is:

- The RPC protocol is dubbo;
- org.apache.dubbo.sample.UserProvider interface at 127.0.0.1:20000;
- Use generic calls (generic=true).

The Filter on the Consumer side will automatically convert ordinary calls into generalized calls according to the configuration carried by the Dubbo URL, but it should be noted that in this way, the response result is returned in a generalized format and will not be automatically converted into the corresponding object. For example, in the map generalization mode, if the User class needs to be returned, then the consumer will get a map corresponding to the User class.

### Manual generalization call

The request initiated by the manual generalization call does not pass through the filter, so the consumer side needs to initiate the generalization call explicitly. The typical application scenario is testing. In [dubbo-go-samples](https://github.com/apache/dubbo-go-samples/tree/master/generic), manual calls are used for the convenience of testing.

The generalized call does not need to create a configuration file (dubbogo.yaml), but it needs to manually configure the registration center, reference and other information in the code. The initialization method is encapsulated into the newRefConf method, as shown below.

```go
func newRefConf(appName, iface, protocol string) config.ReferenceConfig {
registryConfig := &config.RegistryConfig{
Protocol: "zookeeper",
Address: "127.0.0.1:2181",
}

refConf := config.ReferenceConfig{
InterfaceName: iface,
Cluster: "failover",
Registry: []string{"zk"},
Protocol: protocol,
Generic: "true",
}

rootConfig := config.NewRootConfig(config.WithRootRegistryConfig("zk", registryConfig))
_ = rootConfig.Init()
_ = refConf.Init(rootConfig)
refConf. GenericLoad(appName)

return refConf
}
```

The newRefConf method receives three parameters, which are:

- appName: application name;
- iface: service interface name;
- protocol: RPC protocol, currently only supports dubbo and tri (triple protocol).

In the above method, in order to keep the function simple, the registration center is set to a fixed value, that is, ZooKeeper at 127.0.0.1:2181 is used as the registration center, which can be freely customized according to the actual situation in practice.

We can easily get a ReferenceConfig instance, temporarily named refConf.

```go
refConf := newRefConf("example.dubbo.io", "org.apache.dubbo.sample.UserProvider", "tri")
```

Then we can initiate a generic call to the GetUser method of the org.apache.dubbo.sample.UserProvider service.

```go
resp, err := refConf.
GetRPCService().(*generic.GenericService).
Invoke(
context. TODO(),
"GetUser",
[]string{"java. lang. String"},
[]hessian. Object{"A003"},
    )
```

The Invoke method of GenericService receives four parameters, which are:

- context;
- Method name: In this example, it means calling the GetUser method;
- Parameter type: GetUser method accepts a parameter of string type. If the target method accepts multiple parameters, it can be written as `[]string{"type1", "type2", ...}`, if the current method has no parameters , you need to fill in an empty array `[]string{}`;
- Actual parameter: The writing method is the same as the parameter type. If it is a parameterless function, an empty array `[]hessian.Object{}` should still be filled in.

Note: In the current version, there will be a crash problem when calling without parameters.

Related reading: [[Dubbo-go service proxy model]](https://blog.csdn.net/weixin_39860915/article/details/122738548)
