---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/configurations/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/configurations/
description: 启动和配置
linkTitle: 启动和配置
title: 启动和配置
type: docs
weight: 20
---






### Pixiu 启动命令

Pixiu 分为两个形态 Gateway 和 Sidecar，目前 Pixiu 可执行程序的命令如下所示，其中 pixiu 是可执行文件名称。注意，-c 后是本地配置文件的绝对路径。

```
pixiu gateway start -c /config/conf.yaml
```

### 配置详解 

Pixiu 接受 yaml 格式的文件作为其主配置文件，其中对 Pixiu 的各类组件进行配置。我们以快速开始中的配置文件为例，详细讲解其中的组成部分，并且列出可能的扩展。

```
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8883
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
```

首先，类似 `envoy`的配置，`static_resources` 表示如下都是静态配置。在静态配置中包括 Listener，NetworkFilter，Route，HttpFilter等组件，它们之间并不是完全独立的。

#### Listener

比如说上述配置就声明了一个监听本地 8883 端口的 HTTP 类型的 Listener，更多 Listener 的配置可以查看 [Listener](../listener/http/)。

```
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8883
      filter_chains:
```
listeners 的配置有 `protocol_type` 表示是 HTTP 类型的 Listener，`address` 则配置了监听的地址和端口，`filter_chains` 则指定了该 Listener 接收到请求要交由哪些 NetworkFilter 处理。

#### NetworkFilter

NetworkFilter 是 Pixiu 的关键组件之一，它可以有 Route 和 HttpFilter 一起组成，负责接收 Listener 传递而来的请求并进行处理。

```
filters:
            - name: dgp.filter.httpconnectionmanager
              config:
                route_config:
                http_filters:
```

上述配置指明了使用 `dgp.filter.httpconnectionmanager` 这款 NetworkFilter，它能够接收 Http 请求的 `Request` 和 `Response` 进行处理，并且可以配置 Route 路由信息和使用 HttpFilter 对请求进行链式处理。更多的 NetworkFilter 可以查看 [NetworkfFilter文档](../networkfilter/http/)



#### Route 路由 和 Cluster 集群

route 可以用于对请求进行路由分发，以下面配置为例。具体配置文件可以查看 `/samples/http/simple` 案例的配置文件

```
            - name: dgp.filter.httpconnectionmanager
              config:
                route_config:
                  routes:
                    - match:
                        prefix: "/user"
                      route:
                        cluster: "user"
```

上述配置指定了对于 Path 的前缀为 `/user` 的 HTTP 请求，转发给名称为 user 的 cluster 服务集群中。

而具体 cluster 集群的定义如下所示：

```
  clusters:
    - name: "user"
      lb_policy: "RoundRobin"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 1314
```

上述配置定义了名为 user 的 cluster 集群信息，它的负载均衡策略是 RoundRobin，然后它包含一个 endpoint 实例，其地址是 127.0.0.1。

目前，在转发 HTTP 请求或者 Grpc 请求的场景下需要使用 Route 和 Cluster，而涉及到转发 Dubbo 相关请求的场景下暂时不需要二者。

#### HttpFilter

当 NetworkFilter 接收到 Listener 传来的请求后，需要对其进行系列操作，例如限流、鉴权等，最后还需要将这个请求转发给具体上游服务。这些工作都交给 NetworkFilter 所持有的 HttpFilter 链进行处理。

```
            - name: dgp.filter.httpconnectionmanager
              config:
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
```

如上配置所示，`httpconnectionmanager` 这个 NetworkFilter 下有一个 HttpFilter chain。其中包括 `dgp.filter.http.dubboproxy` 这一款 HttpFilter。
它负责将 HTTP 请求转换为 Dubbo 请求，并转发出去。它需要配置一个 Dubbo 集群注册中心的地址信息，指定其为 zookeeper 中间件。其中 `auto_resolve` 则指定使用 HTTP to Dubbo 默认转换协议来进行相关数据转换，具体可以参考[《默认转换协议》](../appendix/http-to-dubbo-default-stragety/)。

更多的 HttpFilter 可以查看 [HttpFilter文档](../httpfilter/dubbo/)。

#### Adapter

Adapter 代表 Pixiu 和外界元数据中心交互的能力。目前有两款，分别是 `dgp.adapter.dubboregistrycenter` 和 `dgp.adapter.springcloud`，分别代表从 Dubbo 集群注册中心和 Spring Cloud 集群注册中心获取服务实例信息，构建 Pixiu 转发 Http 请求路由规则的。

更多的 Adapter 可以查看 [Adapter文档](../adapter/dubbo/)。