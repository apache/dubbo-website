---
description: Configure Timeout Duration
title: Timeout Duration
type: docs
weight: 2
---

## 1. Introduction

This example demonstrates how to set the request timeout duration when initiating a call from the Dubbo-go client. You can view the <a href="https://github.com/apache/dubbo-go-samples/tree/main/timeout" target="_blank">complete example source code</a> here.

## 2. How to Set the Request Timeout Duration

When creating a client, you can set a global timeout using the `client.WithRequestTimeout()` method (shared by all service proxies using this client).

```go
    cli, err := client.NewClient(
        client.WithClientURL("tri://127.0.0.1:20000"),
        client.WithClientRequestTimeout(3 * time.Second),
    )
```

You can also create service-level timeout using `client.WithRequestTimeout()` (all method calls initiated from the following service proxy `svc` will use this timeout).

```go
   svc, err := greet.NewGreetService(cli, client.WithRequestTimeout(5 * time.Second))
```

Additionally, you can specify a timeout when making the call using `client.WithCallRequestTimeout()`.

```go
resp, err := svc.GreetTimeout(context.Background(), &greet.GreetRequest{Name: "hello world"}, client.WithCallRequestTimeout(10 * time.Second))
```

From top to bottom, the priority of the above three methods increases, with `client.WithCallRequestTimeout()` having the highest priority.

## 3. Example Details

### 3.1 Introduction to the Server

#### Server Proto File

Source file path: dubbo-go-sample/timeout/proto/greet.proto

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

#### Server Handler File

The `Greet` method responds directly, while the `GreetTimeout` method waits for five seconds before responding (simulating a timeout).

Source file path: dubbo-go-sample/timeout/go-server/handler.go

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

### 3.2 Introduction to the Client

Client file, creating a client, setting the timeout to 3s, requesting `Greet` and `GreetTimeout`, and outputting the response results.

Source file path: dubbo-go-sample/timeout/go-client/client.go

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

### 3.3 Example Effect

Start the server first, then start the client. You will observe that the `GreetTimeout` request times out while the `Greet` request responds normally.

```
[call [greet.GreetService.GreetTimeout] service timeout]
Greet response: [hello world]
```
