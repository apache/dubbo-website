---
aliases:
  - /zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery/
title: "如果从接口级服务发现平滑迁移到应用级服务发现"
linkTitle: "Dubbo3 服务发现平滑迁移步骤与原理"
tags: ["Java","服务发现"]
date: 2024-05-13
description: >
   "Dubbo3 应用级服务发现迁移详情，如果从接口级服务发现平滑迁移到应用级服务发现，迁移规则详情与工作原理。"
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

1. 全局开关

应用配置（可以通过配置文件或者 -D 指定）`dubbo.application.register-mode` 为 instance（只注册应用级）、all（接口级+应用级均注册）开启全局的注册开关，配置此开关后，默认会向所有的注册中心中注册应用级的地址，供消费端服务发现使用。

```
# 双注册
dubbo.application.register-mode=all
```
```
# 仅应用级注册
dubbo.application.register-mode=instance
```
通过 -D 参数，可以指定 provider 启动时的注册行为

```text
-Ddubbo.application.register-mode=all
# 可选值 interface、instance、all，默认是 all，即接口级地址、应用级地址都注册
```

另外，可以在配置中心修改全局默认行为，来控制所有 3.x 实例注册行为。其中，全局性开关的优先级低于 -D 参数。

2. 注册中心地址参数配置

注册中心的地址上可以配置 `registry-type=service` 来显示指定该注册中心为应用级服务发现的注册中心，带上此配置的注册中心将只进行应用级服务发现。
> [参考示例](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-demo-servicediscovery-xml/servicediscovery-provider/src/main/resources/spring/dubbo-provider.xml)

```xml
<dubbo:registry address="nacos://${nacos.address:127.0.0.1}:8848?registry-type=service"/>
```

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

![//imgs/v3/migration/consumer-subscription.png](/imgs/v3/migration/consumer-subscription.png)

1. 默认配置（不需要配置）

升级到 Dubbo 3.0 后默认行为为接口级+应用级多订阅，如果应用级能订阅到地址就使用应用级的订阅，如果订阅不到地址则使用接口级的订阅，以此保证最大的兼容性。

2. 订阅参数配置

应用配置（可以通过配置文件或者 -D 指定）`dubbo.application.service-discovery.migration` 为 `APPLICATION_FIRST` 可以开启多订阅模式，配置为 `FORCE_APPLICATION` 可以强制为仅应用级订阅模式。
具体接口订阅可以在 `ReferenceConfig` 中的 `parameters` 中配置 Key 为 `migration.step`，Value 为 `APPLICATION_FIRST` 或 `FORCE_APPLICATION` 的键值对来对单一订阅进行配置。

`dubbo.application.service-discovery.migration ` 支持通过 `-D` 以及 `全局配置中心` 两种方式进行配置。

> [参考示例](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/test/java/org/apache/dubbo/demo/consumer/DemoServiceConfigIT.java)

```java
System.setProperty("dubbo.application.service-discovery.migration", "APPLICATION_FIRST");
```
```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<>(applicationModel.newModule());
referenceConfig.setInterface(DemoService.class);
referenceConfig.setParameters(new HashMap<>());
referenceConfig.getParameters().put("migration.step", mode);
return referenceConfig.get();
```

3. 动态配置（优先级最高，可以在运行时修改配置）

此配置需要基于配置中心进行推送，Key 为应用名 + `.migration` （如 `demo-application.migraion`），Group 为 `DUBBO_SERVICEDISCOVERY_MIGRATION`。规则体配置详见[接口级服务发现迁移至应用级服务发现指南](../migration-service-discovery/)。
> [参考示例](https://github.com/apache/dubbo-samples/blob/master/2-advanced/dubbo-samples-service-discovery/dubbo-servicediscovery-migration/dubbo-servicediscovery-migration-consumer/src/main/java/org/apache/dubbo/demo/consumer/UpgradeUtil.java)

```java
step: FORCE_INTERFACE
```


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

## 5. 迁移状态模型

在 Dubbo 3 之前地址注册模型是以接口级粒度注册到注册中心的，而 Dubbo 3 全新的应用级注册模型注册到注册中心的粒度是应用级的。从注册中心的实现上来说是几乎不一样的，这导致了对于从接口级注册模型获取到的 invokers 是无法与从应用级注册模型获取到的 invokers 进行合并的。为了帮助用户从接口级往应用级迁移，Dubbo 3 设计了 Migration 机制，基于三个状态的切换实现实际调用中地址模型的切换。

![//imgs/v3/migration/migration-1.png](/imgs/v3/migration/migration-1.png)

当前共存在三种状态，FORCE_INTERFACE（强制接口级），APPLICATION_FIRST（应用级优先）、FORCE_APPLICATION（强制应用级）。


FORCE_INTERFACE：只启用兼容模式下接口级服务发现的注册中心逻辑，调用流量 100% 走原有流程
APPLICATION_FIRST：开启接口级、应用级双订阅，运行时根据阈值和灰度流量比例动态决定调用流量走向
FORCE_APPLICATION：只启用新模式下应用级服务发现的注册中心逻辑，调用流量 100% 走应用级订阅的地址


### 5.1 规则体说明


规则采用 yaml 格式配置，具体配置下参考如下：
```yaml
key: 消费者应用名（必填）
step: 状态名（必填）
threshold: 决策阈值（默认1.0）
proportion: 灰度比例（默认100）
delay: 延迟决策时间（默认0）
force: 强制切换（默认 false）
interfaces: 接口粒度配置（可选）
  - serviceKey: 接口名（接口 + : + 版本号）（必填）
    threshold: 决策阈值
    proportion: 灰度比例
    delay: 延迟决策时间
    force: 强制切换
    step: 状态名（必填）
  - serviceKey: 接口名（接口 + : + 版本号）
    step: 状态名
applications: 应用粒度配置（可选）
  - serviceKey: 应用名（消费的上游应用名）（必填）
    threshold: 决策阈值
    proportion: 灰度比例
    delay: 延迟决策时间
    force: 强制切换
    step: 状态名（必填）
```


- key: 消费者应用名
- step: 状态名（FORCE_INTERFACE、APPLICATION_FIRST、FORCE_APPLICATION）
- threshold: 决策阈值（浮点数，具体含义参考后文）
- proportion: 灰度比例（0～100，决定调用次数比例）
- delay: 延迟决策时间（延迟决策的时间，实际等待时间为 1～2 倍 delay 时间，取决于注册中心第一次通知的时间，对于目前 Dubbo 的注册中心实现次配置项保留 0 即可）
- force: 强制切换（对于 FORCE_INTERFACE、FORCE_APPLICATION 是否不考虑决策直接切换，可能导致无地址调用失败问题）
- interfaces: 接口粒度配置



参考配置示例如下：
```yaml
key: demo-consumer
step: APPLICATION_FIRST
threshold: 1.0
proportion: 60
delay: 0
force: false
interfaces:
  - serviceKey: DemoService:1.0.0
    threshold: 0.5
    proportion: 30
    delay: 0
    force: true
    step: APPLICATION_FIRST
  - serviceKey: GreetingService:1.0.0
    step: FORCE_APPLICATION
```


### 5.1 配置方式说明
#### 1. 配置中心配置文件下发（推荐）


- Key:    消费者应用名 + ".migration"
- Group: DUBBO_SERVICEDISCOVERY_MIGRATION

 
配置项内容参考上一节


程序启动时会拉取此配置作为最高优先级启动项，当配置项为启动项时不执行检查操作，直接按状态信息达到终态。
程序运行过程中收到新配置项将执行迁移操作，过程中根据配置信息进行检查，如果检查失败将回滚为迁移前状态。迁移是按接口粒度执行的，也即是如果一个应用有 10 个接口，其中 8 个迁移成功，2 个失败，那终态 8 个迁移成功的接口将执行新的行为，2 个失败的仍为旧状态。如果需要重新触发迁移可以通过重新下发规则达到。


注：如果程序在迁移时由于检查失败回滚了，由于程序无回写配置项行为，所以如果此时程序重启了，那么程序会直接按照新的行为不检查直接初始化。


#### 2. 启动参数配置


- 配置项名：dubbo.application.service-discovery.migration
- 允许值范围：FORCE_INTERFACE、APPLICATION_FIRST、FORCE_APPLICATION



此配置项可以通过环境变量或者配置中心传入，启动时优先级比配置文件低，也即是当配置中心的配置文件不存在时读取此配置项作为启动状态。


#### 3. 本地文件配置



| 配置项名 | 默认值 | 说明 |
| --- | --- | --- |
| dubbo.migration.file | dubbo-migration.yaml | 本地配置文件路径 |
| dubbo.application.migration.delay | 60000 | 配置文件延迟生效时间（毫秒） |

配置文件中格式与前文提到的规则一致


本地文件配置方式本质上是一个延时配置通知的方式，本地文件不会影响默认启动方式，当达到延时时间后触发推送一条内容和本地文件一致的通知。这里的延时时间与规则体中的 delay 字段无关联。
本地文件配置方式可以保证启动以默认行为初始化，当达到延时时触发迁移操作，执行对应的检查，避免启动时就以终态方式启动。


### 5.2 决策说明
##### 1. 阈值探测


阈值机制旨在进行流量切换前的地址数检查，如果应用级的可使用地址数与接口级的可用地址数对比后没达到阈值将检查失败。


核心代码如下：
```java
if (((float) newAddressSize / (float) oldAddressSize) >= threshold) {
    return true;
}
return false;
```


同时 MigrationAddressComparator 也是一个 SPI 拓展点，用户可以自行拓展，所有检查的结果取交集。


##### 2. 灰度比例


灰度比例功能仅在应用级优先状态下生效。此功能可以让用户自行决定调用往新模式应用级注册中心地址的调用数比例。灰度生效的前提是满足了阈值探测，在应用级优先状态下，如果阈值探测通过，`currentAvailableInvoker` 将被切换为对应应用级地址的 invoker；如果探测失败 `currentAvailableInvoker` 仍为原有接口级地址的 invoker。


流程图如下：
探测阶段
![//imgs/v3/migration/migration-2.png](/imgs/v3/migration/migration-2.png)
调用阶段
![//imgs/v3/migration/migration-3.png](/imgs/v3/migration/migration-3.png)


核心代码如下：
```java
// currentAvailableInvoker is based on MigrationAddressComparator's result
if (currentAvailableInvoker != null) {
    if (step == APPLICATION_FIRST) {
        // call ratio calculation based on random value
        if (ThreadLocalRandom.current().nextDouble(100) > promotion) {
            return invoker.invoke(invocation);
        }
    }
    return currentAvailableInvoker.invoke(invocation);
}

```


### 5.3 切换过程说明


地址迁移过程中涉及到了三种状态的切换，为了保证平滑迁移，共有 6 条切换路径需要支持，可以总结为从强制接口级、强制应用级往应用级优先切换；应用级优先往强制接口级、强制应用级切换；还有强制接口级和强制应用级互相切换。
对于同一接口切换的过程总是同步的，如果前一个规则还未处理完就收到新规则则回进行等待。


###### 1. 切换到应用级优先


从强制接口级、强制应用级往应用级优先切换本质上是从某一单订阅往双订阅切换，保留原有的订阅并创建另外一种订阅的过程。这个切换模式下规则体中配置的 delay 配置不会生效，也即是创建完订阅后马上进行阈值探测并决策选择某一组订阅进行实际优先调用。由于应用级优先模式是支持运行时动态进行阈值探测，所以对于部分注册中心无法启动时即获取全量地址的场景在全部地址通知完也会重新计算阈值并切换。
应用级优先模式下的动态切换是基于服务目录（Directory）的地址监听器实现的。
![//imgs/v3/migration/migration-4.png](/imgs/v3/migration/migration-4.png)


###### 2. 应用级优先切换到强制


应用级优先往强制接口级、强制应用级切换的过程是对双订阅的地址进行检查，如果满足则对另外一份订阅进行销毁，如果不满足则回滚保留原来的应用级优先状态。
如果用户希望这个切换过程不经过检查直接切换可以通过配置 force 参数实现。
![//imgs/v3/migration/migration-5.png](/imgs/v3/migration/migration-5.png)
###### 3. 强制接口级和强制应用级互相切换


强制接口级和强制应用级互相切换需要临时创建一份新的订阅，判断新的订阅（即阈值计算时使用新订阅的地址数去除旧订阅的地址数）是否达标，如果达标则进行切换，如果不达标会销毁这份新的订阅并且回滚到之前的状态。
![//imgs/v3/migration/migration-6.png](/imgs/v3/migration/migration-6.png)
