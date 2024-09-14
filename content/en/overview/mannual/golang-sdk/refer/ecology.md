---
aliases:
    - /zh/docs3-v2/golang-sdk/refer/ecology/
    - /zh-cn/docs3-v2/golang-sdk/refer/ecology/
description: Dubbo-go 生态组件
title: 生态组件
type: docs
weight: 1
---

### Dubbo-go

[github.com/apache/dubbo-go](https://github.com/apache/dubbo-go) 

Apache Dubbo Go 语言实现主仓库

### Dubbo-go-samples

[github.com/apache/dubbo-go-samples](https://github.com/apache/dubbo-go-samples)

dubbo-go 的使用示例：
* config-api: 使用 API 进行配置初始化
* configcenter: 使用不同的配置中心，目前支持三种：zookeeper、apollo、和 nacos
* context: 如何使用上下文传递 attachment
* direct: 直连模式
* game: 游戏服务例子
* generic: 泛化调用
* rpc: RPC 调用例子, 包含 Triple、Dubbo等协议以及跨语言/gRPC互通示例
* helloworld: RPC调用入门例子
* logger: 日志例子
* registry: 展示与不同注册中心的对接，包含了 zk、nacos、etcd
* metrics: 数据上报
* filter: 使用提供filter和自定义filter的例子
* registry/servicediscovery：应用级服务发现例子
* router: 路由例子
* tracing: 链路追踪例子

### Dubbo-go-pixiu

[github.com/apache/dubbo-go-pixiu](https://github.com/apache/dubbo-go-pixiu)

dubbo-go-pixiu 网关支持以 dubbo 协议和 http 协议调用 dubbo/dubbo-go 集群

### Dubbo-getty

[github.com/apache/dubbo-getty](https://github.com/apache/dubbo-getty)

dubbo-getty 是一个Go语言异步网络 io 库，支持 tcp/udp/websocket 协议。

### Dubbo-go-hessian2

[github.com/apache/dubbo-go-hessian2](https://github.com/apache/dubbo-go-hessian2)

Dubbo-go-hessian2 是一个Go语言 hessian2 序列化协议库

### Dubbogo-tools

[github.com/dubbogo/tools](https://github.com/dubbogo/tools)

包括
- dubbo-cli 工具（废弃）
- imports-formatter Go语言 imports 块格式化工具
- protoc-gen-triple PB编译插件
- protoc-gen-dubbo3grpc PB编译插件