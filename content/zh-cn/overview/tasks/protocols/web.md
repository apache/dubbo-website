---
aliases:
    - /zh/overview/tasks/protocols/web/
description: ""
linkTitle: 开发 Web 应用
title: 使用 Dubbo 开发 Web 应用
type: docs
weight: 2
---

文档编写中...

Dubbo3 HTTP 协议支持仍在建设中，目前最新的 3.3 开发分支已经有初版原型供体验。正式的生产可用版本预计会在 3.4/3.4 的某个正式版本发布。

以下是 Dubbo3 HTTP 协议与编程模式计划支持的几种业务场景：
* 调用 http 协议的微服务体系
* 发布 http 协议的服务
* 多协议发布，一个服务同时发布 http&dubbo 协议

## 调用 http 协议的微服务体系
一个典型的应用场景是 Dubbo 调用 Spring Cloud 开发的微服务体系。

不同体系的互通，最关键的两点便是地址格式与编码协议的兼容，只要 Dubbo 能自动发现 SpringCloud 体系的地址并能基于 HTTP 协议进行通信即可。Dubbo3 可以做到：
* 支持 SpringCloud 体系的服务发现地址格式
* 支持 HTTP+JSON 的数据传输格式

![img](/imgs/v3/tasks/protocol/http-usecase-1.png)

基于以上分析，当我们需要调用 Spring Cloud 体系的服务时，只需要在 Dubbo 侧编写标准的 Dubbo Reference 服务引用就可以。同时，为了简化开发工作，**Dubbo 支持标准的 Spring Web 注解**，因此，如果你可以直接在 Dubbo 中复用 Spring Cloud 中的接口定义：

Spring Cloud 侧的服务定义：
```java
interface SpringCloudRestService {
 //xxx
}
```

在 Dubbo 侧唯一要做的工作就是定义 Dubbo Reference：

```java
@DubboReference
private SpringCloudRestService restService;
```

## 发布 http 协议的服务


## 多协议发布

![img](/imgs/v3/tasks/protocol/http-usecase-1.png)
