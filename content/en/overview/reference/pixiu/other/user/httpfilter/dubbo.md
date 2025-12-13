---
aliases:
  - /en/docs3-v2/dubbo-go-pixiu/user/httpfilter/dubbo/
  - /en/docs3-v2/dubbo-go-pixiu/user/httpfilter/dubbo/
description: Introduction to Dubbo HttpFilter
linkTitle: Introduction to Dubbo HttpFilter
title: Introduction to Dubbo HttpFilter
type: docs
weight: 10
---

# Using HTTP to Call Dubbo

## Define Pixiu Configuration File

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

## Prepare Dubbo Service

### Start zookeeper, ensure docker and compose are prepared in advance. If available locally, this can be ignored.

[docker-compose.yml](https://github.com/apache/dubbo-go-pixiu-samples/tree/main/dubbohttpproxy/server/dubbo/app)

```shell
docker-compose -f {CURRENT_PATH}/dubbo-go-pixiu-samples/dubbohttpproxy/docker/docker-compose.yml && docker-compose up -d
```

### Start Dubbo Server

[Run](https://github.com/apache/dubbo-go-pixiu-samples/tree/main/dubbohttpproxy/server/dubbo/app)

```shell
export DUBBO_GO_CONFIG_PATH={CURRENT_PATH}/dubbo-go-pixiu-samples/dubbohttpproxy/server/dubbo/profiles/dev/server.yml
go run .
```

## Start Pixiu

```shell
./dubbo-go-pixiu gateway start --config {CURRENT_PATH}pixiu/conf.yaml
```

## Use curl for querying and updating

Run the following curl command:

> Query

```shell
curl http://localhost:8888/UserService/com.dubbogo.pixiu.UserService/GetUserByName -X POST \
  -H 'Content-Type: application/json' \
  -H 'x-dubbo-http1.1-dubbo-version: 1.0.0' \
  -H 'x-dubbo-service-protocol: dubbo' \
  -H 'x-dubbo-service-version: 1.0.0' \
  -H 'x-dubbo-service-group: test' \
  -d '{"types":"string","values":"tc"}'
```

> Update

```shell
curl http://localhost:8888/UserService/com.dubbogo.pixiu.UserService/UpdateUserByName -X POST \
  -H 'Content-Type: application/json' \
  -H 'x-dubbo-http1.1-dubbo-version: 1.0.0' \
  -H 'x-dubbo-service-protocol: dubbo' \
  -H 'x-dubbo-service-version: 1.0.0' \
  -H 'x-dubbo-service-group: test' \
  -d '{"types":"string,object","values":["tc",{"id":"0001","code":1,"name":"tc","age":15}]}'
```
