---
aliases:
  - /zh/docs3-v2/golang-sdk/tutorial/governance/traffic/mesh_router/
  - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/traffic/mesh_router/
  - /zh-cn/overview/mannual/golang-sdk/tutorial/governance/traffic/mesh_router/
description: 路由规则
title: 路由规则
type: docs
weight: 1
---

Dubbo-go提供了多种类型的路由，便于进行流量管控，例如实现灰度发布等功能。  
这里简要介绍下不同路由的用法。

## 路由种类

- Tag router
- Condition router
- Script router
- Affinity router

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

- constant.TagKey: 设置客户端发送请求时所携带的tag标签。
- constant.ForceUseTag: 设置是否强制匹配标签。

> 未携带标签的流量只能打到未携带标签的服务，携带标签的流量则可以打到携带相应标签的服务以及不具有标签的服务（取决于是否配置force参数）。

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/tag)。

### Condition router 介绍

Condition router 与 Tag router 类似，但是提供了更强大的流量管控功能，可以通过表达式`consumer => provider`，
对服务端以及客户端进行流量管控。

常用的匹配标签:

| 标签          | 描述                 |
|-------------|--------------------|
| application | 对名称进行匹配            |
| version     | 对版本进行匹配            |
| port        | 对端口进行匹配            |
| region      | 对服务的区域进行匹配         |
| host        | 对ip或者域名进行匹配        |
| method      | 对请求的方法进行匹配         |
| attachement | 对请求的attachment进行匹配 |

匹配表达式示例:

`host = 127.0.0.1 => host = 127.0.0.1, 192.168.1.1`

> 可以使用 = 以及 != 等符号进行匹配，使用逗号进行多选择匹配。

示例代码:

服务端部分:

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("condition-server"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(TriPort),
		),
	)
```

客户端部分:

```go
ins, err := dubbo.NewInstance(
		dubbo.WithName("condition-client"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(RegistryAddress),
		),
		dubbo.WithConfigCenter( // configure config center to enable condition router
			config_center.WithNacos(),
			config_center.WithAddress(RegistryAddress),
		),
	)
rep, err := srv.Greet(context.Background(), &greet.GreetRequest{Name: "hello world"})
```

> 使用condition router必须在nacos等配置中心动态设置匹配规则。

Nacos配置示例:

配置的`Data ID`名字必须为: `{application_name}.{router_type}`。

例如: `condition-server.condition-router`。

```yaml
configVersion: V3.3.2
scope: "application"
key: "condition-server"
priority: 1
force: true
enabled: false
conditions:
  - from:
      match: "application = condition-client"
    to:
      - match: "port = 20000"
```

参数说明:

| 参数            | 说明                                 |
|---------------|------------------------------------|
| configVersion | 配置的版本，以3.1版本为区分。3.1版本后设置更加详细       |
| scope         | 配置作用域，可设置为"service"或者"application" |
| key           | 配置生效的服务，一般设置为服务端的名字                |
| priority      | 该配置的优先级                            |
| force         | 是否强制匹配                             |
| enabled       | 是否启用该配置                            |
| conditions    | 匹配规则                               |

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/condition)。

### Script router 介绍

Script router与condition类型，都提供了使用表达式进行流量管控的功能。
但是Script router具有更强大的匹配功能，与此同时带来的是匹配消耗的资源更多，因此在生产环境中应当尽量少使用。

Script router的示例代码与Condition router类似，在nacos配置上略有差别，这里仅提供nacos上的简单配置。

```yaml
scope: "application"
key: "script-server"
enabled: true
type: "javascript"
script: |
  (function(invokers, invocation, context) {
    if (!invokers || invokers.length === 0) return [];
    return invokers.filter(function(invoker) {
      var url = invoker.GetURL();
      return url && url.Port === "20000";
    });
  })(invokers, invocation, context);
```

参数说明:

| 参数     | 说明               |
|--------|------------------|
| type   | script的类型，可以使用js |
| script | script实际内容       |

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/script)。

### Affinity router 介绍







