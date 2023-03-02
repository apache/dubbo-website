---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/multi_registry/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/multi_registry/
description: 多注册中心
title: 多注册中心
type: docs
weight: 100
---






一个 Dubbo-go 应用可以配置的多个接口维度的注册中心。

## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用
- 本地启动Nacos、Zookeeper 

## 2. 使用多注册中心

修改服务端配置 go-server/conf/dubbogo.yaml， 同时将服务注册在两个注册中心上。

```yaml
dubbo:
  registries:
    zookeeper: # 指定 zookeeper 注册中心
      protocol: zookeeper
      address: 127.0.0.1:2181
    nacos: # 指定 nacos 注册中心
      protocol: nacos
      address: 127.0.0.1:8848
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        registry-ids: # 同时注册
          - zookeeper
          - nacos
        interface: "" 
```

修改客户端配置 go-client/conf/dubbogo.yaml

```yaml
dubbo:
  registries:
    nacos: # 指定 nacos 注册中心
      protocol: nacos
      address: 127.0.0.1:8848
    zookeeper: # 指定 zookeeper 注册中心
      protocol: zookeeper
      address: 127.0.0.1:2181
  consumer:
    references:
      GreeterClientImpl:
        registry-ids: # 从 nacos 注册中心服务发现
          - nacos
        protocol: tri
        interface: "" 
      GreeterClientImpl2:
        registry-ids:  # 从 zookeeeper 注册中心服务发现
          - zookeeper
        protocol: tri
        interface: ""
```

修改客户端代码，再定义一个客户端存根类，名为GreeterClientImpl2：

```go
var grpcGreeterImpl2 = new(GreeterClientImpl2)

type GreeterClientImpl2 struct{
	api.GreeterClientImpl
}
```

客户端编写调用代码：

```go
func main() {
	config.SetConsumerService(grpcGreeterImpl)
	config.SetConsumerService(grpcGreeterImpl2)
	if err := config.Load(); err != nil {
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
	logger.Infof("nacos server response result: %v\n", reply)

	reply, err = grpcGreeterImpl2.SayHello(context.Background(), req)
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("zk server response result: %v\n", reply)
}

```



## 3. 多注册中心服务发现验证

分别启动 go-server/cmd 和 go-client/cmd 查看两条调用成功的日志：

```
INFO    cmd/client.go:55        nacos server response result: name:"Hello laurence" id:"12345" age:21

INFO    cmd/client.go:61        zk server response result: name:"Hello laurence" id:"12345" age:21

```