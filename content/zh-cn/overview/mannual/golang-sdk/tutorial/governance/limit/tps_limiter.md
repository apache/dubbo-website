---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/limit/tps_limiter/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/limit/tps_limiter/
description: 为服务端设置限流
title: 为服务端设置限流
type: docs
weight: 3
---






## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用

## 2. 修改限流逻辑并验证

Dubbo-go 为用户提供了内置的限流拒绝逻辑，并支持用户根据自己的业务场景，定义需要的限流机制、拒绝逻辑。

正常情况下，不设置流量限制，当用户在 server 端配置了限流逻辑和参数后，将会

### 2.1 配置限流参数

go-server/conf/dubbogo.yaml: 配置限流参数

```yaml
dubbo:
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: "" # read from pb
        tps.limiter: "method-service"
        tps.limit.strategy: "slidingWindow" 
        tps.limit.rejected.handler: "default"
        tps.limit.interval: 1000 
        tps.limit.rate: 3

```

参数说明：

- tps.limiter：限流器选择。method-service 为框架内置的一个限流器，可以配置服务和方法级别的限流逻辑，可自定义。
- tps.limit.strategy：限流策略选择，slidingWindow 为框架内置的一个限流策略，可以按照滑动窗口的形式，拒绝掉窗口内超过流量限制的请求。
- tps.limit.rejected.handler: 拒绝策略，default 为默认拒绝方式，返回空对象，可自定义
- tps.limit.interval：限流窗口区间，单位是ms。
- tps.limit.rate：窗口内流量限制，单位是请求次数。

按照上述配置，服务端只允许当前接口在一秒内被调用三次。

### 2.2 发起超流请求，验证限流能力

将客户端的请求逻辑设置为每秒钟请求五次，并计算成功率。

go-client/cmd/client.go

```go

func main() {
	config.SetConsumerService(grpcGreeterImpl)
	if err := config.Load(); err != nil {
		panic(err)
	}

	logger.Info("start to test dubbo")
	req := &api.HelloRequest{
		Name: "laurence",
	}

	for {
		goodCount := 0
		badCount := 0
		for{
			time.Sleep(time.Millisecond*200)
			reply, _ := grpcGreeterImpl.SayHello(context.Background(), req)
			if reply.Name == "" {
				badCount++
			}else {
				goodCount++
			}
			if badCount + goodCount ==5{
				break
			}
		}
		logger.Infof("Success rate = %v\n", float64(goodCount)/float64(goodCount + badCount))
	}
}
```

可在日志中看到请求成功率为0.6，每秒钟只允许三次请求被执行。

```bash
INFO    cmd/client.go:62        Success rate = 0.6

INFO    cmd/client.go:62        Success rate = 0.6

INFO    cmd/client.go:62        Success rate = 0.6
```

在服务端日志中可以看到拒绝的信息：

```bash
ERROR   tps/filter.go:84  The invocation was rejected due to over the limiter limitation...
```