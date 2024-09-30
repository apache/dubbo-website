---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/user/listener/http/
    - /en/docs3-v2/dubbo-go-pixiu/user/listener/http/
    - /en/overview/reference/pixiu/user/listener/http/
    - /en/overview/mannual/dubbo-go-pixiu/user/listener/http/
description: Introduction to Http Listener
linkTitle: Introduction to Http Listener
title: Introduction to Http Listener
type: docs
weight: 10
---

Http Listener is a listener specifically designed to receive HTTP requests. It can set the address and port for HTTP listening. It can be introduced through the following configuration.

```
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP" # Indicates the HTTP Listener is being introduced
      address:
        socket_address:
          address: "0.0.0.0" # Address
          port: 8883 # Port
```

The specific implementation of the Http Listener can be referred to in `pkg/listener/http`.

For cases related to HTTP Listener, you can refer to:
- Conversion of HTTP to Dubbo requests, [Case](/en/overview/mannual/dubbo-go-pixiu/user/samples/http_to_dubbo/)
- HTTP request proxy, [Case](/en/overview/mannual/dubbo-go-pixiu/user/samples/http_proxy/)

Currently, the HTTPS protocol is also supported. You can change `protocol_type` to `HTTPS` and add `domains` and `certs_dir` to specify the domain and certificate file directory.

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

For specific cases, you can check [Case](/en/overview/mannual/dubbo-go-pixiu/user/samples/https/)

