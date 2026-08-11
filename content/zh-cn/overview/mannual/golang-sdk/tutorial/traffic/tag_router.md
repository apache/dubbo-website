---
description: 标签路由
title: 标签路由
type: docs
weight: 1
---

相关示例：

- 动态 tag router：<a href="https://github.com/apache/dubbo-go-samples/tree/main/router/tag" target="_blank">dubbo-go-samples/router/tag</a>
- 静态 tag router：<a href="https://github.com/apache/dubbo-go-samples/tree/main/router/static_config/tag" target="_blank">dubbo-go-samples/router/static_config/tag</a>

## 使用方法

### 前置准备

- Docker 以及 Docker compose 环境来部署Nacos配置中心。
- Nacos 2.x+
- Go 1.23+

#### 启动Nacos配置中心

参考这个教程来[启动Nacos](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/)。

### Tag router 介绍

Tag router可以通过标签对流量进行管控，常用于灰度发布（新版本实例打上灰度标签，只有携带该标签的请求会路由过去）、环境隔离（不同泳道的实例用标签区分，避免流量串环境）等场景。以下为示例代码。

服务端部分：

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("tag-server"),
		dubbo.WithTag("test-tag"), // set application's tag
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20001),
		),
	)
```

参数：

- dubbo.WithTag: 设置该实例携带的tag，用于标记该实例（例如为灰度环境等）。标签会写入注册中心的实例元数据（`dubbo.tag`）。标签匹配区分大小写，需与客户端携带的标签写法完全一致。

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

- `constant.Tagkey`: 设置客户端发送请求时所携带的tag标签。
- `constant.ForceUseTag`: 设置是否强制匹配标签。`"true"`时标签匹配不到实例直接失败；`"false"`时允许回退到未打标签的实例。

> 未携带标签的流量只能打到未携带标签的服务，携带标签的流量则可以打到携带相应标签的服务以及不具有标签的服务（取决于是否配置force参数）。

运行示例:

```shell
$ go run ./go-server/cmd/server.go           # 无标签server，20000端口
$ go run ./go-tag-server/cmd/server_tag.go   # 携带test-tag标签的server，20001端口
$ go run ./go-client/cmd/client.go
```

客户端依次发起四次调用，预期结果:

```
✔ invoke successfully : receive: tag with force, response from: server-with-tag
❌ invoke failed: Failed to invoke the method Greet.
✔ invoke successfully : receive: tag with no-force, response from: server-without-tag
✔ invoke successfully : receive: non-tag, response from: server-without-tag
```

四次调用分别对应：标签匹配成功、标签不存在且force为true（不回退，调用失败）、标签不存在但force为false（回退到无标签实例）、无标签流量（只路由到无标签实例）。

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/tag)。

### 动态规则配置

除请求级标签外，还可以从配置中心动态下发标签规则，把"标签 → 实例分组"的映射交给规则维护。

动态标签规则依赖配置中心，客户端必须通过`dubbo.WithConfigCenter`接入 Nacos，否则日志会提示`Config center does not start, Tag router will not be enabled`：

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName("tag-client"),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress(RegistryAddress),
	),
	dubbo.WithConfigCenter(
		config_center.WithNacos(),
		config_center.WithAddress(RegistryAddress),
	),
)
```

在 Nacos 新建配置，`Data ID`为`{application_name}.tag-router`（这里的应用名是**服务端**的应用名，例如`tag-server.tag-router`），Group 使用默认的`DEFAULT_GROUP`，配置格式选择`YAML`。

配置内容示例——把携带`gray`标签的请求路由到`dubbo.tag=test-tag`的实例：

```yaml
configVersion: V3.3.2
scope: application
key: tag-server
force: false
enabled: true
priority: 1
tags:
  - name: gray
    match:
      - key: dubbo.tag
        value:
          exact: test-tag
```

关键字段说明:

- `tags[].name`: 标签名，与请求 attachment 中携带的标签值对应。
- `tags[].match`: 按实例 URL 参数匹配实例分组，`value`支持`exact`、`prefix`、`regex`等匹配方式。
- `tags[].addresses`: 直接按`ip:port`圈定实例分组，与`match`二选一。
- `force`: 标签匹配不到实例时是否回退。`true`不回退、直接失败；`false`回退到未打标签的实例。
- `enabled`: 是否启用本条规则。

规则下发后，运行中的客户端无需重启即可生效，日志中可以看到`Parse tag router config success`字样。

> 停用动态规则时，推荐将`enabled`置为`false`后重新发布配置，运行中的客户端会立即回到未启用规则的行为；直接删除配置项时，运行中的客户端可能收不到删除事件，导致旧规则继续生效。

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
