---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/listener/http/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/listener/http/
description: Http Listener 介绍
linkTitle: Http Listener 介绍
title: Http Listener 介绍
type: docs
weight: 10
---






Http Listener 是专门负载接收 HTTP 请求的 Listener，它可以设置 HTTP 监听的地址和端口。它可以通过如下配置进行引入。

```
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP" # 表明是引入 HTTP Listener
      address:
        socket_address:
          address: "0.0.0.0" # 地址
          port: 8883 # 端口
```

Http Listener 的具体实现可以参考 `pkg/listener/http`。

有关 HTTP Listener 的案例，可以参考：
- HTTP to Dubbo 请求的转换，[案例](/zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/http_to_dubbo/)
- HTTP 请求代理，[案例](/zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/http_proxy/)

目前也支持 HTTPS 协议。可以将 `protocol_type` 修改为 `HTTPS`。并且添加 `domains` 和 `certs_dir` 来指定域名和 cert 文件目录。

```
  listeners:
    - name: "net/http"
      protocol_type: "HTTPS"
      address:
        socket_address:
          domains:
            - "sample.domain.com"
            - "sample.domain-1.com"
            - "sample.domain-2.com"
          certs_dir: $PROJECT_DIR/cert
```

具体案例可以查看 [案例](/zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/https/)