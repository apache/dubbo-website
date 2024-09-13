---
aliases:
    - /zh/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
    - /zh-cn/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
    - /zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/
description: 本文具体说明了用户在升级到 Dubbo3 之后，如何快速开启应用级服务发现新特性，从接口级服务发现平滑迁移到应用级服务发现。
linkTitle: 升级到应用级服务发现
title: 升级到应用级服务发现
type: docs
weight: 3
---

{{% alert title="请注意" color="warning" %}}
* 本文档内容并不是升级 Dubbo3 必须的，您完全可以只升级框架并使用 [框架的服务发现默认行为](/zh-cn/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/migration-service-discovery/#启用应用级服务发现)。
* 本文档更适用于 Dubbo2 老用户，用于了解在升级到 Dubbo3 版本后，框架中的服务发现模型切换过程与工作原理。新用户请直接 [配置启用应用级服务发现](/zh-cn/overview/mannual/java-sdk/tasks/service-discovery/nacos/#13-配置并启用-nacos)。
{{% /alert %}}

对于 Dubbo2 老用户而言，在升级 Dubbo3 时有以下两个选择，而决策的考虑因素仅有一个：性能。
1. 如果您的集群规模不算大，之前使用 Dubbo2 未遇到任何地址推送等性能问题，完全可以继续使用接口级别服务发现
2. 如果您集群规模较大，之前使用 Dubbo2 遇到服务发现负载飙高等问题，则建议迁移到新的应用级服务发现

基于以上决策结论，请在升级 Dubbo3 框架时调整以下配置。

## 继续使用接口级服务发现

在升级到 Dubbo3 框架时，您需要调整应用配置如下，（仅仅是一个配置项调整，提供者应用必须配置、消费者应用可选）：

```xml
<dubbo:application name="xxx" register-mode="interface">
```

或者

```yaml
dubbo:
 application:
   name: xxx
   register-mode: interface #表示继续使用老版本服务发现模型，可选值 interface、instance、all
```

或者，以上是全局默认配置，可以根据每个注册中心来单独配置

```xml
<dubbo:registry address="nacos://localhost:8848" register-mode="interface">
```

或者

```yaml
dubbo:
 registry:
   address: nacos://localhost:8848
   register-mode: interface #表示继续使用老版本服务发现模型，可选值 interface、instance、all
```

## 启用应用级服务发现(默认)
对于老用户而言，如果要启用应用级服务发现，就需要一个平滑迁移的过程。这时需要让新升级的 Dubbo3 应用进行双注册双订阅（当前框架默认行为，因此用户无需修改任何配置，以下内容均会自行发生，注意：未来版本可能切换为应用级单注册单订阅），以确保新老服务发现模型都能兼顾。

{{% alert title="请注意" color="warning" %}}
对于新用户而言，可以直接配置 `dubbo.application.register-mode=instance`，即在一开始就配置仅使用应用级服务发现。
{{% /alert %}}

### 提供者端注册行为
在默认情况下，Dubbo3 框架会同时注册接口级、应用级两种服务发现地址，因此，集群中的新老应用都能够正常的发现改应用地址，并正常发起调用。如下图所示：


<img alt="dubbo应用级服务发现" style="max-width:800px;height:auto;" src="/imgs/v3/migration/provider-registration.png"/>

### 消费者端订阅行为
在默认情况下，Dubbo3 框架具备同时发现 Dubbo2 与 Dubbo3 地址列表的能力。在默认情况下，如果集群中存在可以消费的 Dubbo3 的地址，将自动消费 Dubbo3 的地址，如果不存在新地址则自动消费 Dubbo2 的地址（Dubbo3 提供了开关来控制这个行为），具体如下图所示：

<img alt="dubbo应用级服务发现" style="max-width:800px;height:auto;" src="/imgs/v3/migration/consumer-subscription.png"/>

### 状态收敛

关于以上双注册、双订阅行为的更多详细解释，以及如何尽快完成服务发现模型的收敛，请参考博客文章 [Dubbo3 服务发现平滑迁移步骤与原理](/zh-cn/blog/2024/05/13/如果从接口级服务发现平滑迁移到应用级服务发现/)。

