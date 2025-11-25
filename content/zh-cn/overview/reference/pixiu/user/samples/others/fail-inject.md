---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/samples/fail_inject/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/fail_inject/
    - /zh-cn/overview/reference/pixiu/user/samples/fail_inject/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/fail_inject/
description: Fail Inject Filter 快速入门
linkTitle: Fail Inject Filter 快速入门
title: Fail Inject Filter 快速入门
type: docs
weight: 20
---

# Fail Inject Filter 快速入门

## 启动 Pixiu：

官方参考示例位于 `https://github.com/dubbo-go-pixiu/samples`

将以下配置文件添加到 `samples/http/simple/pixiu/conf.yaml`

```yaml
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8888
      filter_chains:
        filters:
          - name: dgp.filter.httpconnectionmanager
            config:
              route_config:
                routes:
                  - match:
                      prefix: /user
                    route:
                      cluster: user
                      cluster_not_found_response_code: 505
                http_filters:
                  - name: dgp.filter.http.faultinjection
                    config:
                      fail_inject_rules:
                        "/UserService/com.dubbogo.pixiu.UserService/GetUserByCode":
                          type: delay
                          trigger_type: random
                          status_code: 500
                          body: 'error'
                          delay: 5s
                          odds: 30
      config:
        idle_timeout: 5s
        read_timeout: 5s
        write_timeout: 5s
  clusters:
    - name: "user"
      lb_policy: "lb"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 1314
      health_checks:
        - protocol: "tcp"
          timeout: 1s
          interval: 2s
          healthy_threshold: 4
          unhealthy_threshold: 4
  shutdown_config:
    timeout: "60s"
    step_timeout: "10s"
    reject_policy: "immediacy"
```

   然后执行以下命令。

```shell
go run cmd/pixiu/*.go gateway start -c samples/http/simplep/pixiu/conf.yaml
```
