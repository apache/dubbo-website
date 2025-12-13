---
aliases:
- /zh/docs3-v2/dubbo-go-pixiu/overview/
- /zh-cn/docs3-v2/dubbo-go-pixiu/overview/
- /zh-cn/overview/reference/pixiu/overview/
- /zh-cn/overview/mannual/dubbo-go-pixiu/overview/
description: 了解使用 Pixiu Gateway 的基本概念。
title: Gateway API 扩展
type: docs
weight: 30
---
> 扩展功能目前处于实验阶段，部分功能可能尚未完全生效，后续版本将持续完善并逐步提供完整支持。

## 概述
Gateway API 扩展是用于标准 Kubernetes Gateway API 能力之上提供额外功能，这些扩展由具体 Gateway API 实现的开发与维护团队提供。Gateway API 在设计之初即强调可扩展性与安全性，为功能扩展提供了明确且受约束的机制。

在 Ingress API 中，新增功能通常依赖自定义注解实现，但注解缺乏类型约束，配置的正确性难以及时验证。相比之下，Gateway API 通过扩展机制允许实现者以类型安全的自定义资源定义形式提供能力，使配置具备明确的结构和校验规则。

## Pixiu Gateway 中的 Gateway API 扩展