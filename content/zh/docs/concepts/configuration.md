---
type: docs
title: "配置管理"
linkTitle: "配置"
weight: 4
description: "描述 Dubbo 支持的配置，Dubbo 的动态配置能力。"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/config/)。
{{% /pageinfo %}}

Dubbo配置主要分为几大类： 启动阶段配置项、服务治理规则、动态配置项。

## 启动阶段配置项
Dubbo启动时读取的配置项，用于初始化各个组件，不会监听这些配置项的变化。

Dubbo的配置来源有多种，配置项划分为多个配置组件，详细请参考 [配置概述](../../references/configuration/overview)。

### 配置方式
按照编程方式可以分为四种方式：API配置、XML配置、Annotation配置、属性配置。

#### API配置
以Java编码的方式组织配置，包括Raw API和Bootstrap API，具体请参考[API配置](../../references/configuration/api)。

#### XML配置
以XML方式配置各种组件，支持与Spring无缝集成，具体请参考[XML配置](../../references/configuration/xml)。

#### Annotation配置
以注解方式暴露服务和引用服务接口，支持与Spring无缝集成，具体请参考[Annotation配置](../../references/configuration/annotation)。

#### 属性配置
根据Key-value属性生成配置组件，类似SpringBoot的ConfigurationProperties，具体请参考[属性配置](../../references/configuration/properties)。

属性配置的另外一个重要的功能特性是[属性覆盖](../../references/configuration/properties#属性覆盖)，使用外部属性的值覆盖已创建的配置组件属性。

如果要将属性配置放到外部的配置中心，请参考[外部化配置](../../references/configuration/external-config)。


## 服务治理规则
服务治理规则主要作用是改变运行时服务的行为和选址逻辑，达到限流，权重配置等目的，包括覆盖规则、标签路由、条件路由。

Dubbo启动后监听服务治理相关的配置项，当配置发生变化时，会自动进行相应的处理。

服务治理规则的用法介绍请参考 [服务治理和配置管理](../../../docsv2.7/admin/ops/governance)

服务治理规则的存储方法请参考 [配置中心#服务治理](../../references/config-center#服务治理)

## 动态配置项
动态配置项一般用于控制动态开关。

Dubbo启动后监听动态配置项，当配置发生变化时，会自动进行相应的处理。

动态配置的存储方式请参考 [配置中心#动态配置](../../references/config-center#动态配置)

常用的动态配置项如下：

**[TODO 补充动态配置项说明]**

| 名称 | 描述 | 默认值|
| -----| ---- |  ----|
| dubbo.application.migration.threshold |  |  |
| dubbo.application.service-discovery.migration |  |  |

