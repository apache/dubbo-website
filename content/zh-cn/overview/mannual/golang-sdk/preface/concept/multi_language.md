---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/concept/multi_language/
    - /zh-cn/docs3-v2/golang-sdk/preface/concept/multi_language/
description: 多语言 RPC
keywords: 多语言 RPC
title: 多语言 RPC
type: docs
---







![img](/imgs/docs3-v2/golang-sdk/concept/rpc/multi_language/dubbogo-3.0-invocation.png)

### 跨语言调用

随着微服务场景的大范围应用，多语言场景越来越普遍，开发人员更愿意使用更适合的语言，来实现一个复杂系统的不同模块。例如使用 C 来编写网关，使用 Go 来编写 K8S 资源 operator，使用 Java 来编写业务应用。语言与场景并不是绑定的，企业往往可以结合自身发展的技术栈、开发人员的专长，来选型合适的语言。

在多语言场景中，跨语言调用能力就显得十分重要。

跨语言能力本质上是 [【网络协议】](../protocol/) 提供的能力。如何方便地让用户使用需要的网络协议、针对合适的跨语言场景进行开发、享受 Dubbo 生态的服务治理能力，是 Dubbo-go 服务框架所关心的。

### 跨生态

Dubbo-go 服务框架提供了跨生态的能力，开发人员可以使用 Dubbo-go 以及其 [生态项目](../../../refer/ecology/) 建立 HTTP/前端服务、Dubbo/Spring 应用、gRPC 生态应用之间的联系。