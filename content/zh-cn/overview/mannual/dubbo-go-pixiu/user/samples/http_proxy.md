---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/samples/http_proxy/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/http_proxy/
description: Http Proxy 案例介绍
linkTitle: Http Proxy 案例介绍
title: Http Proxy 案例介绍
type: docs
weight: 10
---






### HTTP 代理

HTTP 代理案例展示了 Pixiu 接收外界 HTTP 请求然后转发给背后的 HTTP Server 的功能。

![img](/imgs/pixiu/user/samples/http_proxy.png)

案例代码具体查看 `/samples/http/simple`。案例中的目录结构和作用如下所示：

```
- pixiu # pixiu 配置文件
- server # http server
- test # client or unit test
```


我们来具体看一下有关 pixiu 的具体配置文件。

```
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP" # 使用 HTTP Listener
      address:
        socket_address:
          address: "0.0.0.0" # 监听地址设置为 0.0.0.0
          port: 8888  # 端口设置为 8888
      filter_chains:
          filters:
            - name: dgp.filter.httpconnectionmanager  # NetworkFilter 设置为 httpconnectionmanager
              config:
                route_config:
                  routes:
                    - match:
                        prefix: "/user"    # 设置路由规则，将 /user 前缀的请求转发给名称为 user 的 cluster 集群
                      route:
                        cluster: "user"
                        cluster_not_found_response_code: 505
                http_filters:
                  - name: dgp.filter.http.httpproxy  # 使用 dgp.filter.http.httpproxy 这个 HttpFilter 来进行转发
                    config:

  clusters:
    - name: "user"  # 配置一个名称为 user 的 集群，其中有一个实例，地址是 127.0.0.1:1314
      lb_policy: "random" 
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 1314
```


可以先启动 `Server` 文件夹下的 Http Server，然后再使用如下命令启动 `Pixiu`，最后执行 test 文件夹下的单元测试。注意，-c 后是本地配置文件的绝对路径。

```
pixiu gateway start -c /pixiu/conf.yaml
```