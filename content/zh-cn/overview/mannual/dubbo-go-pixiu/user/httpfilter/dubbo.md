---
aliases:
  - /zh/docs3-v2/dubbo-go-pixiu/user/httpfilter/dubbo/
  - /zh-cn/docs3-v2/dubbo-go-pixiu/user/httpfilter/dubbo/
description: Dubbo HttpFilter 介绍
linkTitle: Dubbo HttpFilter 介绍
title: Dubbo HttpFilter 介绍
type: docs
weight: 10
---

# 使用 HTTP 调用 Dubbo

## 定义Pixiu配置文件

```yaml
static_resources:
  listeners:
    - name: "http-listener"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8888
      filter_chains:
        filters:
          - name: dgp.filter.httpconnectionmanager
            config:
              route_config:
                routes:
                  - match:
                      prefix: "*"
              http_filters:
                - name: dgp.filter.http.dubboproxy
                  config:
                    dubboProxyConfig:
                      auto_resolve: true
                      registries:
                        "zookeeper":
                          protocol: "zookeeper"
                          timeout: "3s"
                          address: "127.0.0.1:2181"
                          username: ""
                          password: ""
                      timeout_config:
                        connect_timeout: 5s
                        request_timeout: 5s
  clusters:
    - name: "dubbo-server"
      lb_policy: "lb"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 20000
  shutdown_config:
    timeout: "60s"
    step_timeout: "10s"
    reject_policy: "immediacy"
```

## 准备Dubbo服务

### 启动zookeeper,需要提前准备好docker和compose，如果本地有的话可以忽略

[docker-compose.yml](https://github.com/apache/dubbo-go-pixiu-samples/blob/main/dubbohttpproxy/docker/docker-compose.yml)

```shell
docker-compose -f {CURRENT_PATH}/dubbo-go-pixiu-samples/dubbohttpproxy/docker/docker-compose.yml && docker-compose up -d
```

### 启动 Dubbo Server

[Run](https://github.com/apache/dubbo-go-pixiu-samples/tree/main/dubbohttpproxy/server/dubbo/app)

```shell
export DUBBO_GO_CONFIG_PATH={CURRENT_PATH}/dubbo-go-pixiu-samples/dubbohttpproxy/server/dubbo/profiles/dev/server.yml
go run .
```

## 启动 Pixiu

```shell
./dubbo-go-pixiu gateway start --config {CURRENT_PATH}pixiu/conf.yaml
```

## 使用 curl 来做查询和更新

使用以下命令运行命令 curl：

> 查询

```shell
curl http://localhost:8888/UserService/com.dubbogo.pixiu.UserService/GetUserByName -X POST \
  -H 'Content-Type: application/json' \
  -H 'x-dubbo-http1.1-dubbo-version: 1.0.0' \
  -H 'x-dubbo-service-protocol: dubbo' \
  -H 'x-dubbo-service-version: 1.0.0' \
  -H 'x-dubbo-service-group: test' \
  -d '{"types":"string","values":"tc"}'
```

> 更新

```shell
curl http://localhost:8888/UserService/com.dubbogo.pixiu.UserService/UpdateUserByName -X POST \
  -H 'Content-Type: application/json' \
  -H 'x-dubbo-http1.1-dubbo-version: 1.0.0' \
  -H 'x-dubbo-service-protocol: dubbo' \
  -H 'x-dubbo-service-version: 1.0.0' \
  -H 'x-dubbo-service-group: test' \
  -d '{"types":"string,object","values":["tc",{"id":"0001","code":1,"name":"tc","age":15}]}'
```