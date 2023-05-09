---
title: "一文帮你快速了解 Dubbo 核心能力"
linkTitle: "一文帮你快速了解 Dubbo 核心能力"
date: 2023-02-23
description: >
    Apache Dubbo 是一款微服务开发框架，它帮助解决微服务开发中的通信问题，同时为构建企业级微服务的提供服务治理能力，Dubbo 不绑定编程语言，我们的目标是为所有主流语言提供对等的微服务开发体验 。
---

## Dubbo 简介

### 一句话定义
Apache Dubbo 是一款微服务开发框架，它帮助解决微服务开发中的通信问题，同时为构建企业级微服务的提供服务治理能力，Dubbo 不绑定编程语言，我们的目标是为所有主流语言提供对等的微服务开发体验。
![overview](/imgs/blog/2023/2/introduction/1-overview.jpg)

### 基本架构

![overview](/imgs/blog/2023/2/introduction/2-arc.jpg)

Dubbo 从架构图上分为数据面和控制面。在数据面，使用 Dubbo 开发的微服务进程间基于 RPC 协议通信。DubboAdmin 控制面作为服务治理的抽象入口，由一系列可选的服务治理组件构成，负责 Dubbo集群的服务发现、流量管控策略、可视化监测。

### 行业应用

![overview](/imgs/blog/2023/2/introduction/3-usecase.jpg)

Dubbo 设计用于解决阿里巴巴内部大规模 微服务集群实践难题，当前已被广泛应用于几乎所有行业的微服务实践中。

![overview](/imgs/blog/2023/2/introduction/4-usecase-alibaba.jpg)

以阿里巴巴为例，在 2021 年，阿里巴巴基于内部多年 HSF 框架实践积累，面向云原生架构设计了下一代微服务框架 Dubbo3，用于解决性能、治理升级、服务网格等一系列问题；截止目前，阿里巴巴已全面完成从 HSF到 Dubbo3 的迁移，核心业务都跑在开源 Dubbo3 之上。

## Dubbo 到底提供了哪些核心能力？

### 提供微服务抽象与框架

![overview](/imgs/blog/2023/2/introduction/5-framework.jpg)

首先，Dubbo 作为服务开发框架解决了业务应用中微服务定义、暴露、通信与治理的问题，为业务应用开发定义了一套微服务编程范式。
具体来说，Dubbo 为业务应用提供了微服务开发API、RPC 协议、服务治理三大核心能力，让开发者真正的专注业务逻辑开发。

![overview](/imgs/blog/2023/2/introduction/6-extensibility.jpg)

Dubbo 不是应用框架的替代者，它可以很好的工作在每种语言的主流编程框架之上，以 Java 为例，Dubbo 可以很好的与 Spring 协作，并在此基础上提供服务定义、微服务编程、服务发现、负载均衡、流量管控等能力。

### 提供灵活的通信协议切换能力


在通信方面，Dubbo 区别于其他 RPC 框架的是它不绑定特定协议，你可以在底层选用 HTTP./2、TCP、gRPC、REST、Hessian 等任意通信协议，同时享受统一的 API、以及对等的服务治理能力。

### 一切皆可扩展
![overview](/imgs/blog/2023/2/introduction/8-extensibility.jpg)

Dubbo 的另一个优势在于其可扩展性设计，从流量管控、协议编码、诊断调优、再到服务治理，你都可以去扩展，满足企业级微服务开发与运维的所有诉求。

### 丰富的生态
![overview](/imgs/blog/2023/2/introduction/9-ecosystem.jpg)

基于扩展能力 Dubbo 官方提供了丰富的生态适配，涵盖了所有主流的开源微服务组件。

### 服务网格
![overview](/imgs/blog/2023/2/introduction/10-mesh.jpg)

对于服务网格架构，Dubbo也可以轻松接入原生 Istio 体系；
在数据面支持与 Envoy 部署的 Proxy 模式，也支持无 Envoy 的 Proxyless 模式，提供更灵活的数据面选择。

## 构建企业级Dubbo 微服务有多简单？你只需要 4 步
我们以 Java 微服务开发为例。

### 第一步
![overview](/imgs/blog/2023/2/introduction/11-initializer.png)

使用 [官方脚手架](https://start.dubbo.apache.org/bootstrap.html) 快速创建项目模板，只需要选择依赖的版本、组件，点击 “获取代码” 即可

### 第二步
将模板项目导入 IDE 开发环境。
定义 Java 接口作为 Dubbo 服务。
![overview](/imgs/blog/2023/2/introduction/12-interface.jpg)

开发 Dubbo 服务端，实现接口并完成业务逻辑编码，通过一条简单的注解配置完成服务发布。
![overview](/imgs/blog/2023/2/introduction/13-impl.jpg)

开发Dubbo 客户端，通过注解声明 Dubbo 服务，然后就可以发起远程方法调用了。至此，开发工作完成。
![overview](/imgs/blog/2023/2/introduction/14-reference.jpg)


### 第三步
进入部署环节，我们选择 Kubernetes 作为部署环境。

首先，通过一条命令安装 dubbo-admin 等服务治理组件，安装成功之后，我们查看部署状态。接下来，开始部署业务应用，随后查看确认直到应用已经正常启动
![overview](/imgs/blog/2023/2/introduction/15-deploy.jpg)

然后，我们就可以打开 Admin 控制台查看服务部署与调用情况了。这里是 Dubbo Admin 控制台的页面显示效果，可以看到刚才启动的 Dubbo 服务部署状态；除此之外，Admin 还提供了更详细的流量监控监测，点击服务统计，可进入监控页面

![overview](/imgs/blog/2023/2/introduction/16-admin.jpg)

你可以在此了解Dubbo 集群的详细运行状态，包括每个应用对外服务和调用服务的情况，QpS、成功率等，还可以查看每个实例的资源健康状况。

![overview](/imgs/blog/2023/2/introduction/17-grafana1.png)

### 第四步
进行流量管控。当应用已经平稳运行后，进一步控制流量的访问行为，包括实现金丝雀发布、全链路灰度、动态调整超时时间、调整权重、按比例流量分发、参数路由等。控制台提供了可视化的流量治理规则操作入口，在这里可以直接下发流量规则。

![overview](/imgs/blog/2023/2/introduction/19-gray.jpg)

以一个线上环境的灰度隔离示例，通过 Dubbo 流量管控机制，我们可以给每个应用的一部分机器打上 gray 标签，接下来，对于入口为 gray 的流量，就可以控制确保它只在有 gray 标记的 Dubbo 实例内流转，实现了全链路的逻辑隔离效果，
对于隔离多套开发环境、线上灰度测试等场景都非常有用。

![overview](/imgs/blog/2023/2/introduction/20-region.jpg)

对于同区域优先调用的场景，这里有两个应用做了多区域部署，紫色是杭州区域、蓝色是北京区域，部署在橙色区域的应用会优先访问同区域的应用，以此降低访问延迟，蓝色区域部署的服务亦是如此。

![overview](/imgs/blog/2023/2/introduction/21-region.jpg)

当应用在同区域区域部署的实例不可用时，调用会自动跨区域切换到其他可用区，确保整体可用性。

## 总结
接下来，请开始你的Dubbo 之旅吧。
