---
aliases:
    - /zh/docs3-v2/golang-sdk/sourcecode/
    - /zh-cn/docs3-v2/golang-sdk/sourcecode/
    - /zh-cn/overview/mannual/golang-sdk/sourcecode/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/
description: 当前 Dubbo Go 运行时架构与扩展点源码指南
title: 源码指南
type: docs
weight: 5
---

本节从源码入口解释当前 Dubbo Go 的运行时：整体架构、protocol、registry 与服务发现、泛化调用、应用/接口配置，以及扩展加载机制。

如果你想先理解端到端调用链，建议从[架构](/zh-cn/overview/mannual/golang-sdk/sourcecode/architecture/)开始；之后再阅读 protocol、registry 和 extension 相关页面。
