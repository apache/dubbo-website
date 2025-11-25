---
aliases:
- /en/docs3-v2/dubbo-go-pixiu/user/samples/dubbo/http-body
- /en/docs3-v2/dubbo-go-pixiu/user/samples/dubbo/http-body
- /en/overview/reference/pixiu/user/samples/dubbo/http-body
- /en/overview/mannual/dubbo-go-pixiu/user/samples/dubbo/http-body
description: HTTP Body
linkTitle: HTTP Body
title: HTTP Body
type: docs
weight: 10
---

# Get the parameter from the body

> POST request

## Passthroughs

### Api Config

```yaml
name: pixiu
description: pixiu sample
resources:
  - path: '/api/v1/test-http/user'
    type: restful
    description: user
    methods:
      - httpVerb: POST
        enable: true
        timeout: 10s
        inboundRequest:
          requestType: http
        integrationRequest:
          requestType: http
          host: "127.0.0.1:1314"
          path: "/user/"
```

### Request

```bash
curl host:port/api/v1/test-http/user -X POST -d '{"name": "tiecheng1","code": 4,"age": 18}' --header "Content-Type: application/json"
```

### Response

- If first add, return like:

```json
{
  "id": "XVlBz",
  "name": "tiecheng1",
  "age": 18,
  "time": "0001-01-01T00:00:00Z"
}
```

- If you add user multi, return like:

```json
{
  "message": "data is exist"
}
```



