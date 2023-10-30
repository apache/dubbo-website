---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/health/triple-health-check/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/health/triple-health-check/
description: 基于Grpc的健康检查
title: 基于Grpc的健康检查
type: docs
weight: 2
---






## 1. Grpc健康检查

Grpc健康检查是通过一个普通的用户rpc调用进行实现，Grpc的健康检查定义了如下的protobuf，这样就能实现所有的Grpc协议健康检查的互通。

> Firstly, since it is a GRPC service itself, doing a health check is in the same format as a normal rpc. Secondly, it has rich semantics such as per-service health status. Thirdly, as a GRPC service, it is able reuse all the existing billing, quota infrastructure, etc, and thus the server has full control over the access of the health checking service.

``` protobuf
syntax = "proto3";

package grpc.health.v1;

message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;  // Used only by the Watch method.
  }
  ServingStatus status = 1;
}

service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);

  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}
```

## 2 triple健康检查服务

+ Dubbo-go框架在启动后会自动向框架中注册健康检查服务，提供基于grpc health proto的健康检查服务，无需在配置文件中额外配置。
+ triple健康检查服务可以通过grpc-health-probe检查框架中服务的状态，也可以通过grpc调用该健康检查服务，但是不能通过triple客户端调用该健康检查服务(基于grpc的健康检查服务不通过注册中心注册)，调用的服务名为“grpc.health.v1.Health”，接口为check。

### 2.1 通过gprc客户端调用健康检查服务：

+ 启动dubbo-go-samples中的[triple服务](https://github.com/apache/dubbo-go-samples/tree/master/rpc/triple/pb/dubbogo-grpc/go-server)，通过下面的grpc客户端便可以查看"org.apache.dubbogo.samples.api.Greeter"的状态。triple健康检查服务与grpc互通，所以可以通过grpc客户端查看基于triple协议服务的健康状态。

``` go
package main

import (
	"context"
	"fmt"
	"log"
)

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
)

const (
	address = "localhost:20000"
)

func main() {
	// Set up a connection to the server
	conn, err := grpc.Dial(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}

	defer func() {
		_ = conn.Close()
	}()
	
	checkHealth("org.apache.dubbogo.samples.api.Greeter", conn)
}

func checkHealth(service string, conn *grpc.ClientConn) {
	fmt.Printf(">>>>> gRPC-go check %s status", service)

	req := &healthpb.HealthCheckRequest{
		Service: service,
	}
	ctx := context.Background()
	rsp, err := healthpb.NewHealthClient(conn).Check(ctx, req)
	if err != nil {
		panic(err)
	}
	fmt.Printf("get service status = %+v\n", rsp)
}
```

### 2.2 grpc-health-probe调试健康检查服务：

+ 启动dubbo-go-samples中的[triple服务](https://github.com/apache/dubbo-go-samples/tree/master/rpc/triple/pb/dubbogo-grpc/go-server)，提供`org.apache.dubbogo.samples.api.Greeter`服务。使用grpc-health-probe检查该服务的健康状态，`grpc-health-probe -addr=localhost:20000 -service "org.apache.dubbogo.samples.api.Greeter"`

![image-health-check](/imgs/docs3-v2/golang-sdk/tasks/service_management/triple-health-check/health-check.png)

#### 参考：

+ https://github.com/grpc/grpc/blob/master/doc/health-checking.md
+ https://github.com/grpc/grpc-go/tree/master/health