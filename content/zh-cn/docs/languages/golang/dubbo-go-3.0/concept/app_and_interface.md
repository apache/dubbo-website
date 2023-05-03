---
aliases:
    - /zh/docs/languages/golang/dubbo-go-3.0/concept/app_and_interface/
description: Dubbo-go 的应用和接口
keywords: Dubbo-go 的应用和接口
linkTitle: 服务层级
title: Dubbo-go 的应用和接口
type: docs
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/golang-sdk/preface/design/app_and_interface/)。
{{% /pageinfo %}}

# Dubbo-go 服务层级

Dubbo-go 服务层级为两个级别：分别是应用级别(App Level)和接口级别(Interface Level)，该服务分层与**框架配置**结构息息相关。

如下图所示，可以看到，应用级别的组件以浅红色标注，接建立如下文件目录口级别的组件以浅蓝色标注：

![img](/imgs/golang/3.0/dubbogo-concept.png)

## 1. 应用级别组件

应用级别组件的特点：被当前应用的所有接口级别组件共用。

应用级别的主要组件如下：

- 应用信息模块

  包含应用维度相关信息，包括应用名、版本号、数据上报方式等

- Consumer 模块

  Consumer 模块负责客户端相关信息，包括一个或多个引用（Reference）结构，以及超时、客户端过滤器（consumer filter）等相关信息。

- Provider 模块

  Provider 模块负责服务端相关信息，包括一个或多个服务（Service）结构、服务端过滤器（provider filter）等相关信息。

- 注册中心（Registry）模块

  注册中心模块负责定义好所要使用的一系列注册中心，例如框架支持的ZK、[Nacos](https://nacos.io/)、ETCD等中间件。应用级别的注册模块只负责声明，由接口级别的组件进行引用，引用时以用户自定义的注册中心ID（registryID) 作为索引。

- 协议（Protocol）模块

  协议模块只存在于服务端。

  协议模块关心服务的暴露信息，例如协议名、服务监听IP、端口号等信息。协议模块属于应用级别，只负责声明，由接口级别的组件进行引用，引用时以用户自定义的协议ID（protocolID) 作为索引。

- 元数据中心模块

  元数据中心类似于注册中心模块，负责声明框架需要使用的元数据中心，从而将元数据成功上报。

- 配置中心模块
- 路由模块
- 日志模块
- 监控模块

## 2. 接口级别组件

- 服务（Service）模块

  服务模块被使用于任何暴露的服务，声明接口暴露所需的信息，包括例如接口名、协议、序列化方式等，负责单个服务接口的暴露。

- 引用（Reference）模块

  饮用模块被使用于需要调用的远程服务的客户端，其声明了需要请求接口所需的信息，包括例如接口名、协议、序列化方式等、负责特定协议的抽象，参与客户端的生成。

## 3. 说明

暴露的服务是接口级别的，一个用户定义的 Provider Struct/一个用户定义的Consumer Struct，对应一个Service/Reference 模块，一个应用可以同时存在Consumer 模块和 Provider 模块，因此可以同时存在多个Service/Reference 模块。
