---
description: 配置超时时间
title: 超时时间
type: docs
weight: 2
---

## 1.介绍

本示例演示如何在 Dubbo-go 客户端发起调用时设置请求超时时间。可在此查看 <a href="https://github.com/apache/dubbo-go-samples/tree/main/timeout" target="_blank">完整示例源码地址</a>

## 2.如何设置请求超时时间

在创建客户端时，可以使用 `client.WithRequestTimeout()` 方法设置全局超时时间（所有使用改 client 的服务代理共享）。

```go
    cli, err := client.NewClient(
        client.WithClientURL("tri://127.0.0.1:20000"),
        client.WithClientRequestTimeout(3 * time.Second),
    )
```

可以使用 `client.WithRequestTimeout()` 创建服务粒度的超时时间（以下服务代理 `svc` 发起的方法调用都使用这个时间）。

```go
   svc, err := greet.NewGreetService(cli, client.WithRequestTimeout(5 * time.Second))
```

也可以在调用发起时，使用 `client.WithCallRequestTimeout()` 指定一个超时时间

```go
resp, err := svc.GreetTimeout(context.Background(), &greet.GreetRequest{Name: "hello world"}, client.WithCallRequestTimeout(10 * time.Second))
```

从上往下，以上三种方式的优先级逐步提高，`client.WithCallRequestTimeout()` 指定的超时时间优先级最高。

## 3.示例详解

### 3.1服务端介绍

#### 服务端proto文件

源文件路径：dubbo-go-sample/timeout/proto/greet.proto

```protobuf
syntax = "proto3";

package greet;

option go_package = "github.com/apache/dubbo-go-samples/timeout/proto;greet";

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string greeting = 1;
}

service GreetService {
  rpc Greet(GreetRequest) returns (GreetResponse) {}
  rpc GreetTimeout(GreetRequest) returns (GreetResponse) {}
}
```

#### 服务端handler文件

`Greet`方法直接响应，`GreetTimeout`方法等待五秒后响应（模拟超时）。

源文件路径：dubbo-go-sample/timeout/go-server/handler.go

```go
package main

import (
   "context"
   "time"

   greet "github.com/apache/dubbo-go-samples/timeout/proto"
)

type GreetTripleServer struct {
}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
   resp := &greet.GreetResponse{Greeting: req.Name}
   return resp, nil
}

func (srv *GreetTripleServer) GreetTimeout(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
   time.Sleep(5 * time.Second)
   resp := &greet.GreetResponse{Greeting: req.Name}
   return resp, nil
}
```

### 3.2客户端介绍

客户端client文件，创建客户端，设置超时时间为3s，分别请求`Greet`和`GreetTimeout`，输出响应结果。

源文件路径：dubbo-go-sample/timeout/go-client/client.go

```go
package main

import (
	"context"
	"time"

	"dubbo.apache.org/dubbo-go/v3/client"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	greet "github.com/apache/dubbo-go-samples/timeout/proto"
	"github.com/dubbogo/gost/log/logger"
)

func main() {
	cli, err := client.NewClient(
		client.WithClientURL("tri://127.0.0.1:20000"),
		client.WithClientRequestTimeout(3*time.Second),
	)
	if err != nil {
		panic(err)
	}

	svc, err := greet.NewGreetService(cli)
	if err != nil {
		panic(err)
	}

	// test timeout
	resp, err := svc.GreetTimeout(context.Background(), &greet.GreetRequest{Name: "hello world"})
	if err != nil {
		logger.Error("call [greet.GreetService.GreetTimeout] service timeout")
		logger.Error(err)
	} else {
		logger.Infof("Greet response: %s", resp.Greeting)
	}

	// test normal
	resp, err = svc.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"})
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("Greet response: %s", resp.Greeting)
}
```

### 3.3案例效果

先启动服务端，再启动客户端，可以观察到`GreetTimeout`请求响应超时，`Greet`请求响应正常

```
[call [greet.GreetService.GreetTimeout] service timeout]
Greet response: [hello world]
```
