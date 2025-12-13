---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/samples/auth_filter/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/auth_filter/
    - /zh-cn/overview/reference/pixiu/other/user/samples/auth_filter/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/auth_filter/
description: Auth Filter 快速入门
linkTitle: Auth Filter 快速入门
title: Auth Filter 快速入门
type: docs
weight: 20
---
# Auth Filter 快速入门

## Http

启动 Zookeeper [Docker] : 

```bash
cd samples/dubbogo/http/docker
run docker-compose.yml/services
```

启动 Http [Go environment]:

```bash
go run samples/dubbogo/simple/jwt/server/server.go
```

启动 Pixiu:

```bash
go run cmd/pixiu/*.go gateway start -c samples/dubbogo/simple/jwt/pixiu/conf.yaml
```

通过 Pixiu 调用 Http 的服务端：

- 默认 Authorization: Bearer <token>

```bash
curl -H "Authorization: Bearer eyJraWQiOiJlZThkNjI2ZCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJXZWlkb25nIiwiYXVkIjoiVGFzaHVhbiIsImlzcyI6Imp3a3Mtc2VydmljZS5hcHBzcG90LmNvbSIsImlhdCI6MTYzMTM2OTk1NSwianRpIjoiNDY2M2E5MTAtZWU2MC00NzcwLTgxNjktY2I3NDdiMDljZjU0In0.LwD65d5h6U_2Xco81EClMa_1WIW4xXZl8o4b7WzY_7OgPD2tNlByxvGDzP7bKYA9Gj--1mi4Q4li4CAnKJkaHRYB17baC0H5P9lKMPuA6AnChTzLafY6yf-YadA7DmakCtIl7FNcFQQL2DXmh6gS9J6TluFoCIXj83MqETbDWpL28o3XAD_05UP8VLQzH2XzyqWKi97mOuvz-GsDp9mhBYQUgN3csNXt2v2l-bUPWe19SftNej0cxddyGu06tXUtaS6K0oe0TTbaqc3hmfEiu5G0J8U6ztTUMwXkBvaknE640NPgMQJqBaey0E4u0txYgyvMvvxfwtcOrDRYqYPBnA" http://localhost:8888/user/pixiu
```

控制台上的结果：

```log
{"message":"user","status":200}
```

Token 无效

```bash
curl http://localhost:8888/health
```

控制台上的结果：

```log
{"message":"token invalid","status":401}
```



## Spring Cloud

启动 Nacos [Docker environment]:

```bash
cd samples/springcloud/docker
run docker-compose.yml/services
```

启动 SpringCloud [Java environment]:

```bash
cd samples/springcloud/server

# the port is 8074
run auth-service

# the port is 8071
run user-service
```

启动 Pixiu:

```bash
go run cmd/pixiu/*.go gateway start -c samples/dubbogo/simple/jwt/pixiu/springcloud-conf.yaml
```

通过 Pixiu 调用 SpringCloud 的服务端：

- 默认 Authorization: Bearer <token>

```bash
# the serviceId is `user-provider`
curl -H "Authorization: Bearer eyJraWQiOiJlZThkNjI2ZCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJXZWlkb25nIiwiYXVkIjoiVGFzaHVhbiIsImlzcyI6Imp3a3Mtc2VydmljZS5hcHBzcG90LmNvbSIsImlhdCI6MTYzMTM2OTk1NSwianRpIjoiNDY2M2E5MTAtZWU2MC00NzcwLTgxNjktY2I3NDdiMDljZjU0In0.LwD65d5h6U_2Xco81EClMa_1WIW4xXZl8o4b7WzY_7OgPD2tNlByxvGDzP7bKYA9Gj--1mi4Q4li4CAnKJkaHRYB17baC0H5P9lKMPuA6AnChTzLafY6yf-YadA7DmakCtIl7FNcFQQL2DXmh6gS9J6TluFoCIXj83MqETbDWpL28o3XAD_05UP8VLQzH2XzyqWKi97mOuvz-GsDp9mhBYQUgN3csNXt2v2l-bUPWe19SftNej0cxddyGu06tXUtaS6K0oe0TTbaqc3hmfEiu5G0J8U6ztTUMwXkBvaknE640NPgMQJqBaey0E4u0txYgyvMvvxfwtcOrDRYqYPBnA" http://localhost:8888/user-service/echo/Pixiu

# the serviceId is `auth-provider`
curl -H "Authorization: Bearer eyJraWQiOiJlZThkNjI2ZCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJXZWlkb25nIiwiYXVkIjoiVGFzaHVhbiIsImlzcyI6Imp3a3Mtc2VydmljZS5hcHBzcG90LmNvbSIsImlhdCI6MTYzMTM2OTk1NSwianRpIjoiNDY2M2E5MTAtZWU2MC00NzcwLTgxNjktY2I3NDdiMDljZjU0In0.LwD65d5h6U_2Xco81EClMa_1WIW4xXZl8o4b7WzY_7OgPD2tNlByxvGDzP7bKYA9Gj--1mi4Q4li4CAnKJkaHRYB17baC0H5P9lKMPuA6AnChTzLafY6yf-YadA7DmakCtIl7FNcFQQL2DXmh6gS9J6TluFoCIXj83MqETbDWpL28o3XAD_05UP8VLQzH2XzyqWKi97mOuvz-GsDp9mhBYQUgN3csNXt2v2l-bUPWe19SftNej0cxddyGu06tXUtaS6K0oe0TTbaqc3hmfEiu5G0J8U6ztTUMwXkBvaknE640NPgMQJqBaey0E4u0txYgyvMvvxfwtcOrDRYqYPBnA" http://localhost:8888/auth-service/echo/Pixiu
```

控制台上的结果：

```log
Hello {service_name} Pixiu
```
