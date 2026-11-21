---
title: 在 Dubbo Admin 中查看 Dubbo-go 服务
linkTitle: 接入 Dubbo Admin
description: 在 Dubbo Admin 中查看 Dubbo-go 的应用、实例、服务和方法
type: docs
weight: 13
---

Dubbo-go 默认使用[应用级服务发现]({{< relref "./application-level-service-discovery.md" >}})，接入 Dubbo Admin 时不需要切换回接口级注册。Admin 中各页面的数据来源如下：

| Admin 页面 | 数据来源 |
|---|---|
| 应用列表、实例列表、实例详情 | 注册中心中的应用级实例 |
| 服务列表、服务详情 | provider 发布到元数据中心的服务定义 |
| 方法列表、方法详情 | 同上，包含参数和返回值类型 |

服务列表和方法信息依赖 provider 发布服务定义，需要使用 v3.3.2 之后发布的 Dubbo-go 版本。更早的版本中，Admin 只能看到应用和实例，看不到服务和方法。

## 前置准备

- 启动 Nacos 或 ZooKeeper，作为注册中心和元数据中心。
- 启动 Dubbo Admin，`discovery` 指向同一个注册中心，见[与 Dubbo Admin 配合使用路由规则]({{< relref "../traffic/admin_compatibility.md#2-启动-dubbo-admin" >}})。

目前只有 Nacos 和 ZooKeeper 元数据中心支持发布服务定义。

## 配置

使用默认配置即可：

- 注册中心默认同时作为元数据中心，服务定义会写入同一个 Nacos 或 ZooKeeper。
- 服务定义默认发布，与 `metadata-type` 是 `local` 还是 `remote` 无关。如需关闭，在元数据中心配置中使用 `metadata.WithReportDefinition(false)`，此时 Admin 中将看不到该应用的服务和方法。

服务定义在实例注册之后异步发布，失败时会自动重试。provider 日志中出现下面一行即表示发布成功：

```text
[Metadata][Definition] published definition for greet.GreetService, methods=1 types=2
```

## 在 Admin 中查看

以一个注册了 `greet.GreetService`（group 为 `gray`，version 为 `1.0.0`）、启动了两个实例的 provider 应用 `admin-demo-server` 为例：

- **应用列表**：出现 `admin-demo-server`，实例数为 2。
- **实例详情**：显示 IP、RPC 端口和注册时间，注册状态为 `Registered`。
- **服务列表**：出现 `greet.GreetService`，并带有 group 和 version。
- **服务详情**：语言为 `golang`，提供者列表中有两个实例。
- **方法详情**：签名为 `greet.GreetRequest->greet.GreetResponse`，并列出请求和响应类型的字段。

## 常见问题

### 1. 应用列表正常，但服务列表为空

1. 确认 Dubbo-go 版本支持发布服务定义，且元数据中心是 Nacos 或 ZooKeeper。
2. 在 provider 日志中查找 `[Metadata][Definition]`，确认服务定义已发布。
3. 在元数据中心确认服务定义存在：
   - Nacos：group 为 `dubbo`（配置了元数据中心的 group 时使用该值），data ID 为 `<接口名>:<版本>:<分组>:provider:<应用名>`，version 和 group 为空时保留冒号，如 `greet.GreetService:::provider:demo`。
   - ZooKeeper：路径为 `/dubbo/metadata/<接口名>/<版本>/<分组>/provider/<应用名>`，version 和 group 为空时省略对应层级。

也可以直接调用 Admin 的接口，区分是 Dubbo-go 没有发布数据还是 Admin 没有读到：

```shell
A=http://127.0.0.1:8888/api/v1
MESH=nacos-local   # Admin 配置中 discovery 的 id

curl -c cookie.txt -X POST -d 'user=admin&password=dubbo@2025' $A/auth/login
curl -b cookie.txt "$A/service/search?keywords=&mesh=$MESH"
curl -b cookie.txt "$A/service/methods?serviceName=greet.GreetService&group=gray&version=1.0.0&mesh=$MESH"
```

### 2. 参数类型显示为 Java 类型

Admin 中的类型以 Java 的写法展示，例如 `string` 显示为 `java.lang.String`，`time.Time` 显示为 `java.util.Date`。这与 Dubbo Java 以及 Admin 的泛化调用保持一致，不影响调用。

### 3. 只调用其他服务的应用不在应用列表中

应用级服务发现下 consumer 默认不注册实例，因此只作为 consumer 的应用不会出现在应用列表中。consumer 侧的调用情况可以通过指标查看，见[在 Dubbo Admin 中观测 Dubbo-go 服务]({{< relref "../observability/admin_compatibility.md" >}})。
