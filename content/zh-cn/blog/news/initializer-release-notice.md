---
title: "Dubbo 脚手架正式发布，帮你快速创建项目模板"
linkTitle: "Dubbo 脚手架正式发布，帮你快速创建项目模板"
date: 2023-06-04
tags: ["新闻动态"]
description: >
  使用项目脚手架快速创建 Dubbo Spring Boot 项目模板，帮你解决项目初始化问题。
---

通过这篇文章，你将学习如何在 1 分钟内用 Dubbo Initializer 模板快速创建 Dubbo Spring Boot 项目，帮你解决项目初始化问题。

<a href="https://start.dubbo.apache.org" target="_blank">Dubbo Initializer</a> 可用来快速生成 Java 项目脚手架，帮助简化微服务项目搭建、基本配置、组件依赖管理等。

> Initializer 仍在持续更新中，更多 Dubbo Feature 的支持将会陆续发布。

## 选择 Dubbo 版本
Initializer 将使用 `dubbo-spring-boot-starter` 创建 Spring Boot 项目，因此我们首先需要选择 Dubbo 与 Spring Boot 的版本。

![initializer-choose-version](/imgs/v3/tasks/develop/initializer-choose-version.png)

## 录入项目基本信息
接下来，填入项目基本信息，包括项目坐标、项目名称、包名、JDK 版本等。

![initializer-project-info](/imgs/v3/tasks/develop/initializer-project-info.png)

## 选择项目结构
有两种项目结构可共选择，分别是 `单模块` 和 `多模块`，在这个示例中我们选择 `单模块`。

![initializer-project-architecture](/imgs/v3/tasks/develop/initializer-project-architecture.png)

* 单模块，所有组件代码存放在一个 module 中，特点是结构简单。
* 多模块，生成的项目有 `API`、`Service` 两个模块，其中 `API` 用于存放 Dubbo 服务定义，`Service` 用于存放服务服务实现或调用逻辑。通常多模块更有利于服务定义的单独管理与发布。

## 选择依赖组件
我们为模板默认选择如下几个依赖组件：
* Dubbo 组件
    * Java Interface
    * 注册中心，zookeeper
    * 协议 TCP
* 常用微服务组件
    * Web
    * Mybatis
    * 模版引擎

![initializer-dependencies](/imgs/v3/tasks/develop/initializer-dependencies.png)

基于以上选项，生成的项目将以 Zookeeper 为注册中心，以高性能 Dubbo2 TCP 协议为 RPC 通信协议，并且增加了 Web、Mybatis 等组件依赖和示例。

> 注意：上面选中的 Dubbo 组件也都是默认选项，即在不手动添加任何依赖的情况下，打开页面后直接点击代码生成，生成的代码即包含以上 Dubbo 组件。
>
> 如手动添加依赖组件，请注意 Dubbo 各个依赖组件之间的隐含组合关系限制，比如
> * 如果选择了【Dubbo Service API】-【IDL】，则目前仅支持选择 【Dubbo Protocol】中的 【HTTP/2】或 【gRPC】 协议。
> * 同一个依赖分组下，相同类型的依赖只能选择一个，比如 【Dubbo Registry&Config&Metadata】分组下，从注册中心视角【Zookeeper】、【Nacos】只能选一个，如果要设置多注册中心，请在生成的代码中手动修改配置。但注册中心、配置中心可以分别选一个，比如 Zookeeper 和 Apollo 可同时选中。

## 生成项目模板
* 点击 “浏览代码” 可在线浏览项目结构与代码
* 点击 “获取代码” 生成项目下载地址

![initializer-preview](/imgs/v3/tasks/develop/initializer-preview.png)

项目下载到本地后，解压并导入 IDE 后即可根据需要开发定制 Dubbo 应用。

## 总结

Dubbo Initializer 作为全面提升 Dubbo 易用性的一个重要规划，其功能仍在持续演进中。以下是正在推进的一些工作。

### IntelliJ IDEA 官方合作

IntelliJ IDEA 2023 近期刚刚发布集成 Dubbo 的官方框架 [Apache Dubbo in Spring Framework](https://plugins.jetbrains.com/plugin/20938-apache-dubbo-in-spring-framework)

当前，双方社区正在商讨基于 Dubbo Initializer 的集成方案，相信用不了多久，我们就能在你最喜欢的 IDE 中看到 Dubbo 项目模板的官方支持了。

### Dubbo Boot Starters

除了 Dubbo Initializer 之外，Dubbo 社区还正在建设一批 Dubbo Boot Starters，目标是让用户能够做到零配置使用 Dubbo 框架，只需要引入 starter 依赖即可，不必关心繁琐的 pom 依赖和默认配置。
请在此快速体验 [Dubbo Initializer](https://start.dubbo.apache.org/) 吧！