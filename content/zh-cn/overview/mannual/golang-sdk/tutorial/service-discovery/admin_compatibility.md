---
title: 在 Dubbo Admin 中查看 Dubbo-go 服务
description: Dubbo Admin 如何基于 Dubbo-go 的应用级服务发现数据展示应用、实例、服务和方法，以及所需的版本和配置
type: docs
weight: 13
---

Dubbo-go 默认使用[应用级服务发现]({{< relref "./application-level-service-discovery.md" >}})。Dubbo Admin 展示 Dubbo-go 服务时不需要 Dubbo-go 回退到接口级注册，各页面的数据来源如下：

| Admin 页面 | 数据来源 |
|---|---|
| 应用列表、实例列表、实例详情 | 注册中心中的应用级实例 |
| 服务列表、服务详情 | provider 发布到元数据中心的服务定义 |
| 方法列表、方法详情（参数和返回值类型） | 同上 |

以下内容基于 Dubbo Admin `develop` 分支（[65bce33](https://github.com/apache/dubbo-admin/commit/65bce33)）和 Dubbo-go `develop` 分支（[ba67101](https://github.com/apache/dubbo-go/commit/ba671017)），使用 Nacos 验证。

## 版本要求

服务列表和方法信息依赖 provider 发布服务定义，这部分能力目前只在 Dubbo-go `develop` 分支中提供：

| 现象（v3.3.2 及更早版本） | 修复 |
|---|---|
| 应用和实例可见，但服务列表中没有 Dubbo-go 服务 | [#3711](https://github.com/apache/dubbo-go/pull/3711)（Nacos）、[#3798](https://github.com/apache/dubbo-go/pull/3798)（ZooKeeper） |
| 由 `.proto` 生成的 Triple 服务不出现在服务列表中 | [#3796](https://github.com/apache/dubbo-go/pull/3796) |
| 参数或返回值中含有 `time.Time` 字段的方法缺失，服务可能整体不出现 | [#3806](https://github.com/apache/dubbo-go/pull/3806) |
| 实例的注册状态显示为 `UnRegistered`，注册时间为空 | [#3807](https://github.com/apache/dubbo-go/pull/3807) |

目前只有 Nacos 和 ZooKeeper 元数据中心支持发布服务定义，etcd 等其他元数据中心不会发布。

## 配置

默认配置即可，不需要额外开启：

- 注册中心默认同时作为元数据中心（`use-as-meta-report=true`），服务定义会写入同一个 Nacos 或 ZooKeeper。
- 服务定义默认发布。如需关闭，在元数据中心配置中使用 `metadata.WithReportDefinition(false)`，此时 Admin 中将看不到该应用的服务和方法。
- 服务定义的发布与 `metadata-type` 无关，`local` 和 `remote` 模式都会发布。

服务定义在实例注册之后异步发布，失败时会按退避策略重试。provider 日志中出现下面一行即表示发布成功：

```text
[Metadata][Definition] published definition for greet.GreetService, methods=1 types=2
```

Admin 的 `discovery` 配置可参考[与 Dubbo Admin 配合使用路由规则]({{< relref "../traffic/admin_compatibility.md#2-启动-dubbo-admin" >}})。元数据中心默认使用 `registry` 的地址，与 Dubbo-go 的默认行为一致。

## 在 Admin 中能看到什么

以一个注册了 `greet.GreetService`（group `gray`、version `1.0.0`）的 provider 应用 `admin-demo-server` 为例，启动两个实例后：

- **应用列表**：出现 `admin-demo-server`，实例数为 2。
- **实例详情**：显示 IP、RPC 端口和注册时间，注册状态为 `Registered`。
- **服务列表**：出现 `greet.GreetService`，并带有 group 和 version。
- **服务详情**：语言显示为 `golang`，提供者列表中有两个实例。
- **方法详情**：签名为 `greet.GreetRequest->greet.GreetResponse`，并列出请求和响应类型的字段。

Dubbo-go 的类型以 Java 的写法展示，例如 `string` 显示为 `java.lang.String`，`time.Time` 显示为 `java.util.Date`，这是为了与 Dubbo Java 和 Admin 的泛化调用保持一致。

应用级服务发现下 consumer 默认不注册实例，因此只调用其他服务的应用不会出现在应用列表中。consumer 侧的调用情况可以通过指标查看，见[在 Dubbo Admin 中观测 Dubbo-go 服务]({{< relref "../observability/admin_compatibility.md" >}})。

## 通过接口检查

界面中看不到服务时，可以直接调用 Admin 的接口，区分是 Dubbo-go 没有发布数据还是 Admin 没有读到：

```shell
A=http://127.0.0.1:8888/api/v1
MESH=nacos-local   # Admin 配置中 discovery 的 id

curl -c cookie.txt -X POST -d 'user=admin&password=dubbo@2025' $A/auth/login

curl -b cookie.txt "$A/application/search?keywords=&mesh=$MESH&pageSize=50&pageOffset=0"
curl -b cookie.txt "$A/service/search?keywords=&mesh=$MESH"
curl -b cookie.txt "$A/service/methods?serviceName=greet.GreetService&group=gray&version=1.0.0&mesh=$MESH"
```

如果应用列表正常而服务列表为空：

1. 确认 Dubbo-go 版本包含上表中的修复。
2. 在 provider 日志中查找 `[Metadata][Definition]`，确认服务定义已发布。
3. 在元数据中心确认服务定义存在。Nacos 中 data ID 为 `<接口名>:<版本>:<分组>:provider:<应用名>`（version 和 group 为空时保留冒号，如 `greet.GreetService:::provider:demo`），group 为 `dubbo`（配置了元数据中心的 group 时使用该值）；ZooKeeper 中路径为 `/dubbo/metadata/<接口名>/<版本>/<分组>/provider/<应用名>`（version 和 group 为空时省略对应层级）。

使用 ZooKeeper 时，Admin 重启后服务列表可能变为空，而元数据中心中的服务定义仍然存在，见 [dubbo-admin #1638](https://github.com/apache/dubbo-admin/pull/1638)。
