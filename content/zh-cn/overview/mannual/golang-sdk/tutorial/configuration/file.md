---
description: 使用 dubbogo.yml 配置文件开发应用
title: 使用 dubbogo.yml 配置文件开发应用
linkTitle: 本地配置文件
type: docs
weight: 1
---

## 1.介绍

本文档演示如何在框架中使用 `yaml` 配置文件进行微服务开发，是相比于 `API` 的另一种微服务开发模式。你可以完全使用 `yml` 配置文件进行开发，也可以将部分全局配置放到配置文件，而只在 API 中完成服务定义。

这种模式下，一定要通过 `DUBBO_GO_CONFIG_PATH` 指定配置文件路径：

```shell
export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
```

## 2. 使用说明

可在此查看 <a href="https://github.com/apache/dubbo-go-samples/tree/main/config_yaml" target="_blank">完整示例源码</a>。

### 2.1 运行示例
```txt
.
├── go-client
│   ├── cmd
│   │   └── main.go
│   └── conf
│       └── dubbogo.yml
├── go-server
│   ├── cmd
│   │   └── main.go
│   └── conf
│       └── dubbogo.yml
└─── proto
    ├── greet.pb.go
    ├── greet.proto
    └── greet.triple.go

```
通过 IDL`./proto/greet.proto` 定义服务 使用triple协议


#### build Proto
```bash
cd path_to_dubbogo-sample/config_yaml/proto
protoc --go_out=. --go-triple_out=. ./greet.proto
```
#### Server
```bash
export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
cd path_to_dubbogo-sample/config_yaml/go-server/cmd
go run .
```
#### Client
```bash
export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
cd path_to_dubbogo-sample/config_yaml/go-client/cmd
go run .
```

### 2.2 客户端使用说明

客户端定义的 `yaml` 文件：

```yaml
# dubbo client yaml configure file
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
  consumer:
    references:
      GreetServiceImpl:
        protocol: tri
        interface: com.apache.dubbo.sample.Greeter
        registry: demoZK
        retries: 3
        timeout: 3000
```
通过 `dubbo.Load()` 调用进行文件的读取以及加载

```go
//...
func main() {
	//...
	if err := dubbo.Load(); err != nil {
		//...
	}
	//...
}
```

### 2.3 服务端使用说明

服务端定义的 `yaml` 文件
```yaml
# dubbo server yaml configure file
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 10s
      address: 127.0.0.1:2181
  protocols:
    tripleProtocol:
      name: tri
      port: 20000
  provider:
    services:
      GreetTripleServer:
        interface: com.apache.dubbo.sample.Greeter
```

通过 `dubbo.Load()` 调用进行文件的读取以及加载

```go
//...
func main() {
	//...
	if err := dubbo.Load(); err != nil {
		//...
	}
	//...
}

```
## 3.示例详解

### 3.1服务端介绍

#### 服务端proto文件

源文件路径：dubbo-go-sample/context/proto/greet.proto

```protobuf
syntax = "proto3";

package greet;

option go_package = "github.com/apache/dubbo-go-samples/config_yaml/proto;greet";

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string greeting = 1;
}

service GreetService {
  rpc Greet(GreetRequest) returns (GreetResponse) {}
}
```

#### 服务端handler文件

在服务端中，定义 GreetTripleServer:

```go
type GreetServiceHandler interface {
    Greet(context.Context, *GreetRequest) (*GreetResponse, error)
}
```

实现 GreetServiceHandler 接口，通过 `greet.SetProviderService(&GreetTripleServer{})` 进行注册
，同样使用 `dubbo.Load()` 进行加载配置文件


源文件路径：dubbo-go-sample/config_yaml/go-server/cmd/main.go

```go

package main

import (
	"context"
	"errors"
	"fmt"

	"dubbo.apache.org/dubbo-go/v3"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	greet "github.com/apache/dubbo-go-samples/config_yaml/proto"
)

type GreetTripleServer struct {
}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	name := req.Name
	if name != "ConfigTest" {
		errInfo := fmt.Sprintf("name is not right: %s", name)
		return nil, errors.New(errInfo)
	}

	resp := &greet.GreetResponse{Greeting: req.Name + "-Success"}
	return resp, nil
}

func main() {
	greet.SetProviderService(&GreetTripleServer{})
	if err := dubbo.Load(); err != nil {
		panic(err)
	}
	select {}
}
```

### 3.2 客户端介绍

在客户端中，定义greet.GreetServiceImpl实例，greet.SetConsumerService(svc)进行注册:
通过 `dubbo.Load()` 进行配置文件的加载

源文件路径：dubbo-go-sample/config_yaml/go-client/cmd/main.go

```go
package main

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	greet "github.com/apache/dubbo-go-samples/config_yaml/proto"
	"github.com/dubbogo/gost/log/logger"
)

var svc = new(greet.GreetServiceImpl)

func main() {
	greet.SetConsumerService(svc)
	if err := dubbo.Load(); err != nil {
		panic(err)
	}
	req, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "ConfigTest"})
	if err != nil || req.Greeting != "ConfigTest-Success" {
		panic(err)
	}
	logger.Info("ConfigTest successfully")
}

```

### 3.3 案例效果

先启动服务端，再启动客户端，可以观察到客户端打印了`ConfigTest successfully`配置加载以及调用成功

```
2024-03-11 15:47:29     INFO    cmd/main.go:39  ConfigTest successfully

```

## 4 更多配置

### 指定 Filter

如果要指定多个 filter 时，可用 ',' 分隔

- Consumer 端

  ```yaml
  dubbo:
    consumer:
      filter: echo,token,tps,myCustomFilter # 可指定自定义filter
  ```


- Provider 端

  ```yaml
  dubbo:
    provider:
      services:
        GreeterProvider:
          filter: myCustomFilter,echo,tps
  ```


