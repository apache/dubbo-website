---
aliases:
    - /zh/overview/what/advantages/usability/
description: 快速易用
linkTitle: 快速易用
title: 快速易用
type: docs
weight: 1
---



无论你是计划采用微服务架构开发一套全新的业务系统，还是准备将已有业务从单体架构迁移到微服务架构，Dubbo 框架都可以帮助到你。Dubbo 让微服务开发变得非常容易，它允许你选择多种编程语言、使用任意通信协议，并且它还提供了一系列针对微服务场景的开发、测试工具帮助提升研发效率。

## 多语言 SDK
Dubbo 提供几乎所有主流语言的 SDK 实现，定义了一套统一的微服务开发范式。Dubbo 与每种语言体系的主流应用开发框架做了适配，总体编程方式、配置符合大多数开发者已有编程习惯。

比如在 Java 语言体系下，你可以使用 `dubbo-spring-boot-starter` 来开发符合 Spring、Spring Boot 模式的微服务应用，开发 Dubbo
应用只是为 Spring Bean 添加几个注解、完善 application.properties 配置文件。

![sdk](/imgs/v3/what/sdk.png)

## 任意通信协议
Dubbo 微服务间远程通信实现细节，支持 HTTP、HTTP/2、gRPC、TCP 等所有主流通信协议。与普通 RPC 框架不同，Dubbo 不是某个单一 RPC 协议的实现，它通过上层的 RPC 抽象可以将任意 RPC 协议接入 Dubbo 的开发、治理体系。

多协议支持让用户选型，多协议迁移、互通等变得更灵活。

![protocols](/imgs/v3/what/protocol.png)

## 加速微服务开发

### 项目脚手架
<a href="https://start.dubbo.apache.org/bootstrap.html" target="_blank">项目脚手架</a> 让 Dubbo 项目创建、依赖管理更容易。

比如通过如下可视化界面，勾选 Dubbo 版本、Zookeeper 注册中心以及必要的微服务生态选项后，一个完整的 Dubbo 项目模板就可以自动生成，接下来基于脚手架项目添加业务逻辑就可以了。更多脚手架使用方式的讲解，请参见任务模块的 [通过模板生成项目脚手架](../../../tasks/develop/template/)

![脚手架示例图](/imgs/v3/advantages/initializer.png)

### 开发测试
相比于单体应用，微服务分布式的特性会让不同组织之间的研发协同变得困难，这时我们需要有效的配套工具，用来提升整体的微服务研发效率。

Dubbo 从内核设计和实现阶段就考虑了如何解决开发、测试与运维问题，比如 Dubbo RPC 协议均支持 curl 访问，让开发协作更简单；配合官方提供的生态工具，可以实现服务测试、服务 Mock、文档管理、单机运维等能力，并通过 Dubbo Admin 控制台将所有操作都可视化的展现出来。

![admin](/imgs/v3/what/admin.png)
