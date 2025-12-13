---
aliases:
  - /en/docs3-v2/dubbo-go-pixiu/user/networkfilter/grpc/
  - /en/docs3-v2/dubbo-go-pixiu/user/networkfilter/grpc/
description: Introduction to Grpc NetWorkFilter
linkTitle: Introduction to Grpc NetWorkFilter
title: Introduction to Grpc NetWorkFilter
type: docs
weight: 20
---

# Using grpc to Call Service Providers

> [The following documentation conforms to the code](https://github.com/apache/dubbo-go-pixiu-samples/blob/main/http/grpc/pixiu/conf.yaml)

## Define Pixiu Configuration File

```yaml
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8881
      filter_chains:
        filters:
          - name: dgp.filter.httpconnectionmanager
            config:
              route_config:
                routes:
                  - match:
                      prefix: "/api/v1"
                    route:
                      cluster: "test-grpc"
                      cluster_not_found_response_code: 505
              http_filters:
                - name: dgp.filter.http.grpcproxy
                  config:
                    path: /mnt/d/WorkSpace/GoLandProjects/dubbo-go-pixiu/samples/http/grpc/proto
                - name: dgp.filter.http.response
                  config:
              server_name: "test-http-grpc"
              generate_request_id: false
      config:
        idle_timeout: 5s
        read_timeout: 5s
        write_timeout: 5s
  clusters:
    - name: "test-grpc"
      lb_policy: "RoundRobin"
      endpoints:
        - socket_address:
            address: 127.0.0.1
            port: 50001
            protocol_type: "GRPC"
  timeout_config:
    connect_timeout: "5s"
    request_timeout: "10s"
  shutdown_config:
    timeout: "60s"
    step_timeout: "10s"
    reject_policy: "immediacy"
```

> The Grpc server is defined in the “cluster”

> Currently, HTTP requests only support JSON body parsing parameters.

## Prepare the Server

[generate pb files under with command:](https://github.com/apache/dubbo-go-pixiu-samples/tree/main/http/grpc/proto) 

```
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative hello_grpc.proto
```

## Start the Server

[Run](https://github.com/apache/dubbo-go-pixiu-samples/blob/main/http/grpc/server/app/server.go) 

```shell
go run server.go
```

## Start Pixiu

```shell
./dubbo-go-pixiu gateway start --config {CURRENT_PATH}/samples/http/grpc/pixiu/conf.yaml
```

## Test Using Curl

Run the curl command with the following:

```shell
curl http://127.0.0.1:8881/api/v1/provider.UserProvider/GetUser
```

```shell
curl http://127.0.0.1:8881/api/v1/provider.UserProvider/GetUser -X POST -d '{"userId":1}'
```

> If the response body is JSON, the `Content-Type` header will be set to `application/json`. If it is just plain text, the `Content-Type` header is `text/plain`.

