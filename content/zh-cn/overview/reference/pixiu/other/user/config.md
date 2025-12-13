---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/config/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/config/
    - /zh-cn/overview/reference/pixiu/other/user/config/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/user/config/
description: 配置文件
linkTitle: 配置文件
title: 配置文件
type: docs
weight: 20
---

### Config

Pixiu 支持使config用参数 -c 指定本地配置文件，您可以在那些样本的 pixiu 目录中找到它。
Pixiu 使用类似于 envoy 的配置抽象，如 listener、filter、route 和 cluster。
此外，pixiu 提供了另一个特定于 dubbo 的配置名为 api_config，通过它 dubbo-filter 可以将 http 请求转换为 dubbo 泛化调用。您也可以在那些样本的 pixiu 目录中找到它。
文档 Api 模型 提供了关于 pixiu 配置抽象的 api_config 规范。
本文档主要描述 pixiu 配置抽象，以下是一个示例：

```yaml

static_resources:
  listeners:
    - name: "net/http"
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
                      prefix: "/user"
                    route:
                      cluster: "user"
                      cluster_not_found_response_code: 505
              http_filters:
                - name: dgp.filter.http.httpproxy
                  config:
                - name: dgp.filter.http.response
                  config:
  clusters:
    - name: "user"
      lb_policy: "lb"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 1314
```
更多细节可以在 `pkg/model/bootstrap.go` 中找到

### static_resources 

static_resources 用于指定不变的配置，同时 dynamic_resources 用于动态配置。dynamic_resource 特性目前仍在开发中。

在 static_resources 中有四个重要的抽象：
- listener
- filter
- route
- cluster

#### listener

Listener 提供外部网络服务器功能，支持多种网络协议，如 http、http2 或 tcp。
用户可以设置协议和主机，以允许 pixiu 监听它。
当 listener 从客户端接收到请求时，它将处理它并将其传递给 filter。


#### filter

Filter 提供请求处理抽象。您可以将多个过滤器组合成过滤器链。
当 filter 从 listener 接收到请求时，它将在其预处理或后处理阶段有序地处理它。
因为 pixiu 想要提供网络协议转换功能，所以 filter 包含网络过滤器，例如 http 过滤器。
请求处理顺序如下。

```
client -> listner -> network filter such as httpconnectionmanager -> http filter chain

```

##### network filter

Pixiu 仅支持 http 协议，例如上述配置中的 `dgp.filter.httpconnectionmanager` 


##### http filter 

还有许多特定于协议的过滤器，如 http-to-grpc/http-to-dubbo 等，例如上述配置中的 `dgp.filter.http.httpproxy` 


有许多内置过滤器，如 cors/metric/ratelimit/timeout，例如上述配置中的 `dgp.filter.http.response` 


#### route

在 `filter` 处理请求后，pixiu 将通过 `route` 将请求转发到上游服务器。`route` 提供转发规则，如 path/method/header 匹配

```
routes:
- match:
    prefix: "/user"
  route:
    cluster: "user"
    cluster_not_found_response_code: 505
```

#### cluster

`cluster` 表示相同的服务实例集群，它指定上游服务器信息

clusters:
- name: "user"
  lb_policy: "lb"
  endpoints:
    - id: 1
      socket_address:
        address: 127.0.0.1
        port: 1314
```


#### Adapter

`adapter` 与服务注册中心（如 zk/nacos）通信，以获取服务实例信息，并生成 route 和 cluster 配置。
在 `pkg/adapter` 中有两个适配器。


