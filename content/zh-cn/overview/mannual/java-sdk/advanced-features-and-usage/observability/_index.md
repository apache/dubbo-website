---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/observability/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/observability/
description: 可观测性
linkTitle: 可观测性
title: 可观测性
type: docs
weight: 2
---






## 什么是可观测性
可观测性是从外部观察正在运行的系统的内部状态的能力。它由日志记录、指标和跟踪三大支柱组成。

## Dubbo 可观测性
为了深入观察Dubbo内部的运行状况，Dubbo可观测性包括许多附加功能，帮助您在将应用程序推向生产时监视和管理应用程序。您可以选择使用HTTP端点或JMX来管理和监视应用程序。审计、运行状况和度量收集也可以自动应用于应用程序。

## Dubbo Java 可观测性实现
- [如何开启指标采集](./meter/)
- [如何开启链路追踪](./tracing/)
- [日志管理](./logging/)