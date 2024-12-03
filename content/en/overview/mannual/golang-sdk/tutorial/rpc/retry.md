---
description: Request Retry
title: Request Retry
type: docs
weight: 3
---

When a service call fails, we can allow the framework to automatically retry a few times, which can improve the success rate of requests seen by users. In failover cluster mode, dubbo-go supports automatic retries.

## 1. Introduction

This example demonstrates how to configure the retry function when a client-side call fails. <a href="https://github.com/apache/dubbo-go-samples/tree/main/retry" target="_blank">Full example source code</a>

## 2. How to Use the Retry Feature

When creating a client using `client.NewClient()`, you can set the retry count using `client.WithClientRetries()` method.

```go
cli, err := client.NewClient(
	client.WithClientURL("tri://127.0.0.1:20000"),
	client.WithClientRetries(3),
)
```

Alternatively, you can set the service-level timeout using `client.WithRequestTimeout()` (the following configuration applies to service `svc`).

```go
svc, err := greet.NewGreetService(cli, client.WithClientRetries(5))
```

You can also specify the retry count at the time of the call using `client.WithCallRetries()`.

```go
resp, err := svc.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"}, client.WithCallRetries(6))
```

From top to bottom, the priority of the above three methods increases, with `client.WithCallRetries()` having the highest priority.


## 3. Example Analysis

### 3.1 Server Introduction

#### Server proto file

Source file path: dubbo-go-sample/retry/proto/greet.proto

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

#### Server handler file

The `Greet` method responds directly, while the `GreetRetry` method simulates retries.
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

### 3.2 Client Introduction

The client file creates a client, sets the retry count to 3, and makes requests to `Greet` and `GreetRetry`, observing the server log output.

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

### 3.3 Case Effect

Start the server first, then start the client. When accessing `GreetRetry`, observe the server log output showing the retry count.

```
2024-01-23 22:39:11     INFO    logger/logging.go:22    [Not need retry, request success]
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry [1] times
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry [2] times
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry [3] times
2024-01-23 22:39:11     INFO    logger/logging.go:42    retry success, current request time is [3]
```
