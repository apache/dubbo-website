---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/dev/log/
    - /en/docs3-v2/dubbo-go-pixiu/dev/log/
    - /en/overview/reference/pixiu/dev/log/
    - /en/overview/mannual/dubbo-go-pixiu/dev/log/
description: Log Overview
linkTitle: Log Overview
title: Log Overview
type: docs
weight: 2
---

# Log

How to view logs in dubbo-go-pixiu.

## DEBUG log

### Dubbo request log

```bash
2020-11-17T11:31:05.716+0800    DEBUG   dubbo/dubbo.go:150      [dubbo-go-pixiu] dubbo invoke, method:GetUserByName, types:[java.lang.String], reqData:[tiecheng]
```

### Dubbo response log

```bash
2020-11-17T11:31:05.718+0800    DEBUG   dubbo/dubbo.go:160      [dubbo-go-pixiu] dubbo client resp:map[age:88 iD:3213 name:tiecheng time:<nil>]
```

