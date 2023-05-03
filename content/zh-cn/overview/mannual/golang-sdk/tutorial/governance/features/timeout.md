---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/features/timeout/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/features/timeout/
description: 配置调用的超时
title: 配置调用的超时
type: docs
weight: 1
---






## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用

## 2. 通过配置项修改 RPC 调用相关参数

### 2.1 修改调用的超时，并验证

```yaml
dubbo:
  consumer:
    request-timeout: 15s # 配置客户端超时
```

Dubbo-go 应用默认 RPC 超时为 3s，请求超时后，客户端将会返回error 为 context deadline exceeded 的错误。在本任务中，您需要首先修改 demo 应用的 server 函数为较长耗时，然后查看客户端的超时报错；再通过配置客户端超时，使得耗时函数可以正常调用。

1. go-server/cmd/server.go: 修改 demo 应用 server 的函数为耗时 10s 的函数

   ```go
   func (s *GreeterProvider) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
   	logger.Infof("Dubbo3 GreeterProvider get user name = %s\n", in.Name)
   	time.Sleep(time.Second*10) // sleep 10s
   	return &api.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, nil
   }
   ```

2. 客户端发起调用，观察错误日志

   ```
   ERROR   cmd/client.go:47        context deadline exceeded
   ```

3. go-client/conf/dubbogo.yaml: 客户端修改超时

   ```yaml
   dubbo:
     consumer:
       request-timeout: 15s # 配置客户端超时
       references:
         GreeterClientImpl:
           protocol: tri
           url: "tri://localhost:20000"
           interface: "" # read from pb
   ```

4. 再次通过客户端发起调用，观察日志，正常返回：

   ```bash
   client response result: name:"Hello laurence" id:"12345" age:21
   ```