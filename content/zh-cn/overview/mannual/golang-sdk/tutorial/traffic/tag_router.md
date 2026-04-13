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

### 静态配置 API

除上面的用法外，Tag router 也支持通过静态配置 API 在代码中注入路由规则。静态配置不要求配置中心参与，可以配合直连 URL 使用，也可以配合注册中心使用。

下面是一个应用级静态 tag router 的示例：

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName(clientApplication),
	dubbo.WithRouter(
		router.WithScope("application"),
		router.WithKey(clientApplication),
		router.WithPriority(100),
		router.WithForce(false),
		router.WithTags([]global.Tag{
			{
				Name:      "gray",
				Addresses: []string{"127.0.0.1:20002"},
			},
		}),
	),
)
```

携带请求 tag：

```go
ctx := context.WithValue(context.Background(), constant.AttachmentKey, map[string]string{
	constant.Tagkey: "gray",
})
```

参数：

- `router.WithScope("application")`: 按应用维度生效。
- `router.WithKey(clientApplication)`: 指定当前路由规则绑定的 consumer application。
- `router.WithTags(...)`: 静态声明 tag 到地址列表的映射关系。
- `router.WithForce(...)`: 控制 tag 不匹配时是否允许回退。

`dubbo-go-samples` 中的静态示例使用直连 URL，只是为了最小化演示，不代表静态配置 API 只能用于直连场景。

静态配置示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/static_config/tag)。

### 规则优先级与合并语义

- 动态配置的路由规则会覆盖静态配置。
- 多次调用 `dubbo.WithRouter(...)` 时，采用 append 语义，多条静态路由会被追加到实例配置中。
- 对同一条静态路由多次设置 `router.WithTags(...)` 时，采用 replace 语义，后一次设置会替换前一次设置。
- 重复注入完全相同的静态规则时，最终路由结果通常保持一致，但实现上不会先比较新旧内容并短路跳过。
