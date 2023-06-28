---
aliases:
    - /zh/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery/
    - /zh-cn/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery/
description: 本文档专门针对使用 2.x 版本的老用户，详细阐述了升级到 3.x 后的默认地址注册与发现行为、如何平滑的迁移到新版本的地址模型。
linkTitle: 接口级服务发现迁移至应用级服务发现指南
title: 接口级服务发现迁移至应用级服务发现指南
type: docs
weight: 10
---






总体上来说，在地址注册与发现环节，`3.x` 是完全兼容 `2.x` 版本的，这意味着，用户可以选择将集群内任意数量的应用或机器升级到 `3.x`，同时在这个过程中保持与 `2.x` 版本的互操作性。

> 如关心迁移背后工作原理，请参考 [迁移规则详情与工作原理](../service-discovery-rule)

## 1 快速升级步骤

简单的修改 pom.xml 到最新版本就可以完成升级，如果要迁移到应用级地址，只需要调整开关控制 3.x 版本的默认行为。

1. 升级 Provider 应用到最新 3.x 版本依赖，配置双注册开关`dubbo.application.register-mode=all`（建议通过全局配置中心设置，默认已自动开启），完成应用发布。
2. 升级 Consumer 应用到最新 3.x 版本依赖，配置双订阅开关`dubbo.application.service-discovery.migration=APPLICATION_FIRST`（建议通过全局配置中心设置，默认已自动开启），完成应用发布。
3. 在确认 Provider 的上有 Consumer 全部完成应用级地址迁移后，Provider 切到应用级地址单注册。完成升级



以下是关于迁移流程的详细描述。

## 2 Provider 端升级过程详解

在不改变任何 Dubbo 配置的情况下，可以将一个应用或实例升级到 3.x 版本，升级后的 Dubbo 实例会默保保证与 2.x 版本的兼容性，即会正常注册 2.x 格式的地址到注册中心，因此升级后的实例仍会对整个集群仍保持可见状态。



同时新的地址发现模型（注册应用级别的地址）也将会自动注册。

![//imgs/v3/migration/provider-registration.png](/imgs/v3/migration/provider-registration.png)

通过 -D 参数，可以指定 provider 启动时的注册行为

```text
-Ddubbo.application.register-mode=all
# 可选值 interface、instance、all，默认是 all，即接口级地址、应用级地址都注册
```



另外，可以在配置中心修改全局默认行为，来控制所有 3.x 实例注册行为。其中，全局性开关的优先级低于 -D 参数。



为了保证平滑迁移，即升级到 3.x 的实例能同时被 2.x 与 3.x 的消费者实例发现，3.x 实例需要开启双注册；当所有上游的消费端都迁移到 3.x 的地址模型后，提供端就可以切换到 instance 模式（只注册应用级地址）。对于如何升级消费端到 3.x 请参见下一小节。

### 2.1 双注册带来的资源消耗

双注册不可避免的会带来额外的注册中心存储压力，但考虑到应用级地址发现模型的数据量在存储方面的极大优势，即使对于一些超大规模集群的用户而言，新增的数据量也并不会带来存储问题。总体来说，对于一个普通集群而言，数据增长可控制在之前数据总量的 1/100 ~ 1/1000

以一个中等规模的集群实例来说： 2000 实例、50个应用（500 个 Dubbo 接口，平均每个应用 10 个接口）。

​	假设每个接口级 URL 地址平均大小为 5kb，每个应用级 URL 平均大小为 0.5kb

​	老的接口级地址量：2000 * 500 * 5kb ≈ 4.8G

​	新的应用级地址量：2000 * 50 * 0.5kb  ≈ 48M

​	双注册后仅仅增加了 48M 的数据量。



## 3 Consumer 端升级过程

对于 2.x 的消费者实例，它们看到的自然都是 2.x 版本的提供者地址列表；

对于 3.x 的消费者，它具备同时发现 2.x 与 3.x 提供者地址列表的能力。在默认情况下，如果集群中存在可以消费的 3.x 的地址，将自动消费 3.x 的地址，如果不存在新地址则自动消费 2.x 的地址。Dubbo3 提供了开关来控制这个行为：

```text
dubbo.application.service-discovery.migration=APPLICATION_FIRST
# 可选值 
# FORCE_INTERFACE，只消费接口级地址，如无地址则报错，单订阅 2.x 地址
# APPLICATION_FIRST，智能决策接口级/应用级地址，双订阅
# FORCE_APPLICATION，只消费应用级地址，如无地址则报错，单订阅 3.x 地址
```

`dubbo.application.service-discovery.migration ` 支持通过 `-D` 以及 `全局配置中心` 两种方式进行配置。



![//imgs/v3/migration/consumer-subscription.png](/imgs/v3/migration/consumer-subscription.png)


接下来，我们就具体看一下，如何通过双订阅模式（APPLICATION_FIRST）让升级到 3.x 的消费端迁移到应用级别的地址。在具体展开之前，先明确一条消费端的选址行为：**对于双订阅的场景，消费端虽然可同时持有 2.x 地址与 3.x 地址，但选址过程中两份地址是完全隔离的：要么用 2.x 地址，要么用 3.x 地址，不存在两份地址混合调用的情况，这个决策过程是在收到第一次地址通知后就完成了的。**



下面，我们看一个`APPLICATION_FIRST`策略的具体操作过程。

首先，提前在全局配置中心 Nacos 配置一条配置项（所有消费端都将默认执行这个选址策略）：

![//imgs/v3/migration/nacos-migration-item.png](/imgs/v3/migration/nacos-migration-item.png)



紧接着，升级消费端到 3.x 版本并启动，这时消费端读取到`APPLICATION_FIRST`配置后，执行双订阅逻辑（订阅 2.x 接口级地址与 3.x 应用级地址）



至此，升级操作就完成了，剩下的就是框架内部的执行了。在调用发生前，框架在消费端会有一个“选址过程”，注意这里的选址和之前 2.x 版本是有区别的，选址过程包含了两层筛选：

* 先进行地址列表（ClusterInvoker）筛选（接口级地址 or 应用级地址）
* 再进行实际的 provider 地址（Invoker）筛选。

![//imgs/v3/migration/migration-cluster-item.png](/imgs/v3/migration/migration-cluster-invoker.png)

ClusterInvoker 筛选的依据，可以通过 MigrationAddressComparator SPI 自行定义，目前官方提供了一个简单的地址数量比对策略，即当 `应用级地址数量 == 接口级地址数量` 满足时则进行迁移。

> 其实 FORCE_INTERFACE、APPLICATION_FIRST、FORCE_APPLICATION 控制的都是这里的 ClusterInvoker 类型的筛选策略

 

### 3.1 双订阅带来的资源消耗

双订阅不可避免的会增加消费端的内存消耗，但由于应用级地址发现在地址总量方面的优势，这个过程通常是可接受的，我们从两个方面进行分析：

1. 双订阅带来的地址推送数据量增长。这点我们在 ”双注册资源消耗“ 一节中做过介绍，应用级服务发现带来的注册中心数据量增长非常有限。
2. 双订阅带来的消费端内存增长。要注意双订阅只存在于启动瞬态，在ClusterInvoker选址决策之后其中一份地址就会被完全销毁；对单个服务来说，启动阶段双订阅带来的内存增长大概能控制在原内存量的 30% ~ 40%，随后就会下降到单订阅水平，如果切到应用级地址，能实现内存 50% 的下降。



### 3.2 消费端更细粒度的控制

除了全局的迁移策略之外，Dubbo 在消费端提供了更细粒度的迁移策略支持。控制单位可以是某一个消费者应用，它消费的服务A、服务B可以有各自独立的迁移策略，具体是用方式是在消费端配置迁移规则：


```yaml
key: demo-consumer
step: APPLICATION_FIRST
applications:
 - name: demo-provider
   step: FORCE_APPLICATION
services:
 - serviceKey: org.apache.dubbo.config.api.DemoService:1.0.0
   step: FORCE_INTERFACE
```

使用这种方式能做到比较精细迁移控制，但是当下及后续的改造成本会比较高，除了一些特别场景，我们不太推荐启用这种配置方式。
[迁移指南](../service-discovery-rule/)官方推荐使用的全局的开关式的迁移策略，让消费端实例在启动阶段自行决策使用哪份可用的地址列表。



## 4 迁移状态的收敛

为了同时兼容 2.x 版本，升级到 3.x 版本的应用在一段时间内要么处在双注册状态，要么处在双订阅状态。

解决这个问题，我们还是从 Provider 视角来看，当所有的 Provider 都切换到应用级地址注册之后，也就不存在双订阅的问题了。

### 4.1 不同的升级策略影响很大

毫无疑问越早越彻底的升级，就能尽快摆脱这个局面。设想，如果可以将组织内所有的应用都升级到 3.x 版本，则版本收敛就变的非常简单：升级过程中 Provider 始终保持双注册，当所有的应用都升级到 3.x 之后，就可以调整全局默认行为，让 Provider 都变成应用级地址单注册了，这个过程并不会给 Consumer 应用带来困扰，因为它们已经是可以识别应用级地址的 3.x 版本了。

如果没有办法做到应用的全量升级，甚至在相当长的时间内只能升级一部分应用，则不可避免的迁移状态要持续比较长的时间。
在这种情况下，我们追求的只能是尽量保持已升级应用的上下游实现版本及功能收敛。推动某些 Provider 的上游消费者都升级到 Dubbo3，这样就可以解除这部分 Provider 的双注册，要做到这一点，可能需要一些辅助统计工具的支持。

1. 要能分析出应用间的依赖关系，比如一个 Provdier 应用被哪些消费端应用消费，这可以通过 Dubbo 提供的服务元数据上报能力来实现。
2. 要能知道每个应用当前使用的 dubbo 版本，可以通过扫描或者主动上报手段。
