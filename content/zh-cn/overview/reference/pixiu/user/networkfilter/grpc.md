---
aliases:
  - /zh/docs3-v2/dubbo-go-pixiu/user/networkfilter/grpc/
  - /zh-cn/docs3-v2/dubbo-go-pixiu/user/networkfilter/grpc/
description: Grpc NetWorkFilter 介绍
linkTitle: Grpc NetWorkFilter 介绍
title: Grpc NetWorkFilter 介绍
type: docs
weight: 20
---

# 使用 grpc 调用服务提供程序

> [下面的文档符合代码](https://github.com/apache/dubbo-go-pixiu-samples/blob/main/http/grpc/pixiu/conf.yaml)

## 定义Pixiu配置文件

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

> Grpc 服务器在“集群”中定义

> 目前 http 请求仅支持 json body 解析参数

## 准备服务器

[generate pb files under with command:](https://github.com/apache/dubbo-go-pixiu-samples/tree/main/http/grpc/proto) 

```
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative hello_grpc.proto
```

## 启动 Server

[Run](https://github.com/apache/dubbo-go-pixiu-samples/blob/main/http/grpc/server/app/server.go) 

```shell
go run server.go
```

## 启动 Pixiu

```shell
./dubbo-go-pixiu gateway start --config {CURRENT_PATH}/samples/http/grpc/pixiu/conf.yaml
```

## 使用 curl 进行测试

使用以下命令运行命令 curl：

```shell
curl http://127.0.0.1:8881/api/v1/provider.UserProvider/GetUser
```

```shell
curl http://127.0.0.1:8881/api/v1/provider.UserProvider/GetUser -X POST -d '{"userId":1}'
```

> 如果响应正文是 json，则`Content-Type`的标头将设置为`application/json`。如果它只是一个纯文本，则`Content-Type`的标题是`text/plain`。
