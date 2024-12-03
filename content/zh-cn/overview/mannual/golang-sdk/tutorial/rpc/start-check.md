---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/health/start-check/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/health/start-check/
    - /zh-cn/overview/mannual/golang-sdk/tutorial/governance/health/start-check/
description: "缺省会在启动时检查依赖的服务是否可用（注册中心是否有可用地址），不可用时会抛出异常，阻止应用初始化完成。"
keywords: 启动时检查
title: 启动时检查
type: docs
weight: 4
---

Dubbo 框架缺省会在启动时检查依赖的服务是否可用（注册中心是否有可用地址），不可用时会抛出异常，阻止应用初始化完成，以便上线时，能及早发现问题，默认 check="true"，并等待3s。

可以通过 check="false" 关闭检查，比如，测试时，有些服务不关心，或者出现了循环依赖，必须有一方先启动。

关闭 check 后，请注意 provider数量比较多时， consumer 订阅 provider 生成服务地址可能会有一定延迟，如果 consumer 一启动就对外提供服务，可能会造成"冷启动"。所以在这个时候，请对服务进行预热。

示例：

```yaml
dubbo:
  consumer:
    check : false
    reference: 
      myserivce:
       check: true 
```

或者

```go
cli, err := client.NewClient(
	client.WithClientCheck(false),
)
```

或者

```go
svc, err := health.NewHealth(cli)
svc.Check(context.Background(), &health.HealthCheckRequest{Service: "greet.GreetService"}, client.WithCheck(false))
```
