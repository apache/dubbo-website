---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/samples/jaeger/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/jaeger/
    - /zh-cn/overview/reference/pixiu/user/samples/jaeger/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/jaeger/
description: 使用 Jaeger 进行追踪
linkTitle: 使用 Jaeger 进行追踪
title: 使用 Jaeger 进行追踪
type: docs
weight: 20
---



#### 使用 Jaeger 进行追踪


有一个tracing filter，通过它我们可以为 pixiu 添加追踪功能


```go
http_filters:
- name: dgp.filters.tracing
  config:
    url: http://127.0.0.1:14268/api/traces
    type: jaeger
```

您可以在 samples/dubbogo/simple/jaeger 中快速启动演示来体验
