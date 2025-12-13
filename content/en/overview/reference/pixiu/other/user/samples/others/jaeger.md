---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/user/samples/others/jaeger
    - /en/docs3-v2/dubbo-go-pixiu/user/samples/others/jaeger
    - /en/overview/reference/pixiu/other/user/samples/others/jaeger
    - /en/overview/mannual/dubbo-go-pixiu/user/samples/others/jaeger
description: Jaeger
linkTitle: Jaeger
title: Jaeger
type: docs
weight: 20
---

#### Tracing with Jaeger


There is a tracing filter, by which we can add tracing function for pixiu


```go
http_filters:
- name: dgp.filters.tracing
  config:
    url: http://127.0.0.1:14268/api/traces
    type: jaeger
```

you can quick start the demo in samples/dubbogo/simple/jaeger for experience
