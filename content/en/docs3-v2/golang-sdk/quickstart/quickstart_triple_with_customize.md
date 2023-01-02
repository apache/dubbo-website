---
type: docs
title: Complete an RPC call (the version that defines the interface yourself)
weight: 3
---

## 1 Overview
In this chapter, we will implement a simple small requirement and implement a distributed ID generation service through which distributed IDs can be obtained
(Assuming a distributed ID, we will not discuss the ID generation scheme and algorithm, here we directly use uuid instead, just to demonstrate the creation of custom services)

## 2. Server implementation
First use dubbogo-cli to create IDC service
```bash
dubbogo-cli newApp IDC
cd IDC
tree.

.
├── Makefile
├── api
│ ├── api.pb.go
│ ├── api.proto
│ └── api_triple.pb.go
├──build
│ └── Dockerfile
├── chart
│ ├── app
│ │ ├── Chart.yaml
│ │ ├── templates
│ │ │ ├── _helpers.tpl
│ │ │ ├── deployment.yaml
│ │ │ ├── service.yaml
│ │ │ └── serviceaccount.yaml
│ │ └── values.yaml
│ └── nacos_env
│ ├── Chart.yaml
│ ├── templates
│ │ ├── _helpers.tpl
│ │ ├── deployment.yaml
│ │ └── service.yaml
│ └── values.yaml
├── cmd
│ └── app.go
├── conf
│ └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go

```

We edit proto to define our interface

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

generate code

```bash
$ cd api
$ protoc --go_out=. --go-triple_out=. ./api.proto
```

Let's tune the service
Directory: pkg/service/service.go
The modified code is as follows

```go
type GeneratorServerImpl struct {
api. UnimplementedGeneratorServer
}

func (s *GeneratorServerImpl) GetID(ctx context.Context, in *api.GenReq) (*api.GenResp, error) {
logger.Infof("Dubbo-go GeneratorProvider AppId = %s\n", in.AppId)
uuid, err := uuid. NewV4()
if err != nil {
logger.Infof("Dubbo-go GeneratorProvider get id err = %v\n", err)
return nil, err
}
return &api.GenResp{Id: uuid.String()}, nil
}

func init() {
config. SetProviderService(&GeneratorServerImpl{})
}
```
At the same time, we adjust the provider part in conf/dubbogo.yaml,
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
We need to pull up a dependent registry, nacos, if you have a ready-made one, this step can be ignored, we use docker to quickly start a nacos,

```bash
git clone https://github.com/nacos-group/nacos-docker.git
cd nacos-docker
docker-compose -f example/standalone-derby.yaml up
```

Finally, we start the server.
```go
export DUBBO_GO_CONFIG_PATH=conf/dubbogo.yaml
go run cmd/app.go
```
Open the nacos console, you can see that the service has been registered
![img](/imgs/docs3-v2/golang-sdk/quickstart/nacos.jpg)


## 2. Client use
First, we can share the API of our server to the client and generate related codes (here we can share proto according to actual project needs, each consumer generates code by itself, or introduce it to dependent services after unified generation of sdk)
The client directory is as follows:
```bash
.
├── api
│ ├── api.pb.go
│ ├── api.proto
│ └── api_triple.pb.go
├── cmd
│ └── client.go
├── conf
│ └── dubbogo.yml
├── go.mod
├── go.sum

```
The api directory is the same as the server's api directory
The client.go code is as follows
```go

var grpcGeneratorImpl = new(api. GeneratorClientImpl)

func main() {
config. SetConsumerService(grpcGeneratorImpl)
if err := config.Load(); err != nil {
panic(err)
}

logger.Info("start to test dubbo")
req := &api. GenReq{
AppId: "laurence",
}
reply, err := grpcGeneratorImpl. GetID(context. Background(), req)
if err != nil {
logger. Error(err)
}
logger.Infof("get id result: %v\n", reply.Id)
}

```

dubbogo.yml is as follows
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

Run the client to get the id, as follows:

```bash
export DUBBO_GO_CONFIG_PATH=conf/dubbogo.yml
go run cmd/client.go
...
...
2022-12-30T20:59:19.971+0800 INFO cmd/client.go:44 start to test dubbo
2022-12-30T20:59:19.982+0800 INFO cmd/client.go:52 get id result: aafd9c73-4014-4d67-a67f-5d107105647b

```
## 3. more

It can be found that we use nacos for the registration center. Of course, we can also use other registration centers. For more usage methods, you can refer to [Registry](/en/docs3-v2/golang-sdk/tutorial/develop/registry/)