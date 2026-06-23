---
description: 传递附加参数 attachment
title: 传递附加参数
type: docs
weight: 4
---

Dubbo-go 提供了两种在 RPC 请求和响应 body 之外传递 metadata 的方式：

* **Attachment** 是 Dubbo RPC 的隐式参数，存放在 `context` 的 `constant.AttachmentKey` 下，常用于 filter、路由、链路追踪或业务代码传递请求级 key-value 数据。对于 Triple 调用，请求 attachment 会以 HTTP metadata header 的形式传输；对于 Dubbo 协议，attachment 会编码在协议体的固定位置。
* **Triple metadata header 和 trailer** 是 Triple 协议直接暴露给应用层的 metadata API，以 `http.Header` 的形式读写，适合应用代码直接处理请求 metadata 或响应 header/trailer。

示例源码：

* Attachment 示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/context" target="_blank">dubbo-go-samples/context</a>
* Triple header/trailer 示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/triple_header_trailer" target="_blank">dubbo-go-samples/triple_header_trailer</a>

Attachment 传递流程：

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

{{% alert title="注意" color="primary" %}}
* 对于 Triple 调用，attachment key 会归一化为小写 HTTP metadata key。传递 attachment 时建议使用小写 ASCII 业务 key。
* Triple attachment 的 value 建议使用 `string` 或 `[]string`。
* Triple metadata key 语义上大小写不敏感。读取 header 或 trailer 时，可以按标准 `http.Header` 方式使用 `Get` 和 `Values`。
* path, group, version, dubbo, token, timeout 等 key 是保留字段。自定义 key 可以通过业务前缀保持唯一性。
{{% /alert %}}

## 1.介绍

本文档先介绍如何通过 `context` 传递请求 attachment，然后介绍如何使用 Triple 请求 metadata、响应 header 和响应 trailer。

## 2.Attachment 使用说明
### 2.1客户端使用说明

在客户端中，可以通过 `constant.AttachmentKey` 传递字段，即 `"attachment"`：

```go
ctx := context.Background()
ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]interface{}{
    "key1": "user defined value 1",
    "key2": "user defined value 2",
})
```

### 2.2服务端使用说明

在服务端中，可以从 `constant.AttachmentKey` 读取字段。对于 Triple 请求，header value 会以 `[]string` 的形式保存：

```go
attachments := ctx.Value(constant.AttachmentKey).(map[string]interface{})
if value1, ok := attachments["key1"]; ok {
    logger.Infof("Dubbo attachment key1 = %s", value1.([]string)[0])
}
if value2, ok := attachments["key2"]; ok {
    logger.Infof("Dubbo attachment key2 = %s", value2.([]string)[0])
}
```

## 3.示例详解

### 3.1服务端介绍

#### 服务端proto文件

源文件路径：dubbo-go-sample/context/proto/greet.proto

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

#### 服务端handler文件

源文件路径：dubbo-go-sample/context/go-server/main.go

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

### 3.2客户端介绍

客户端client文件，创建客户端，在context写入变量，发起调用并打印结果

源文件路径：dubbo-go-sample/context/go-client/main.go

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

### 3.3 案例效果

先启动服务端，再启动客户端，可以观察到服务端打印了客户端通过context传递的参数值，说明参数被成功传递并获取

```
2024-02-26 11:13:14     INFO    logger/logging.go:42    Dubbo attachment key1 = [user defined value 1]
2024-02-26 11:13:14     INFO    logger/logging.go:42    Dubbo attachment key2 = [user defined value 2]
```

## 4. Triple Header 和 Trailer

对于 Triple 调用，Dubbo-go 也会通过 `http.Header` 向应用层暴露请求和响应 metadata。metadata key 语义上大小写不敏感，应用代码可以按标准 `http.Header` 方式使用 `Get` 和 `Values` 读取。

### 4.1 请求 Metadata

客户端可以在发起调用前写入请求 metadata：

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

服务端可以从请求 context 中读取这些 metadata：

```go
headers, ok := triple.FromIncomingContext(ctx)
if ok {
    token := headers.Get("X-Sample-Token")
    mode := headers.Get("X-Sample-Mode")
    _ = token
    _ = mode
}
```

生成的流式接口也可以通过 stream 对象读取请求 metadata：

```go
token := stream.RequestHeader().Get("X-Sample-Token")
```

### 4.2 Unary 响应 Header 和 Trailer

对于生成的 Unary 调用，服务端可以通过 `triple.SetHeader` 和 `triple.SetTrailer` 写入响应 metadata：

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

客户端可以通过 call option 捕获本次调用的响应 header 和 trailer：

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

### 4.3 Streaming 响应 Header 和 Trailer

对于生成的流式接口，响应 metadata 暴露在 stream 对象上。服务端通过 `ResponseHeader` 和 `ResponseTrailer` 写入响应 header 和 trailer：

```go
func (srv *GreetTripleServer) GreetStream(stream greet.GreetService_GreetStreamServer) error {
    stream.ResponseHeader().Set("X-Stream-Response", "value")
    stream.ResponseTrailer().Set("X-Stream-Trailer", "done")
    // 处理 stream 消息
    return nil
}
```

客户端可以从生成的 stream 对象读取响应 metadata：

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

完整可运行示例可参考 <a href="https://github.com/apache/dubbo-go-samples/tree/main/triple_header_trailer" target="_blank">dubbo-go-samples/triple_header_trailer</a>。
