---
description: Health Check
title: Health Check
type: docs
weight: 3
---

## Background

Dubbo-go has a built-in health check service based on the triple protocol to help users manage and monitor the health status of services. You can view the <a href="https://github.com/apache/dubbo-go-samples/tree/main/healthcheck" target="_blank">complete example source code</a> here.

## Usage

- The framework automatically registers the health check service `grpc.health.v1.Health` into the framework after starting via `instance`, which records and exposes the health status of each triple service.
- The health check service can check the status of services in the framework by making an HTTP request or through client calls to the health check service. The interface called is `grpc.health.v1.Health`, and the method is `check`.

## 1. Call the health check service through the client

Start the service in dubbo-go-samples/healthcheck/go-server, and the status of `greet.GreetService` can be viewed through the client below.

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

Once started, the following output will appear

```sh
[greet.GreetService's health status:SERVING]
[greet.GreetService's health status:SERVING]
```

## 2. Check the health status of the service by making an HTTP request

Start the service in dubbo-go-samples/healthcheck/go-server, and make the HTTP request below to view the status of `greet.GreetService`:

```http
POST /grpc.health.v1.Health/Check
Host: 127.0.0.1:20000
Content-Type: application/json

{"service":"greet.GreetService"}
```

The following output will appear

```http
{
  "status": "SERVING"
}
```

## More Content
It is worth noting that the current framework does not yet establish a complete service status management mechanism. The dubbo-go framework will set all loaded services to `SERVING` status, but there is currently no `NOT SERVING` setting mechanism (to set the service status to NOT SERVING under a specific condition).

If necessary, users can extend the dubbo-go framework to provide complete service status management capabilities, allowing for real-time updated service status queries and traffic forwarding based on service status.

Reference materials:
+ https://github.com/grpc/grpc/blob/master/doc/health-checking.md
+ https://github.com/grpc/grpc-go/tree/master/health

