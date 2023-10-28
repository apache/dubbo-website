---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/monitor/rpc_metrics/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/monitor/rpc_metrics/
description: 查看 RPC 调用的监控信息
title: 查看 RPC 调用的监控信息
type: docs
weight: 1
---






## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用

## 2. 修改客户端逻辑，重复发起调用

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
	for{ // 重复发起调用
		reply, err := grpcGreeterImpl.SayHello(context.Background(), req)
		if err != nil {
			logger.Error(err)
		}
		logger.Infof("client response result: %v\n", reply)
	}
}
```

## 3. 查看请求 RT 信息

先后启动服务端、客户端服务应用。浏览器查看 localhost:9090/metrics, 搜索 "dubbo", 即可查看服务端暴露接口的请求时延，单位 ns。

```
$ curl localhost:9090/metrics | grep dubbo

# HELP dubbo_provider_service_rt 
# TYPE dubbo_provider_service_rt gauge
dubbo_provider_service_rt{group="",method="SayHello",service="api.Greeter",timeout="",version="3.0.0"} 41084
```

可看到当前最近一次请求 rt 为 41084 ns。