---
aliases:
- /zh/docs3-v2/dubbo-go-pixiu/user/samples/mock/
- /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/mock/
- /zh-cn/overview/reference/pixiu/other/user/samples/mock/
- /zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/mock/
description: mock 案例介绍
linkTitle: mock 案例介绍
title: mock 案例介绍
type: docs
weight: 20
---

# Mock request

## Simple Demo

### Api Config
[https.md](https.md)yaml
name: pixiu
description: pixiu sample
resources:
  - path: '/api/v1/test-dubbo/mock'
    type: restful
    description: mock
    methods:
      - httpVerb: GET
        enable: true
        mock: true
        timeout: 1000ms
        inboundRequest:
          requestType: http
```

### Request

```bash
curl localhost:8888/api/v1/test-dubbo/mock -X GET 
```

### Response

```json
{
    "message": "mock success"
}
```

## TODO

我们计划在未来能够配置自定义结果。不仅通过API配置的方式，还会创建匹配规则。

[Previous](_index.md)  
