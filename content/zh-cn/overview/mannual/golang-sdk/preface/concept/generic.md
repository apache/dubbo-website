---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/concept/generic/
    - /zh-cn/docs3-v2/golang-sdk/preface/concept/generic/
description: 泛化调用
keywords: 泛化调用
title: 泛化调用
type: docs
---






泛化调用是一种 Dubbo-Go 的特殊调用方式，它允许中间节点在没有接口信息的情况下传递调用信息，常被用于测试、网关的场景下。泛化调用支持 Dubbo 和 Triple 协议，但是目前序列化方案只支持 Hessian。

## 背景

为了便于理解，这篇文档中以网关使用场景介绍泛化调用。我们先来考虑普通调用（非泛化调用）。下图包含了 consumer 和 provider 两个关键角色（后文中用 endpoint 代表一个 consumer 或一个 provider），各自都有一份关于 org.apache.dubbo.sample.User 接口的定义。假定在调用行为中需要使用 org.apache.dubbo.sample.User 接口。

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1631941941270-86ce9845-5a88-4cb5-8c8a-da8ae7eeb4d5.png)

RPC 需要借助网络介质传输，因此数据不能以 go struct 形式传输，而必须以二进制形式传输。这就要求 consumer 端在传输前，需要将实现 org.apache.dubbo.sample.User 接口的结构体序列化为二进制格式。同样的，对于 provider 端，需要将二进制数据反序列化为结构体信息。**总之，普通调用要求接口信息在每一个 endpoint 必须有相同的定义，这样才能保证数据序列化和反序列化的结果与预期一致**。

在网关场景下，网关不可能存储全部接口定义。比如一个网关需要转发 100 个服务调用，每个服务需要的接口数量为 10 个，普通调用要求把 1000 个（100 * 10）接口定义提前全部存储在网关内，这显然是难以做到的。所以有没有一种方式可以既不需要提前存储接口定义，又能正确转发调用呢？答案是肯定的，这就是使用泛化调用的原因。

## 原理

泛化调用本质上就是把复杂结构转化为通用结构，这里说的通用结构是指 map、string 等，网关是可以顺利解析并传递这些通用结构的。

![img](/imgs/docs3-v2/golang-sdk/concept/rpc/generic/1632207075184-25939db4-f384-452e-a0b8-e1deff7971de.png)

目前，Dubbo-go v3 只支持 Map 泛化方式（default）。我们以 User 接口为例，其定义如下所示。

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
- 在 Map 中会自动插入 class 字段，用于标识原有接口类。

## 使用

泛化调用对 provider 端是透明的，即 provider 端不需要任何显式配置就可以正确处理泛化请求。

### 基于 Dubbo URL 泛化调用

基于 Filter 泛化调用对 consumer 是透明的，典型应用场景是网关。这种方式需要要求 Dubbo URL 中包含泛化调用标识，如下所示。

```plain
dubbo://127.0.0.1:20000/org.apache.dubbo.sample.UserProvider?generic=true&...
```

这个 Dubbo URL 表达的语意是：

- RPC 协议为 dubbo；
- org.apache.dubbo.sample.UserProvider 接口位于 127.0.0.1:20000；
- 使用泛化调用（generic=true）。

Consumer 端的 Filter 会自动根据 Dubbo URL 携带的配置自动将普通调用转化为泛化调用，但是需要注意的是，在这种方式下响应结果是以泛化格式返回，不会自动转化为相应的对象。举个例子，在 map 泛化方式下，如果需要返回 User 类，那么 consumer 获得的相应是一个 User 类对应的 map。

### 手动泛化调用

手动泛化调用发起的请求不经过 filter，所以需要 consumer 端显式地发起泛化调用，典型应用场景是测试。在 [dubbo-go-samples](https://github.com/apache/dubbo-go-samples/tree/master/generic) 中，为了便于测试都是采用手动调用的方式。

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

注意：在目前版本中，无参调用会出现崩溃问题。

相关阅读：[【Dubbo-go 服务代理模型】](https://blog.csdn.net/weixin_39860915/article/details/122738548)