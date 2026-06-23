---
description: Passing Additional Parameters Attachment
title: Passing Additional Parameters
type: docs
weight: 4
---

Dubbo-go provides two related ways to pass metadata outside the RPC request and response body:

* **Attachments** are Dubbo RPC implicit parameters. They are stored in `context` under `constant.AttachmentKey` and are commonly used by filters, routing, tracing, or business code that needs request-scoped key-value data. For Triple calls, request attachments are carried as HTTP metadata headers. For Dubbo protocol calls, attachments are encoded in a fixed location in the protocol body.
* **Triple metadata headers and trailers** are Triple protocol metadata APIs exposed as `http.Header`. They are useful when application code needs direct access to request metadata or response header/trailer data.

Sample source code:

* Attachment sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/context" target="_blank">dubbo-go-samples/context</a>
* Triple header/trailer sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/triple_header_trailer" target="_blank">dubbo-go-samples/triple_header_trailer</a>

Attachment flow:

```text
┌───── Consumer side ──────────┐
│                              │
│  ┌──────────────────────┐    │
│  │ context.Context      │    │
│  │ AttachmentKey        │    │
│  │ map[string]any       │    │
│  └──────────┬───────────┘    │
│             │                │
│             ▼                │
│  ┌──────────────────────┐    │
│  │ RPCInvocation        │    │
│  │ Attachments()        │    │
│  └──────────┬───────────┘    │
│             │                │
└─────────────┼────────────────┘
              │
              ▼
       ┌────────────────┐
       │ Protocol       │
       │ metadata       │
       │                │
       │ Triple: header │
       │ Dubbo : body   │
       └───────┬────────┘
               │
               │ network
               ▼
┌──────────────┼─── Provider side ────┐
│              ▼                      │
│       ┌────────────────┐            │
│       │ Protocol       │            │
│       │ metadata       │            │
│       └───────┬────────┘            │
│               │                     │
│               ▼                     │
│  ┌──────────────────────┐           │
│  │ RPCInvocation        │           │
│  │ Attachments()        │           │
│  └──────────┬───────────┘           │
│             │                       │
│             ▼                       │
│  ┌──────────────────────┐           │
│  │ context.Context      │           │
│  │ AttachmentKey        │           │
│  │ map[string]any       │           │
│  └──────────┬───────────┘           │
│             │                       │
│             ▼                       │
│  ┌──────────────────────┐           │
│  │ Filter / Service     │           │
│  │ implementation       │           │
│  └──────────────────────┘           │
│                                     │
└─────────────────────────────────────┘
```

{{% alert title="Note" color="primary" %}}
* For Triple calls, attachment keys are normalized to lowercase HTTP metadata keys. Use lowercase ASCII business keys when passing attachments.
* Attachment values should be `string` or `[]string` for Triple calls.
* Triple metadata keys are case-insensitive. Use standard `http.Header` accessors such as `Get` and `Values` when reading headers or trailers.
* Keys such as path, group, version, dubbo, token, timeout, etc., are reserved fields. Use a business prefix to keep custom keys unique.
{{% /alert %}}

## 1. Introduction

This document first shows how to pass request attachments through `context`, and then shows how to use Triple request metadata, response headers, and response trailers.

## 2. Attachment Usage Instructions
### 2.1 Client Usage Instructions

In the client, fields can be passed through `constant.AttachmentKey`, i.e. `"attachment"`:

```go
ctx := context.Background()
ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]interface{}{
    "key1": "user defined value 1",
    "key2": "user defined value 2",
})
```

### 2.2 Server Usage Instructions

In the server, fields can be retrieved from `constant.AttachmentKey`. For Triple requests, header values are stored as `[]string`:

```go
attachments := ctx.Value(constant.AttachmentKey).(map[string]interface{})
if value1, ok := attachments["key1"]; ok {
    logger.Infof("Dubbo attachment key1 = %s", value1.([]string)[0])
}
if value2, ok := attachments["key2"]; ok {
    logger.Infof("Dubbo attachment key2 = %s", value2.([]string)[0])
}
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

## 4. Triple Header and Trailer

For Triple calls, Dubbo-go also exposes request and response metadata through `http.Header`. Metadata keys are case-insensitive, so application code can use the standard `http.Header` accessors such as `Get` and `Values`.

### 4.1 Request Metadata

The client can attach request metadata before initiating a call:

```go
import (
    "context"
    "net/http"

    triple "dubbo.apache.org/dubbo-go/v3/protocol/triple/triple_protocol"
)

ctx := triple.NewOutgoingContext(context.Background(), http.Header{
    "X-Sample-Token": []string{"token"},
})
ctx = triple.AppendToOutgoingContext(ctx, "X-Sample-Mode", "metadata")

resp, err := svc.Greet(ctx, &greet.GreetRequest{Name: "hello"})
```

The server can read the incoming metadata from the request context:

```go
headers, ok := triple.FromIncomingContext(ctx)
if ok {
    token := headers.Get("X-Sample-Token")
    mode := headers.Get("X-Sample-Mode")
    _ = token
    _ = mode
}
```

Generated streaming handlers can also read request metadata from the generated stream object:

```go
token := stream.RequestHeader().Get("X-Sample-Token")
```

### 4.2 Unary Response Header and Trailer

For generated unary calls, the server can write response metadata with `triple.SetHeader` and `triple.SetTrailer`:

```go
func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
    if err := triple.SetHeader(ctx, http.Header{
        "X-Response-Token": []string{"value"},
    }); err != nil {
        return nil, err
    }
    if err := triple.SetTrailer(ctx, http.Header{
        "X-Response-Trailer": []string{"done"},
    }); err != nil {
        return nil, err
    }
    return &greet.GreetResponse{Greeting: req.Name}, nil
}
```

The client can capture the response header and trailer for this call with call options:

```go
var responseHeader http.Header
var responseTrailer http.Header

resp, err := svc.Greet(
    ctx,
    &greet.GreetRequest{Name: "hello"},
    client.WithResponseHeader(&responseHeader),
    client.WithResponseTrailer(&responseTrailer),
)
if err != nil {
    return err
}

headerValue := responseHeader.Get("X-Response-Token")
trailerValue := responseTrailer.Get("X-Response-Trailer")
_ = resp
_ = headerValue
_ = trailerValue
```

### 4.3 Streaming Response Header and Trailer

For generated streaming handlers, response metadata is available on the stream object. The server writes response header and trailer through `ResponseHeader` and `ResponseTrailer`:

```go
func (srv *GreetTripleServer) GreetStream(stream greet.GreetService_GreetStreamServer) error {
    stream.ResponseHeader().Set("X-Stream-Response", "value")
    stream.ResponseTrailer().Set("X-Stream-Trailer", "done")
    // handle stream messages
    return nil
}
```

The client reads the response metadata from the generated stream object:

```go
stream, err := svc.GreetStream(ctx)
if err != nil {
    return err
}

headerValue := stream.ResponseHeader().Get("X-Stream-Response")
trailerValue := stream.ResponseTrailer().Get("X-Stream-Trailer")
_ = headerValue
_ = trailerValue
```

A complete runnable example is available in <a href="https://github.com/apache/dubbo-go-samples/tree/main/triple_header_trailer" target="_blank">dubbo-go-samples/triple_header_trailer</a>.
