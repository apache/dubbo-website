---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/features/config_api/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/features/config_api/
description: 使用配置 API 启动应用
title: 使用配置 API 启动应用
type: docs
weight: 2
---






## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用

## 2. 使用配置 API 启动应用

用户无需使用配置文件，可直接在代码中以 API 的调用的形式写入配置

### 2.1 修改服务端代码：

```go
func main() {
	config.SetProviderService(&GreeterProvider{})
  
	protocolConfig := config.NewProtocolConfigBuilder().
		SetPort("20000").
		SetName("tri").
		Build()
  
	serviceConfig := config.NewServiceConfigBuilder().
		SetInterface(""). // read interface from pb
		Build()
  
	providerConfig := config.NewProviderConfigBuilder().
		AddService("GreeterProvider", serviceConfig).
		Build()
  
	rootConfig := config.NewRootConfigBuilder().
		AddProtocol("triple-protocol-id", protocolConfig). // add protocol, key is custom
		SetProvider(providerConfig).Build()
  
	if err := config.Load(config.WithRootConfig(rootConfig)); err != nil {
		panic(err)
	}
	select {}
}

```

配置 API 看上去写法较为复杂，但单个配置结构的构造过程都是一致的，参考 Java  Builder 的设计，我们在配置 API 模块选用 `New().SetA().SetB().Build()`的方式来逐层构造单个配置结构。

完成后，可删除掉go-server/conf 文件夹。



### 2.2 修改客户端代码：

go-client/cmd/client.go

```go
func main() {
	config.SetConsumerService(grpcGreeterImpl)

	referenceConfig := config.NewReferenceConfigBuilder().
		SetProtocol("tri").
		SetURL("tri://localhost:20000").
		SetInterface(""). // read interface name from pb
		Build()

	consumerConfig := config.NewConsumerConfigBuilder().
		AddReference("GreeterClientImpl", referenceConfig).
		Build()

	rootConfig := config.NewRootConfigBuilder().
		SetConsumer(consumerConfig).Build()
	if err := config.Load(config.WithRootConfig(rootConfig)); err != nil {
		panic(err)
	}

	logger.Info("start to test dubbo")
	req := &api.HelloRequest{
		Name: "laurence",
	}
	reply, err := grpcGreeterImpl.SayHello(context.Background(), req)
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("client response result: %v\n", reply)
}

```

完成后，可删除掉go-client/conf 文件夹。

### 2.3 验证 Config API

分别启动 server 和 client ，查看调用信息。

```
INFO    cmd/client.go:62  client response result: name:"Hello laurence"  id:"12345"  age:21
```