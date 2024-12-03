---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: "通过示例演示基于 Kubernetes Service 的服务发现模式。"
linkTitle: 使用Kubernetes注册中心
title: 基于 Kubernetes Service 的服务发现
type: docs
weight: 5
---

上面两节我们分别讲解了 Nacos、Zookeeper 两种注册中心模式，它们更像是传统的注册中心解决方案。在 Kubernetes 部署环境下，Dubbo 支持基于 Kubernetes Service 的服务发现模式，其基本工作原理如下图所示：

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes-service.png" style="max-width:650px;height:auto;" />

在这种模式下，服务发现与用户的部署运维操作形成统一，用户定义标准的 Kubernetes Service、Deployment，并将其部署到 Kubernetes，之后 Control Plane 通过监控 APISERVER 资源并与 SDK 进程联动，形成一整套的服务发现体系。

关于使用 Kubernetes 作为注册中心的具体实践案例，请参考 [Kubernetes Service 部署]() 一节了解更多细节。





