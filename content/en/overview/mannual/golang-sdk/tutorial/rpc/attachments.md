---
description: Passing Additional Parameters Attachment
title: Passing Additional Parameters
type: docs
weight: 4
---

**The most straightforward way to understand implicit parameter passing is through the HTTP header, which works exactly like an HTTP header, allowing any number of header parameters to be passed outside of the GET or POST request body.** For RPC calls, the context provides the ability to pass additional parameters outside of the method signature's parameters. The implementation varies slightly between different protocols:
* For the triple protocol, the attachment is converted into standard HTTP headers for transmission.
* For the Dubbo protocol, the attachment is encoded in a fixed location within the protocol body; please refer to the Dubbo protocol specification.

![/user-guide/images/context.png](/imgs/user/context.png)

{{% alert title="Note" color="primary" %}}
* When using the triple protocol, only lowercase ASCII characters are supported due to the limitations of HTTP headers.
* Keys such as path, group, version, dubbo, token, timeout, etc., are reserved fields and should be avoided when passing attachments. It is advisable to ensure key uniqueness through business prefixes.
{{% /alert %}}

## 1. Introduction

This document demonstrates how to use the context in the Dubbo-go framework to pass and read additional parameters, enabling context information transmission. You can view the <a href="https://github.com/apache/dubbo-go-samples/tree/main/context" target="_blank">complete sample source code here</a>.

## 2. Usage Instructions
### 2.1 Client Usage Instructions

In the client, fields can be passed using the following method, where the key is `constant.AttachmentKey`, i.e., "attachment":

```go
	ctx := context.Background()
	ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]interface{}{
        "key1": "user defined value 1",
        "key2": "user defined value 2"
	})
```

### 2.2 Server Usage Instructions

In the server, fields can be retrieved using the following method, where the value type is map[string]interface{}:
```go
    attachments := ctx.Value(constant.AttachmentKey).(map[string]interface{})
    logger.Infof("Dubbo attachment key1 = %s", value1.([]string)[0])
    logger.Infof("Dubbo attachment key2 = %s", value2.([]string)[0])
```

## 3. Example Analysis

### 3.1 Server Introduction

#### Server Proto File

Source file path: dubbo-go-sample/context/proto/greet.proto

```protobuf
syntax = "proto3";

package greet;

option go_package = "github.com/apache/dubbo-go-samples/context/proto;greet";

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

Source file path: dubbo-go-sample/context/go-server/main.go

```go
package main

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3/common/constant"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/protocol"
	"dubbo.apache.org/dubbo-go/v3/server"
	greet "github.com/apache/dubbo-go-samples/context/proto"
	"github.com/dubbogo/gost/log/logger"
)

type GreetTripleServer struct {
}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	attachments := ctx.Value(constant.AttachmentKey).(map[string]interface{})
	if value1, ok := attachments["key1"]; ok {
		logger.Infof("Dubbo attachment key1 = %s", value1.([]string)[0])
	}
	if value2, ok := attachments["key2"]; ok {
		logger.Infof("Dubbo attachment key2 = %s", value2.([]string)[0])
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

	if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
		panic(err)
	}

	if err := srv.Serve(); err != nil {
		logger.Error(err)
	}
}
```

### 3.2 Client Introduction

Client file, creating a client, writing variables in context, initiating a call, and printing results.

Source file path: dubbo-go-sample/context/go-client/main.go

```go
package main

import (
	"context"

	"dubbo.apache.org/dubbo-go/v3/client"
	"dubbo.apache.org/dubbo-go/v3/common/constant"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	greet "github.com/apache/dubbo-go-samples/context/proto"
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

	ctx := context.Background()
	ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]interface{}{
		"key1": "user defined value 1",
		"key2": "user defined value 2",
	})

	resp, err := svc.Greet(ctx, &greet.GreetRequest{Name: "hello world"})
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("Greet response: %s", resp.Greeting)
}

```

### 3.3 Case Effect

Start the server first, then start the client, and you can observe that the server prints the parameter values transmitted by the client through the context, indicating that the parameters were successfully passed and retrieved.

```
2024-02-26 11:13:14     INFO    logger/logging.go:42    Dubbo attachment key1 = [user defined value 1]
2024-02-26 11:13:14     INFO    logger/logging.go:42    Dubbo attachment key2 = [user defined value 2]
```
