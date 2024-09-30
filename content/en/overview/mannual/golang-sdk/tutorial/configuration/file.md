---
description: Use the dubbogo.yml configuration file to develop applications
title: Use the dubbogo.yml Configuration File to Develop Applications
linkTitle: Local Configuration File
type: docs
weight: 1
---

## 1. Introduction

This document demonstrates how to use a `yaml` configuration file in the framework for microservice development, which is an alternative development model compared to `API`. You can fully develop using a `yml` configuration file or put some global configurations in the configuration file, while defining services only in the API.

In this mode, you must specify the configuration file path through `DUBBO_GO_CONFIG_PATH`:

```shell
export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
```

## 2. Usage Instructions

You can view the <a href="https://github.com/apache/dubbo-go-samples/tree/main/config_yaml" target="_blank">complete example source code</a> here.

### 2.1 Run Example
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
Define services using IDL `./proto/greet.proto` with the triple protocol.

#### Build Proto
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

### 2.2 Client Instructions

The `yaml` file defined by the client:

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
Call `dubbo.Load()` to read and load the file.

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

### 2.3 Server Instructions

The `yaml` file defined by the server:
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

Call `dubbo.Load()` to read and load the file.

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
## 3. Example Details

### 3.1 Server Introduction

#### Server Proto File

Source file path: dubbo-go-sample/context/proto/greet.proto

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

#### Server Handler File

In the server, define GreetTripleServer:

```go
type GreetServiceHandler interface {
    Greet(context.Context, *GreetRequest) (*GreetResponse, error)
}
```

Implement the GreetServiceHandler interface and register it via `greet.SetProviderService(&GreetTripleServer{})`, also load the configuration file with `dubbo.Load()`.

Source file path: dubbo-go-sample/config_yaml/go-server/cmd/main.go

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

### 3.2 Client Introduction

In the client, define`greet.GreetServiceImpl` instance and register with `greet.SetConsumerService(svc)`; load the configuration file with `dubbo.Load()`.

Source file path: dubbo-go-sample/config_yaml/go-client/cmd/main.go

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

### 3.3 Case Effect

Start the server first, then start the client, and you can observe the client printing `ConfigTest successfully` configuration loading and calling success.

```
2024-03-11 15:47:29     INFO    cmd/main.go:39  ConfigTest successfully

```

## 4 More Configurations

### Specify Filters

If you want to specify multiple filters, you can separate them with ','.

- Consumer Side

  ```yaml
  dubbo:
    consumer:
      filter: echo,token,tps,myCustomFilter # Custom filters can be specified
  ```

- Provider Side

  ```yaml
  dubbo:
    provider:
      services:
        GreeterProvider:
          filter: myCustomFilter,echo,tps
  ```

