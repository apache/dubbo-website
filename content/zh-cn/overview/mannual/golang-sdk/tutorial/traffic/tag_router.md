---
description: 标签路由
title: 标签路由
type: docs
weight: 1
---

## 使用方法

### 前置准备

- Docker 以及 Docker compose 环境来部署Nacos配置中心。
- Nacos 2.x+
- Go 1.23+

#### 启动Nacos配置中心

参考这个教程来[启动Nacos](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/)。

### Tag router 介绍

Tag router可以通过标签对流量进行管控，以下为示例代码。

服务端部分：

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("tag-server"),
		dubbo.WithTag("test-Tag"), // set application's tag
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20000),
		),
	)
```

参数：

- dubbo.WithTag: 设置该实例携带的tag，用于标记该实例（例如为灰度环境等）。

客户端部分：

```go
atta := map[string]string{
	constant.Tagkey:      "test-tag",
	constant.ForceUseTag: "true", // 使用string类型
}
ctx := context.WithValue(context.Background(), constant.AttachmentKey, atta)
resp, err := svc.Greet(ctx, &greet.GreetRequest{Name: name})
```

参数:

- `constant.TagKey`: 设置客户端发送请求时所携带的tag标签。
- `constant.ForceUseTag`: 设置是否强制匹配标签。

> 未携带标签的流量只能打到未携带标签的服务，携带标签的流量则可以打到携带相应标签的服务以及不具有标签的服务（取决于是否配置force参数）。

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/tag)。