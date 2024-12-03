---
description: 请求重试
title: 请求重试
type: docs
weight: 3
---

当一次服务调用失败时，我们可以让框架选择自动重试几次，这样能提高用户侧看到的请求成功率。在 failover cluster 模式下 dubbo-go 支持自动重试。

## 1.介绍

本示例演示如何在 client 端调用失败时配置重试功能，<a href="https://github.com/apache/dubbo-go-samples/tree/main/retry" target="_blank">完整示例源码地址</a>

## 2.如何使用重试功能

在使用 `client.NewClient()` 创建客户端时，可以使用 `client.WithClientRetries()` 方法设置重试次数。

```go
cli, err := client.NewClient(
	client.WithClientURL("tri://127.0.0.1:20000"),
	client.WithClientRetries(3),
)
```

或者，可以使用 `client.WithRequestTimeout()` 设置服务粒度的超时时间（以下配置对服务 `svc` 起作用）。

```go
svc, err := greet.NewGreetService(cli, client.WithClientRetries(5))
```

也可以在调用发起时，使用 `client.WithCallRetries()` 指定重试次数

```go
resp, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"}, client.WithCallRetries(6))
```

从上往下，以上三种方式的优先级逐步提高，`client.WithCallRetries()` 指定的重试次数优先级最高。


## 3.示例解读

### 3.1服务端介绍

#### 服务端proto文件

源文件路径：dubbo-go-sample/retry/proto/greet.proto

```protobuf
syntax = "proto3";

package greet;

option go_package = "github.com/apache/dubbo-go-samples/retry/proto;greet";

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

`Greet`方法直接响应，`GreetRetry`方法用于模拟重试。
```go
package main

import (
	"context"
	"github.com/pkg/errors"

	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/protocol"
	"dubbo.apache.org/dubbo-go/v3/server"
	greet "github.com/apache/dubbo-go-samples/retry/proto"
	"github.com/dubbogo/gost/log/logger"
)

type GreetTripleServer struct {
	requestTime int
}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	resp := &greet.GreetResponse{Greeting: req.Name}
	logger.Info("Not need retry, request success")
	return resp, nil
}

func (srv *GreetTripleServer) GreetRetry(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	if srv.requestTime < 3 {
		srv.requestTime++
		logger.Infof("retry %d times", srv.requestTime)
		return nil, errors.New("retry")
	}
	resp := &greet.GreetResponse{Greeting: req.Name}
	logger.Infof("retry success, current request time is %d", srv.requestTime)
	srv.requestTime = 0
	return resp, nil
}

func main() {
	srv, err := server.NewServer(
		server.WithServerProtocol(
			protocol.WithPort(20000),
		),
	)
	if err != nil {
		panic(err)
	}
	if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{
		requestTime: 0,
	}); err != nil {
		panic(err)
	}
	if err := srv.Serve(); err != nil {
		logger.Error(err)
	}
}

```

### 3.2客户端介绍

客户端client文件，创建客户端，设置重试次数为3，分别请求`Greet`和`GreetRetry`，观察服务端日志输出。

```go
package main

import (
	"context"

	"dubbo.apache.org/dubbo-go/v3/client"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	greet "github.com/apache/dubbo-go-samples/retry/proto"
	"github.com/dubbogo/gost/log/logger"
)

func main() {
	cli, err := client.NewClient(
		client.WithClientURL("tri://127.0.0.1:20000"),
		client.WithClientRetries(3),
	)
	if err != nil {
		panic(err)
	}

	svc, err := greet.NewGreetService(cli)
	if err != nil {
		panic(err)
	}

	// request normal
	resp, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"})
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("Greet response: %s", resp.Greeting)

	// request need retry
	resp, err = svc.GreetRetry(context.Background(), &greet.GreetRequest{Name: "hello world"})
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("Greet response: %s", resp.Greeting)
}
```

### 3.3案例效果

先启动服务端，再启动客户端，访问`GreetRetry`时观察到服务端日志输出了重试次数。

```
2024-01-23 22:39:11     INFO    logger/logging.go:22    [Not need retry, request success]
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry [1] times
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry [2] times
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry [3] times
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry success, current request time is [3]
```