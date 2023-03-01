---
aliases:
    - /zh/overview/quickstart/go/quickstart_triple_with_customize/
description: 3 - 完成一次 RPC 调用自己定义接口的版本
title: 完成一次自己定义接口的 RPC 调用
type: docs
weight: 3
---



## 1.概述
我们本章来实现一个简单的小需求，实现一个分布式ID生成服务，通过该服务可以获取分布式ID
（假设的分布式ID，我们不探讨ID的生成方案和算法，这里直接使用uuid代替，只为演示自定义服务的创建）

## 2. 服务端实现
首先使用 dubbogo-cli 创建 IDC 服务
```bash
dubbogo-cli newApp IDC
cd IDC
tree .

.
├── Makefile
├── api
│   ├── api.pb.go
│   ├── api.proto
│   └── api_triple.pb.go
├── build
│   └── Dockerfile
├── chart
│   ├── app
│   │   ├── Chart.yaml
│   │   ├── templates
│   │   │   ├── _helpers.tpl
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── serviceaccount.yaml
│   │   └── values.yaml
│   └── nacos_env
│       ├── Chart.yaml
│       ├── templates
│       │   ├── _helpers.tpl
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── values.yaml
├── cmd
│   └── app.go
├── conf
│   └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go

```

我们编辑proto定义我们的接口

```protobuf
syntax = "proto3";
package api;

option go_package = "./;api";

service Generator {
  rpc GetID (GenReq) returns (GenResp) {}
}

message GenReq {
  string appId = 1;
}

message GenResp {
  string id = 1;
}
```

生成代码

```bash
$ cd api
$ protoc --go_out=. --go-triple_out=. ./api.proto
```

我们来调整service
目录：pkg/service/service.go
修改后的代码如下

```go
type GeneratorServerImpl struct {
	api.UnimplementedGeneratorServer
}

func (s *GeneratorServerImpl) GetID(ctx context.Context, in *api.GenReq) (*api.GenResp, error) {
	logger.Infof("Dubbo-go GeneratorProvider AppId = %s\n", in.AppId)
	uuid, err := uuid.NewV4()
	if err != nil {
		logger.Infof("Dubbo-go GeneratorProvider get id err = %v\n", err)
		return nil, err
	}
	return &api.GenResp{Id: uuid.String()}, nil
}

func init() {
	config.SetProviderService(&GeneratorServerImpl{})
}
```
同时，我们调整conf/dubbogo.yaml中的provider部分，
```yaml
dubbo:
  registries:
    nacos:
      protocol: nacos
      address: 127.0.0.1:8848
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GeneratorServerImpl:
        interface: "" # read from stub
```
我们需要拉起一个依赖的注册中心，nacos，如果你有现成的，本步骤可以忽略，我们使用docker来快速启动一个nacos，

```bash
git clone https://github.com/nacos-group/nacos-docker.git
cd nacos-docker
docker-compose -f example/standalone-derby.yaml up
```

最后，我们启动服务端。
```go
export DUBBO_GO_CONFIG_PATH=conf/dubbogo.yaml 
go run cmd/app.go  
```
打开nacos的控制台，可以看到服务已经注册
![img](/imgs/docs3-v2/golang-sdk/quickstart/nacos.jpg)


## 2. 客户端使用
首先，我们可以共享我们的服务端的api给客户端，并生成相关的代码（这里可以根据实际项目需要，共享共享proto，每个consumer自行生成代码，或统一生成sdk后给依赖的服务引入）
客户端目录如下：
```bash
.
├── api
│   ├── api.pb.go
│   ├── api.proto
│   └── api_triple.pb.go
├── cmd
│   └── client.go
├── conf
│   └── dubbogo.yml
├── go.mod
├── go.sum

```
api目录同服务端的api目录
client.go 代码如下
```go

var grpcGeneratorImpl = new(api.GeneratorClientImpl)

func main() {
	config.SetConsumerService(grpcGeneratorImpl)
	if err := config.Load(); err != nil {
		panic(err)
	}

	logger.Info("start to test dubbo")
	req := &api.GenReq{
		AppId: "laurence",
	}
	reply, err := grpcGeneratorImpl.GetID(context.Background(), req)
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("get id result: %v\n", reply.Id)
}

```

dubbogo.yml 如下
```yaml
dubbo:
  registries:
    nacos:
      protocol: nacos
      address: 127.0.0.1:8848
  consumer:
    references:
      GeneratorClientImpl:
        protocol: tri
        interface: ""
```

运行client，获取id，如下：

```bash
export DUBBO_GO_CONFIG_PATH=conf/dubbogo.yml
go run cmd/client.go
……
……
2022-12-30T20:59:19.971+0800    INFO    cmd/client.go:44        start to test dubbo
2022-12-30T20:59:19.982+0800    INFO    cmd/client.go:52        get id result: aafd9c73-4014-4d67-a67f-5d107105647b

```
## 3. 更多

可以发现注册中心我们是使用nacos，当然，我们也可以使用其他的注册中心，更多的使用方式，可以参考[注册中心](/zh-cn/overview/mannual/golang-sdk/tutorial/develop/registry/)
