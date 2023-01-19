---
title: Grpc-based health check
type: docs
weight: 2
---

## 1. Grpc health check

The Grpc health check is implemented through an ordinary user rpc call. The Grpc health check defines the following protobuf, so that the intercommunication of all Grpc protocol health checks can be realized.

> Firstly, since it is a GRPC service itself, doing a health check is in the same format as a normal rpc. Secondly, it has rich semantics such as per-service health status. Thirdly, as a GRPC service, it is able to reuse All the existing billing, quota infrastructure, etc, and thus the server has full control over the access of the health checking service.

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
    SERVICE_UNKNOWN = 3; // Used only by the Watch method.
  }
  ServingStatus status = 1;
}

service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);

  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}
```

## 2 triple health check service

+ The Dubbo-go framework will automatically register the health check service with the framework after startup, and provide health check services based on grpc health proto, without additional configuration in the configuration file.
+ The triple health check service can check the status of the service in the framework through grpc-health-probe, and can also call the health check service through grpc, but it cannot call the health check service through the triple client (the health check service based on grpc does not pass the registration Center registration), the called service name is "grpc.health.v1.Health", and the interface is check.

### 2.1 Call the health check service through the gprc client:

+ Start [triple service](https://github.com/apache/dubbo-go-samples/tree/master/rpc/triple/pb/dubbogo-grpc/go-server) in dubbo-go-samples, through The following grpc client can view the status of "org.apache.dubbogo.samples.api.Greeter". The triple health check service communicates with grpc, so the health status of services based on the triple protocol can be checked through the grpc client.

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
ctx := context. Background()
rsp, err := healthpb. NewHealthClient(conn). Check(ctx, req)
if err != nil {
panic(err)
}
fmt.Printf("get service status = %+v\n", rsp)
}
```

### 2.2 grpc-health-probe debugging health check service:

+ Start [triple service](https://github.com/apache/dubbo-go-samples/tree/master/rpc/triple/pb/dubbogo-grpc/go-server) in dubbo-go-samples, provide `org.apache.dubbogo.samples.api.Greeter` service. Use grpc-health-probe to check the health status of the service, `grpc-health-probe -addr=localhost:20000 -service "org.apache.dubbogo.samples.api.Greeter"`

![image-health-check](/imgs/docs3-v2/golang-sdk/tasks/service_management/triple-health-check/health-check.png)

#### refer to:

+ https://github.com/grpc/grpc/blob/master/doc/health-checking.md
+ https://github.com/grpc/grpc-go/tree/master/health