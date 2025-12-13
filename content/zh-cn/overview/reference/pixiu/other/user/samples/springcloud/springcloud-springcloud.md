---
aliases:
- /zh/docs3-v2/dubbo-go-pixiu/user/samples/springcloud/springcloud-springcloud
- /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/springcloud/springcloud-springcloud
- /zh-cn/overview/reference/pixiu/other/user/samples/springcloud/springcloud-springcloud
- /zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/springcloud/springcloud-springcloud
description: SpringCloud
linkTitle: SpringCloud
title: SpringCloud
type: docs
weight: 20
---

# 快速开始

启动 Nacos [Docker 环境]：

```bash
cd samples/springcloud/docker
run docker-compose.yml/services
```

启动 SpringCloud [Java 环境]：

```bash
cd samples/springcloud/server

# the port is 8074
run auth-service

# the port is 8071
run user-service
```

启动 Pixiu:

```bash
go run cmd/pixiu/*.go gateway start -c samples/springcloud/pixiu/conf.yaml
```

通过 Pixiu 调用 SpringCloud 服务：

```bash
# the serviceId is `user-provider`
curl http://localhost:8888/user-service/echo/Pixiu

# the serviceId is `auth-provider`
curl http://localhost:8888/auth-service/echo/Pixiu
```
控制台输出结果：
```log
Hello Nacos Discovery Pixiu
```
