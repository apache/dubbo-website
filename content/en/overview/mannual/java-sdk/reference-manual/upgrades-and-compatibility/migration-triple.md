---
aliases:
    - /zh/docs3-v2/java-sdk/upgrades-and-compatibility/migration-triple/
    - /zh-cn/docs3-v2/java-sdk/upgrades-and-compatibility/migration-triple/
    - /zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/migration-triple/
description: "如何平滑的从 dubbo 协议升级到 triple 协议。"
linkTitle: 升级到triple协议
title: 升级到triple协议
type: docs
weight: 2
---

{{% alert title="请注意" color="warning" %}}
* 本文档内容并不是升级 Dubbo3 必须的，您完全可以只升级框架并继续使用 dubbo 通信协议。
* 如果您是 Dubbo 新用户，强烈建议直接 [使用 triple 协议](/zh-cn/overview/mannual/java-sdk/tasks/protocol/) 即可。
{{% /alert %}}

本文档适合服务已经运行在 dubbo 协议之上的老用户，请先参考上一篇文档 [如何从 Dubbo2 升级到 Dubbo3](../migration/) 完成框架版本升级，然后遵循以下步骤以最小改动平滑迁移到 triple 协议。

以下是协议升级的架构图，展示了平滑升级过程中不同 Dubbo 应用的状态：


<img alt="dubbo协议迁移到tirple协议" style="max-width:800px;height:auto;" src="/imgs/v3/manual/java/migration/dubbo-to-triple.png"/>

按先后顺序，升级基本步骤如下：
1. Provider 提供者侧配置单端口双协议（dubbo、triple）发布
2. Provider 提供者侧配置首选协议为 triple（此时，提供者注册的URL地址为 `dubbo://host:port/DemoService?preferred-protocol=tri`）
3. Consumer 消费者升级，根据情况不同有以下两种方式：
	* 升级消费者到 3.3 版本，消费者会根据 `preferred-protocol=tri` 优先调用 triple 协议
	* 无法升级到 3.3 版本的消费者应用，可以配置 `@DubboReference(protocol="tri")` 调用 triple 协议
4. 推动所有应用升级到最新 Dubbo3 版本，最终所有流量都是 triple 协议

{{% alert title="请注意" color="warning" %}}
请注意，以上提到的单端口多协议、识别 `preferred-protocol` 首选协议等功能，需要 Dubbo 3.3.0+ 版本！
{{% /alert %}}

### 步骤一：提供者双协议发布
假设我们有以下应用配置，即在 20880 端口发布 dubbo 协议：
```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
```

我们需要增加两个配置项，如下所示：

```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
    ext-protocol: tri
    preferred-protocol: tri
```

其中，
* `ext-protocol: tri` 指定在原 20880 端口上额外发布 triple 协议，即单端口双协议发布。
* `preferred-protocol: tri` 会随注册中心同步到 Consumer 侧，告诉 consumer 优先使用 triple 协议调用

{{% alert title="注意" color="warning" %}}
`preferred-protocol: tri` 配置仅在 3.3.0 及之后版本支持，所以即使 provider 配置了这个选项，对于 3.3.0 版本即之前的 consumer 消费端并不会生效，还是会调用 dubbo 协议。
{{% /alert %}}

### 步骤二：消费端切换协议
提供端完成步骤一配置并重启后，消费端根据版本与配置不同，可能处于以下三种状态之一：

**1. 消费端是 3.3.0 及之后版本**

此类消费端会自动识别提供者 url 上的 `preferred-protocol: tri` 标记，如果发现此标记，则消费端自动使用 triple 协议调用服务，否则继续使用 dubbo 协议。

**2. 消费端是 2.x 或 3.3.0 之前版本**

由于低版本 Dubbo 框架不能识别 `preferred-protocol: tri` 参数，因此这部分消费者不受提供者端多协议发布的任何影响，继续调用 dubbo 协议。

**3. 消费端是 2.x 或 3.3.0 之前版本，且额外指定要调用的协议**

与第 2 种情况基本一致，只是这时用户可以明确的为某些服务指定使用哪种 rpc 协议，如：

```java
@DubboReference(protocol="tri")
private DemoService demoService;
```

或者

```xml
<dubbo:reference protocol="tri" />
```

在配置了 `protocol="tri"` 后，服务的调用会使用 triple 协议。需要注意的是，在配置 `protocol="tri"` 之前，一定要确保提供端已经发布了 triple 协议支持，否则调用将会失败。

{{% alert title="注意" color="warning" %}}
* 从以上三种情况可知，协议升级过程对消费端完全无感，消费端不会因提供端的多协议配置而出现任何通信障碍。
* 对于消费端，最简单的协议切换方式就是通过 `preferred-protocol=tri` 进行自动切换，需要两边版本都升级到 3.3.0+ 才支持。
{{% /alert %}}

### 步骤三：完全收敛到triple协议
步骤一、二操作起来非常简单，并且保证了过程平滑，通过单端口双协议、消费端自动切换保证了整个升级过程的平滑。

平滑升级意味着我们要经历一个中间态，即在某一段时间内，集群内 dubbo 协议、triple 协议共存（有些服务间通信是dubbo协议、有些服务间通信是triple协议）。如何才能推进达成终态目标那，即所有服务调用都使用 triple 协议？我们推荐使用以下两种方式达成目标：
* 推进集群内所有 Dubbo 应用都升级到 3.3.x 最新版本，这样消费端就能自动切换到 triple 协议
* 通过 Dubbo 框架的指标埋点，观察某个应用（作为provider）是否仍在处理 dubbo 流量，对这部分应用的上下游进行治理

{{% alert title="注意" color="info" %}}
对于 Dubbo 框架而言，集群内 dubbo 协议和 triple 协议共存的状态并不存在任何技术问题，不同的服务调用使用不同协议也很正常，因此双协议共存的中间态是完全可以接受的。但有时候为了整体方案统一，我们可能需要达成单一通信协议的终态目标。
{{% /alert %}}

