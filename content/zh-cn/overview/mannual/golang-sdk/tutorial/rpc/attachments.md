---
description: 传递附加参数 attachment
title: 传递附加参数
type: docs
weight: 4
---

**理解隐式参数传递的最直接方式 http header，它的工作方式与 http header 完全一致，在 GET 或 POST 请求体之外可以传递任意多个 header 参数**。而对于 RPC 调用而言，context就是在方法签名的参数之外提供附加参数传递能力，在实现原理上，对于不同的协议，attachment 的实现方式略有不同：
* 对于 triple 协议，attachment 会转换为标准的 http header 进行传输。
* 对于 dubbo 协议，attachment 是编码在协议体的固定位置进行传输，具体请参见 dubbo 协议规范。、

![/user-guide/images/context.png](/imgs/user/context.png)

{{% alert title="注意" color="primary" %}}
* 在使用 triple 协议时，由于 http header 的限制，仅支持小写的 ascii 字符
* path, group, version, dubbo, token, timeout 等一些 key 是保留字段，传递 attachment 时应避免使用，尽量通过业务前缀等确保 key 的唯一性。
{{% /alert %}}

## 1.介绍

本文档演示如何在 Dubbo-go 框架中使用 context 上下文传递和读取附加参数，来实现上下文信息传递，可在此查看  <a href="https://github.com/apache/dubbo-go-samples/tree/main/context" target="_blank">完整示例源码地址</a>

## 2.使用说明
### 2.1客户端使用说明

在客户端中，使用下述方式传递字段, 示例中 key 为 `constant.AttachmentKey` 即 "attachment":

```go
	ctx := context.Background()
	ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]interface{}{
        "key1": "user defined value 1",
        "key2": "user defined value 2"
	})
```

### 2.2服务端使用说明

在服务端中，使用下述方式获取字段, value的类型为 map[string]interface{}：
```go
    attachments := ctx.Value(constant.AttachmentKey).(map[string]interface{})
    logger.Infof("Dubbo attachment key1 = %s", value1.([]string)[0])
    logger.Infof("Dubbo attachment key2 = %s", value2.([]string)[0])
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
