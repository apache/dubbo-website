---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/dev/log/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/dev/log/
    - /zh-cn/overview/reference/pixiu/other/dev/log/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/dev/log/
description: 日志阅读介绍
linkTitle: 日志阅读介绍
title: 日志阅读介绍
type: docs
weight: 2
---


# Log

如何在Dubbogo-pixiu中阅读日志

## DEBUG log

### Dubbo request log

```bash
2020-11-17T11:31:05.716+0800    DEBUG   dubbo/dubbo.go:150      [dubbo-go-pixiu] dubbo invoke, method:GetUserByName, types:[java.lang.String], reqData:[tiecheng]
```

### Dubbo response log

```bash
2020-11-17T11:31:05.718+0800    DEBUG   dubbo/dubbo.go:160      [dubbo-go-pixiu] dubbo client resp:map[age:88 iD:3213 name:tiecheng time:<nil>]
```

