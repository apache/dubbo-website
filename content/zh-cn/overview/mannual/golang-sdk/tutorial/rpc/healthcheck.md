---
description: 健康检查
title: 健康检查
type: docs
weight: 3
---

## 背景

Dubbo-go 内置了基于 triple 协议的健康检查服务，帮助用户管理和监测服务健康状态，可在此查看 <a href="https://github.com/apache/dubbo-go-samples/tree/main/healthcheck" target="_blank">完整示例源码</a>。

## 使用方法

- 框架在通过 `instance` 启动后会自动向框架中注册健康检查服务 `grpc.health.v1.Health`，用于记录并对外暴露每个triple服务的健康状态。
- 健康检查服务可以通过发起 http 请求检查框架中服务的状态，也可以通过客户端调用该健康检查服务，调用的接口为`grpc.health.v1.Health`，方法为 `check`。

## 1、通过客户端调用健康检查服务

启动 dubbo-go-samples/healthcheck/go-server 中的服务，通过下方客户端即可查看 `greet.GreetService` 的状态。

```go
package main

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3/client"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	health "dubbo.apache.org/dubbo-go/v3/protocol/triple/health/triple_health"
	"github.com/dubbogo/gost/log/logger"
)

func main() {
	cli, err := client.NewClient(
		client.WithClientURL("tri://127.0.0.1:20000"),
	)
	if err != nil {
		panic(err)
	}
	svc, err := health.NewHealth(cli)
	if err != nil {
		panic(err)
	}
	check, err := svc.Check(context.Background(), &health.HealthCheckRequest{Service: "greet.GreetService"})
	if err != nil {
		logger.Error(err)
	} else {
		logger.Info("greet.GreetService's health", check.String())
	}
	watch, err := svc.Watch(context.Background(), &health.HealthCheckRequest{Service: "greet.GreetService"})
	if err != nil {
		logger.Error(err)
	} else {
		if watch.Recv() {
			logger.Info("greet.GreetService's health", watch.Msg().String())
		}
	}
}
```

启动后会有以下输出

```sh
[greet.GreetService's health status:SERVING]
[greet.GreetService's health status:SERVING]
```

## 2.通过发起http请求检查服务健康状态

启动 dubbo-go-samples/healthcheck/go-server 中的服务，发起下方http请求即可查看 `greet.GreetService` 的状态：

```http
POST /grpc.health.v1.Health/Check
Host: 127.0.0.1:20000
Content-Type: application/json

{"service":"greet.GreetService"}
```

将会有以下输出

```http
{
  "status": "SERVING"
}
```


## 更多内容
值得注意的是，当前框架中尚未建立完整的服务状态管理机制，dubbo-go 框架会将所有加载的服务设置为 `SERVING` 状态，但尚没有 `NOT SERVING` 设置机制（在满足某个特定条件的情况下将服务状态设置为 NOT SERVING）。

如果有需要，用户可通过扩展 dubbo-go 框架的方式，提供完整的服务状态管理能力，这样就可以查询到实时更新的服务状态，并根据服务状态进行流量转发。

部分参考资料：
+ https://github.com/grpc/grpc/blob/master/doc/health-checking.md
+ https://github.com/grpc/grpc-go/tree/master/health
