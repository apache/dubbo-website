---
aliases:
    - /zh/docs3-v2/golang-sdk/sourcecode/registry/
    - /zh-cn/docs3-v2/golang-sdk/sourcecode/registry/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/registry/
description: 当前注册中心与服务发现源码概览
title: 注册中心
type: docs
weight: 1
---

相关示例：

* Nacos 注册中心：<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>
* Zookeeper 注册中心：<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/zookeeper" target="_blank">dubbo-go-samples/registry/zookeeper</a>
* 应用级服务发现：<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>

相关文档：

* [应用级服务发现](/zh-cn/overview/mannual/golang-sdk/tutorial/service-discovery/application-level-service-discovery/)

在当前 Dubbo Go 中，registry 层已经不只是“接口级地址注册”这么简单。它同时参与应用级服务发现、metadata 初始化、订阅刷新，以及基于注册中心的协议暴露流程。

## 核心 Registry 接口

主接口定义在 `registry/registry.go`：

```go
type Registry interface {
	common.Node
	Register(url *common.URL) error
	UnRegister(url *common.URL) error
	Subscribe(*common.URL, NotifyListener) error
	UnSubscribe(*common.URL, NotifyListener) error
	LoadSubscribeInstances(*common.URL, NotifyListener) error
}
```

和旧版说明相比，一个明显变化是 `LoadSubscribeInstances(...)` 已经进入接口契约。原因是订阅本身是异步的，Dubbo Go 在正式进入异步通知流之前，可能需要先同步加载一次初始实例列表。

## 当前职责范围

现在 registry 层覆盖了几类紧密相关的职责：

* provider 注册与反注册
* consumer 订阅与取消订阅
* 异步更新前的初始实例加载
* 应用级服务发现
* 与 registry 绑定的 metadata 上报

从源码目录看，相关主包包括：

* `registry`
* `registry/protocol`
* `registry/servicediscovery`
* `registry/directory`

## 注册模式

当前 Dubbo Go 通过 `registry/options.go` 支持多种注册模型：

* `registry.WithRegisterService()`
* `registry.WithRegisterInterface()`
* `registry.WithRegisterServiceAndInterface()`

它们分别对应：

* `service`：注册应用级实例
* `interface`：注册接口级 provider URL
* `all`：迁移阶段同时注册两种模型

这也是它和早期文档的一个关键差异。旧文档大多只讲了接口级注册。

## Provider 与 Consumer 流程

从高层看：

1. provider 通过 `server` 和 `protocol` 暴露服务。
2. 如果开启了 registry 集成，`registry/protocol` 会协调注册和 metadata 上报。
3. consumer 通过 registry URL 或 registry 配置引用服务。
4. `registry/directory` 接收地址变更并维护有效 provider 列表。
5. router、load balance、cluster 在调用时消费这份地址列表。

在应用级服务发现模型下，consumer 还会先解析 service-to-application mapping，再通过 metadata 恢复出具体可调用的端点。

## 内置注册中心与扩展加载

内置实现通过包初始化注册：

* `registry/nacos`
* `registry/zookeeper`
* `registry/etcdv3`
* `registry/polaris`
* `registry/servicediscovery`

它们通过 `common/extension.SetRegistry(...)` 暴露，常见加载方式是：

```go
import _ "dubbo.apache.org/dubbo-go/v3/imports"
```

## Registry 配置形态

在 API 模式下，registry 相关配置通常通过下面这些入口设置：

* 实例级：`dubbo.WithRegistry(...)`
* 引用级：`client.WithRegistry(...)` 或 `client.WithRegistryIDs(...)`
* 服务级：`server.WithRegistry(...)` 或 `server.WithRegistryIDs(...)`

在配置文件模式下，registries 则位于 `RootConfig.Registries`。

这也解释了为什么 registry 既是应用级基础设施，又会在单个 service 或 reference 上作为选择器出现。
