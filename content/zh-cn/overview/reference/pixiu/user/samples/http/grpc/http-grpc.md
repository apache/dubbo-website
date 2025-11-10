# 使用 grpc 调用服务提供程序

> 以下文档提到的内容适用于 `samples/http/grpc` 中的代码

## 定义 Pixiu 配置

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

> Grpc 服务端定义在 `clusters`

> 警告：当前 http 请求仅支持 json 主体来解析参数

## 为服务端做准备

使用命令在 `samples/http/grpc/proto` 下生成 pb 文件：

```
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative hello_grpc.proto
```

## 启动服务端 

运行 `samples/http/grpc/server/app/server.go`

```
go run server.go
```

## 构建 dubbo-go-pixiu

```
go build -o dubbo-go-pixiu cmd/pixiu/*
```

或者在 Windows 上，您需要进入 `cmd/pixiu` 目录下构建二进制文件
```
go build -o dubbo-go-pixiu.exe .
```

## 启动 Pixiu

```
./dubbo-go-pixiu gateway start --config samples/http/grpc/pixiu/conf.yaml --log-config samples/http/grpc/pixiu/log.yml
```

## 使用 Curl 测试

运行 curl 命令：

```
curl http://127.0.0.1:8881/api/v1/provider.UserProvider/GetUser
```

and 

```
curl http://127.0.0.1:8881/api/v1/provider.UserProvider/GetUser -X POST -d '{"userId":1}'
```

> 如果响应主体是 json，则 'content-type' 头部将设置为 'application/json'。如果只是纯文本，则 'content-type' 头部为 'text/plain'。
