---
aliases:
  - /zh-cn/overview/mannual/golang-sdk/tutorial/develop/protocol/exception_response/
description: "当服务端请求处理失败时，dubbo 会支持返回 error 类型值，本示例演示如何处理异常类型返回值。"
title: 异常类型返回值
linkTitle: 异常类型返回值
type: docs
weight: 3
---

## 1.介绍

本文档演示如何在 RPC 调用过程中处理 error 错误类型响应，可在此查看  <a href="https://github.com/apache/dubbo-go-samples/tree/main/error" target="_blank">完整示例源码地址</a>。

## 2.示例详解

### 2.1 服务端

#### 服务端proto文件

源文件路径：dubbo-go-sample/error/proto/greet.proto

```protobuf
syntax = "proto3";

package greet;

option go_package = "github.com/apache/dubbo-go-samples/error/proto;greet";

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

请注意，在本程序设计中，Greet方法只有接收到 `name="right name"` 时才会认为是正确请求，否则会返回错误。

源文件路径：dubbo-go-sample/context/go-server/main.go

```go
package main

import (
	"context"
	"fmt"
	"github.com/pkg/errors"

	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/protocol"
	"dubbo.apache.org/dubbo-go/v3/server"
	greet "github.com/apache/dubbo-go-samples/helloworld/proto"
	"github.com/dubbogo/gost/log/logger"
)

type GreetTripleServer struct {
}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	name := req.Name
	if name != "right name" {
		errInfo := fmt.Sprintf("name is not right: %s", name)
		logger.Error(errInfo)
		return nil, errors.New(errInfo)
	}

	resp := &greet.GreetResponse{Greeting: req.Name}
	return resp, nil
}

func main() {
	srv, err := server.NewServer(
		server.WithServerProtocol(
			protocol.WithPort(20000),
			protocol.WithTriple(),
		),
	)
	if err != nil {
		panic(err)
	}

	if err = greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
		panic(err)
	}

	if err = srv.Serve(); err != nil {
		logger.Error(err)
	}
}

```

从 rpc 方法签名中，我们可以看到 `func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error)` 包含 error 返回值。

### 2.2 客户端

客户端分别发起两次调用，一次是正确的请求，一次是错误的请求

源文件路径：dubbo-go-sample/context/go-client/main.go

```go
package main

import (
	"context"

	"dubbo.apache.org/dubbo-go/v3/client"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	greet "github.com/apache/dubbo-go-samples/helloworld/proto"
	"github.com/dubbogo/gost/log/logger"
)

func main() {
	cli, err := client.NewClient(
		client.WithClientURL("127.0.0.1:20000"),
	)
	if err != nil {
		panic(err)
	}

	svc, err := greet.NewGreetService(cli)
	if err != nil {
		panic(err)
	}

	resp, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "right name"})
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("call Greet success: %s", resp.Greeting)

	resp, err = svc.Greet(context.Background(), &greet.GreetRequest{Name: "wrong name"})
	if err != nil {
		logger.Errorf("call Greet failed, err: %s", err.Error())
	}
}
```

### 2.3 案例效果

先启动服务端，再启动客户端，可以观察到客户端的第一次调用成功，第二次调用失败并且服务端返回了 error

```
2024-02-28 17:49:40	INFO	logger/logging.go:42	call Greet success: [right name]
2024-02-28 17:49:40	ERROR	logger/logging.go:52	call Greet failed, err: [Failed to invoke the method Greet in the service greet.GreetService. Tried 2 times of the providers [tri://:@127.0.0.1:20000/?interface=greet.GreetService&group=&version= tri://:@127.0.0.1:20000/?interface=greet.GreetService&group=&version= tri://:@127.0.0.1:20000/?interface=greet.GreetService&group=&version=] (3/1)from the registry tri://127.0.0.1:20000/greet.GreetService?app.version=&application=dubbo.io&async=false&bean.name=greet.GreetService&cluster=failover&config.tracing=&environment=&generic=&group=&interface=greet.GreetService&loadbalance=&metadata-type=local&module=sample&name=dubbo.io&organization=dubbo-go&owner=dubbo-go&peer=true&provided-by=&reference.filter=cshutdown&registry.role=0&release=dubbo-golang-3.2.0&remote.timestamp=&retries=&serialization=protobuf&side=consumer&sticky=false&timestamp=1709113780&version= on the consumer 30.221.146.234 using the dubbo version 3.2.0. Last error is unknown: name is not right: wrong name.: unknown: name is not right: wrong name]
```


