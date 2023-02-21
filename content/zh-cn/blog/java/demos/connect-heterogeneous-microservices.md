---
title: "使用 Dubbo 连接异构微服务体系"
linkTitle: "使用 Dubbo 连接异构微服务体系"
tags: ["Java"]
date: 2019-06-22
description: >
  在这篇文章中，我们将探索如何利用 Dubbo 对多协议、多服务发现模型的支持，来实现异构微服务体系间的互联互通
---

从编程开发的角度来说，Dubbo 首先是一款 RPC 服务框架，它最大的优势在于提供了面向接口代理的服务编程模型，对开发者屏蔽了底层的远程通信细节。同时 Dubbo 也是一款服务治理框架，它为分布式部署的微服务提供了服务发现、流量调度等服务治理解决方案。

在这篇文章中，我们将以以上基础能力为背景，尝试突破 Dubbo 体系自身，探索如何利用 Dubbo 对多协议、多服务发现模型的支持，来实现异构微服务体系间的互联互通。在实际业务场景中，这可以用来解决异构技术体系共存场景下的通信问题，帮助公司实现在异构技术体系间作平滑迁移，解决大规模跨区域、多集群部署场景的地址发现及流量调度等问题。

## 面向接口代理的透明服务开发框架

我们还是从 **Dubbo 是一个微服务开发框架** 这个大家熟知的概念开始。就像 Spring 是开发 Java 应用的基础框架一样，我们经常会选用 Dubbo 作为开发微服务业的基础框架。 Dubbo 框架的最大优势我认为就在其面向接口的编程模型，使得开发远程服务调用就像开发本地服务一样（以 Java 语言为例）：

1. 服务定义

```java
public interface GreetingsService {
    String sayHi(String name);
}
```

2. 消费方调用服务

```java
// 和调用本地服务一样，完全透明。
@Reference
private GreetingService greetingService;

public void doSayHello(String name) {
  greetingService.sayHi("Hello world!");
}
```

下图是 Dubbo 的基本工作原理图，服务提供者与服务消费者之间通过注册中心协调地址，通过约定的协议实现数据交换。

![Dubbo basic work flow](/imgs/architecture.png) 


## 同构/异构微服务体系面临的问题

关于 Dubbo 协议本身及其服务治理相关功能细节并不是本文的重点，我们今天将从一个更高的层次，来看看公司内部构建微服务体系所面的挑战，以及 Dubbo 能为架构选型和迁移等提供哪些解决思路。

一个公司内部的微服务可能都是基于某一个相同的服务框架开发的，比如说 Dubbo，对于这样的架构，我们称之为是**同构的微服务体系**；而有些公司的微服务可能是使用多个不同的服务框架所建设，我们称之为**异构的微服务体系**，多个不同技术栈微服务体系的共存在大型组织内还是非常普遍的，造成这种局面可能有很多原因。比如，可能是遗留系统带来的，也可能是公司正在做技术栈迁移，或者就是不同业务部门为了满足各自特殊需求而做的独立选型（这也意味着异构微服务体系的长期共存）。

**1. 异构微服务体系共存**

我们很容易想到的一个挑战是：**不同的体系间通常是使用不同的 RPC 通信协议、部署独立的注册中心集群，面对这种多协议、多注册中心集群的场景，要如何实现相互之间透明的地址发现和透明的 RPC 调用？**如果我们什么都不做，那么每个微服务体系就只能感知到自己体系内的服务状态，流量也在各自的体系内封闭。而要做到从体系 A 平滑的迁移到体系 B，或者想长期的保持公司内部多个体系的共存，则解决不同体系间的互联互通，实现流量的透明调度将是非常重要的环节。

![2](/imgs/blog/microservices.png) 


**2. Dubbo 体系内部**

**多协议、多注册中心集群的问题在同构的微服务体系中也可能存在，尤其是当一个组织内部的微服务规模增长到一定量级的时候。**

* 我们可能要在不同的服务之间采用不同的通信协议，因为不同的服务面临不同的业务场景，而这也进一步导致了数据传输特点的不同，我们需要分别采用更适合各类业务特点的协议。比如典型的场景：我们可能对于普通的业务服务采用 Dubbo 协议，对于和 FrontEnd 交互的服务需要 HTTP 协议，而对于需要流式数据传输的业务则采用 gRPC 协议等等。

* Dubbo 体系内部另一个常出现的问题是，在大规模分布式部署的场景下，微服务系统会做跨区域、跨注册中心的部署，这个时候就会出现多集群间地址同步和流量调度的问题。

总结起来，**不论是同构体系还是异构体系，都面临对多协议通信、多注册中心集群地址发现的问题。**Dubbo 目前是支持多协议、多注册中心的，可以说就是为解决我们上面分析的 Dubbo 同构体系内的场景而设计的，因此下面我们从同构体系的多协议、多注册中心场景讲起，先了解 Dubbo 多协议、多注册中心的基本支持情况以及它们是如何工作的。而在后面的一章再进一步探索怎么扩展这个能力来支持异构微服务体系的互联互通。

## Dubbo 体系内的多协议、多注册中心机制

我们将通过两个场景示例，来分别具体的讲一下 Dubbo 的多协议、多注册中心机制的使用方式和工作原理。

### 多协议

![multiregistries.png](/imgs/blog/multiregistries.png) 

以上是使用 Dubbo 开发的一套微服务，服务间通信使用到了不同的协议，根据我们的调研发现，公司内部启用多协议其实是非常普遍需求，具体场景在此我们暂不做解释。

应用 B 作为服务提供者，发布了 5 个服务，其中：

* `DemoService1` `DemoService2` 通过 `dubbo` 协议发布
* `DemoService3` `DemoService4` 通过 `gRPC` 协议发布
* `DemoService0`  通过 `dubbo` 、`gRPC` 双协议发布

应用 A 作为消费者，使用 dubbo 协议消费 `DemoService1` `DemoService2`，使用 gRPC 协议消费 `DemoService0`。

应用 B 作为消费者，使用 gRPC 协议消费 `DemoService2` `DemoService4`，使用 dubbo 协议消费 `DemoService0`。

以下是具体的代码配置：

1. 提供端应用 B

```xml
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService1" protocol="dubbo"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService2" protocol="dubbo"/>

<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService3" protocol="grpc"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService4" protocol="grpc"/>

<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService0" protocol="dubbo, grpc"/>
```

2. 消费端应用 A

```xml
<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService1"/>
<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService2"/>

<dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService0"/>
```

3. 消费端应用 C

```xml
<dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService3"/>                                                                                     <dubbo:reference protocol="grpc" interface="org.apache.dubbo.samples.basic.api.DemoService4"/>

<dubbo:reference protocol="dubbo" interface="org.apache.dubbo.samples.basic.api.DemoService0"/>

```

#### Dubbo 多协议支持现状

Dubbo 目前所支持的协议包括 Dubbo、REST、Thrift、gRPC、JsonRPC、Hessian 等，基本涵盖了业界大多数主流的 RPC 通信协议。需要注意的是，这些协议的支持都是以直接集成官方 Release 实现的形式来做的，我认为这是一个很好的选择，既保证了协议解析自身的稳定性，又能使 Dubbo 社区更专注的将更多的精力放在 Dubbo 外围服务治理能力的改善上。试想如果 Dubbo 社区自己为每个协议提供实现，那是要花费多少精力和时间才能使每种协议达到稳定的生产可用。

除了以上官方提供支持的协议之外，得益于 Dubbo 灵活的扩展机制，想要为 Dubbo 扩展协议非常容易，开发者可以随时为 Dubbo 增加更多的协议支持，包括自有协议扩展。

关于对 gRPC (HTTP/2) 协议的支持，请参阅上期文档

![dubbo-screen.png](/imgs/blog/dubbo-screen.png) 

#### 多协议能解决的问题

* 将 RPC 框架无缝地接入 Dubbo 的服务治理体系。

  通过协议扩展将 RPC 协议纳入 Dubbo 服务开发体系，从而复用 Dubbo 的编程模型和服务发现、流量管控等能力。比如 gRPC，其服务治理体系相对比较弱、编程 API 不够友好，很难直接用于微服务开发。

* 满足不同场景的调用需求。

  各个服务可能是为了满足不同业务需求而开发，同时外围消费端应用的技术栈也可能多种多样，通过启用不同的通信协议，可以最优化不同场景的通信需求。

* 实现协议间的迁移。

  通过支持多种协议，借助注册中心的协调，可以快速满足公司内协议迁移的需求。如从自有协议升级到 Dubbo 协议，Dubbo 协议自身升级，从 Dubbo 协议迁移到 gRPC，从 REST 迁移到 Dubbo 协议等。


### 多注册中心

当服务集群规模小的时候，一个中心化的集群部署方案能很好的解决我们的业务问题。但是随着应用规模的增长、用户流量的增加，我们就不得不考虑要为业务系统引入跨区域、多集群的部署方案，而此时同业务系统密切相关的注册中心集群也面临部署方案的选型：

1. 继续维持全局共享的注册中心集群。这种架构方案的优点是简单；缺点是注册中心集群由于要保存全量的地址数据，存储和推送压力会变得很大，另外对于一些注册中心产品（如 Zookeeper 等）在跨集群网络部署的场景下稳定性和性能可能都会面临挑战。

2. 每个业务集群部署独立的注册中心集群。多注册中心集群的优点是能解决跨集群网络可用性的问题，同时也能够减轻注册中心的存储和推送压力；缺点则是要求服务框架（如 Dubbo 等）能有同时发布/监听多个注册中心集群的能力。

下面我们具体看一下，Dubbo 为多注册中心集群场景提供的解决方案。

![multisubscribe.png](/imgs/blog/multisubscribe.png) 

上图有两个业务集群，分别部署在北京和上海，每个业务集群有自己独立的注册中心集群，要解决两个业务集群间服务的透明 RPC 通信问题。

1. 服务提供端，双注册中心发布

```xml
<dubbo:registry id="beijingRegistry" address="zookeeper://${zookeeper.address1}" default="false"/>                                                                           <dubbo:registry id="shanghaiRegistry" address="zookeeper://${zookeeper.address2}" />
                                                                                          
<dubbo:service interface="org.apache.dubbo.samples.multi.registry.api.HelloService" ref="helloService" registry="shanghaiRegistry,beijingRegistry"/>
<dubbo:service interface="org.apache.dubbo.samples.multi.registry.api.DemoService" ref="demoService" registry="shanghaiRegistry,beijingRegistry"/>

```

2. 服务消费端，根据消费需求做单/双注册中心订阅

```xml
<dubbo:registry id="beijingRegistry" address="zookeeper://${zookeeper.address1}" default="false" preferred="true" weight="100"/>                                                                                         <dubbo:registry id="shanghaiRegistry" address="zookeeper://${zookeeper.address2}" default="true" weight="20"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.DemoService"/>

<dubbo:reference  interface="org.apache.dubbo.samples.multi.registry.api.DemoService" registry="beijingRegistry, shanghaiRegistry"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.HelloService" registry="beijingRegistry"/>

<dubbo:reference interface="org.apache.dubbo.samples.multi.registry.api.HelloService" registry="shanghaiRegistry,shanghaiRegistry"/>

```

#### Dubbo 对异构注册中心集群的支持

虽然我们会做多注册中心集群部署，但通常情况下，我们部署的都是相同的注册中心产品，如都是 Zookeeper、Nacos；而对于注册中心迁移的场景，则要求 Dubbo 能提供对更多的注册中心产品的支持，或者最重要的要有很好的扩展能力。Dubbo 官方目前支持的注册中心实现有：

![dubbo-screen2.png](/imgs/blog/dubbo-screen2.png) 

这里需要特别提到的一点是，当前 Dubbo 的服务注册/发现模型是以接口为粒度的，而从 2.7.5 版本开始，Dubbo 新引入了应用粒度的服务注册/发现模型。这一方面有助于优化 Dubbo 当前服务发现机制、提升服务容量，另一方面对于联通以 SpringCloud 为代表的微服务体系也非常重要（关于这点在下一章中有进一步提及）。更多关于《应用粒度服务发现：服务自省》的介绍，我们将在接下来的文章或文档中予以补充，请持续关注。

#### 多订阅带来的流量调度问题

在引入多注册中心集群后，Dubbo 在流量选址时的多了一层注册中心集群间的负载均衡：

![cluster-lb.png](/imgs/blog/cluster-lb.png) 

在 Cluster Invoker 这一级，我们支持的选址策略有（2.7.5+ 版本，具体使用请参见文档）：

* 指定优先级

  ```xml
  <!-- 来自 preferred=“true” 注册中心的地址将被优先选择，只有该中心无可用地址时才 Fallback 到其他注册中心 -->
  <dubbo:registry address="zookeeper://${zookeeper.address1}" preferred="true" />
  ```

* 同 zone 优先

  ```xml
  <!-- 选址时会和流量中的 zone key 做匹配，流量会优先派发到相同 zone 的地址 -->
  <dubbo:registry address="zookeeper://${zookeeper.address1}" zone="beijing" />
  ```

* 权重轮询

  ```xml
  <!-- 来自北京和上海集群的地址，将以 10:1 的比例来分配流量 -->
  <dubbo:registry id="beijing" address="zookeeper://${zookeeper.address1}" weight=”100“ />
  <dubbo:registry id="shanghai" address="zookeeper://${zookeeper.address2}" weight=”10“ />
  ```

* 默认，stick to 任意可用

#### 多注册中心适用的场景

* 同区域流量优先调度

  出于容灾或者服务伸缩性需求，服务/应用往往需要部署在多个独立的机房/区域，在每个区域有独立注册中心集群的场景下，实现同区域的流量优先调度就能很好的解决延迟和可用性问题。

* 注册中心迁移

  公司的服务一直以来可能是存储在某一个注册中心，如 Zookeeper，但到了某个时间节点，因为各种各样的原因，当我们要迁移到另外的注册中心时，多注册中心模型能够保证平滑的迁移。

* 异构系统互通

  不同微服务体系开发的服务，都封闭在各自的服务发现体系中，而通过统一的多注册中心模型，可以实现不同体系的服务互相发现。

## 借助 Dubbo 联通异构的微服务体系

上文我们提到了在组织内存在异构微服务体系的各种合理可能性，现在我们来具体看一下异构微服务体系的实际场景，以及使用 Dubbo 实现互联互通的解决方法。首先我们先通过一张图来看一下，联通异构的微服务体系具体是一个什么样的场景。

![heterogeneous.png](/imgs/blog/heterogeneous.png) 

如上图所示，我们有部分微服务可以是基于 SpringCloud、gRPC、K8S 或者是自建体系构建的，他们各自之间默认是相互隔离无法联通的。当我们再构建一套基于 Dubbo 的微服务体系时，则利用 Dubbo 的多协议、多服务发现模型，我们就可以做到和各个微服务体系间的两两之间的互联互通。进一步的，如图中橙色箭头所示，依赖 Dubbo 体系作为桥接层，我们还可以实现两个异构微服务体系间的打通。

对于以下几个示例场景，由于在地址发现层面目前没有统一的标准，我们暂且假设地址发现层面不同的体系建是没有障碍的，我们将重点关注迁移的基本流程以及通信协议环节。（关于地址发现部分，我们将在后续《服务自省：基于应用粒度的服务发现》之后再深入探讨）

### Dubbo 体系内的协议迁移（共存）

绝大多数开发者对 Dubbo 有这么一个固有认知：使用 Dubbo 开发微服务系统，则就要用 Dubbo 协议来作为服务间的通信协议才是最优方案。实际上，我们完全没有必要只束缚在 Dubbo RPC 协议上。Dubbo 作为微服务开发框架和 Dubbo 作为 RPC 协议这是两个概念，其实是完全可以分开来看待的，比如我们用 Dubbo 框架开发的业务系统，选用 rest、gRPC 通信是完全没有问题的（参加 Dubbo 支持的协议列表），具体用什么协议根据业务特点和技术规划才是最适合的。

![grpcrest.png](/imgs/blog/grpcrest.png) 

当前在云原生、Mesh 的大背景下， HTTP1/2、gRPC 协议开始受到越来越多的关注，一方面原因自然是因为它们在标准化方面做的更好，得到的更多的网络设备和基础设施的支持，具备更好的通用性和穿透性。对于很多有云原生迁移意愿的企业来说，往此类协议迁移无疑将对之后的架构升级有更多的帮助。

下图演示了在 Dubbo 体系内，从 Dubbo 协议向 gRPC 协议迁移的一个中间状态。

![migrate.png](/imgs/blog/migrate.png) 

* 最左边的代表尚未迁移的老应用，这类应用在迁移过程中仍然要消费和提供 Dubbo 协议的服务。
* 中间的代表处于迁移中的应用，他们中间可能有些是服务提供者，既要为左边的老系统提供提供 Dubbo 协议服务；又要为右边的新系统提供 gRPC 服务；因此他们都是双协议暴露服务。
* 最右边则代表是新开发的或者已经迁移完成的应用，这个体系内已能完全用 gRPC 协议通信。
* 最终度过中间态后，我们期望所有的应用都达到最左边应用的状态，实现完全的 gRPC 协议通信。

### Spring Cloud 体系迁移到 Dubbo 体系（共存）

如前文所述，由于 SpringCloud 和 Dubbo 间服务发现模型的问题，要两个体系间的地址互通需要 Dubbo 侧作相应的适配，关于这部分内容将在接下来的 2.7.5 版本《服务自省》部分发布，在此我们暂且认为已经打通。

![migrate-final.png](/imgs/blog/migrate-final.png) 

Dubbo 体系内的部分应用作为透明的联通两个体系的关键节点，部分服务提供者应用要双协议发布、部分消费者应用要做到选定协议消费。由于老的 Spring Cloud 体系不允许做任何改动，因此联通两套体系的关键是 REST 协议，对 Dubbo 侧的应用来说：

* 部分应用可能要以 REST 协议消费 SpringCloud 的服务；
* 部分应用可能要暴露 REST 协议共 SpringCloud 消费；
* Dubbo 自有体系内则通过自己选定的协议通信，这里就比较灵活了，可以是 Dubbo、REST、gRPC 等其中的任一种。而如果选定 REST 协议则对于与 SpringCloud 体系的联通就变得更加自然了，因为两端的协议都是统一的。

对于消费 Spring Cloud 服务的应用，要配置服务 ：

```xml
<dubbo:reference interface ="xxx.SpringService" protocol="rest"/>
```

对于提供服务给 Spring Cloud 侧消费的应用，则指定服务暴露为 rest 协议，或者双协议暴露（因如果这个服务还要被新体系内的应用调用到）：

```xml
<dubbo:service interface="xxx.NewService" protocol="rest,dubbo"/>
```

作为 Dubbo 的维护者，虽然我们这里有明显的偏向性，讲的是从如何从 SpringCloud 体系迁移到 Dubbo 体系。但是反过来考虑，如果你已经或者即将选型 Dubbo 来开发微服务，则未来从 Dubbo 迁移到 SpringCloud 也是同样的思路，Dubbo 的多协议、多注册模型为双向迁移都提供了同样的灵活性。

### 自建体系迁移到 Dubbo 体系（共存）

这个场景和上一节中讲到的的 SpringCloud 迁移有些类似，最大的区别在于 rest 协议是 Dubbo 官方默认提供支持的，而对于已有的微服务体系内的私有通信协议，则需要先要自己去扩展 Dubbo Protocol 来提供协议层面的支持。

## 总结与展望

要实现异构微服务体系间的共存或迁移，关键点在打通异构体系间的`协议`与`服务发现`，得益于 Dubbo 自身对多协议、多注册模型的支持，我们可以很容易的使 Dubbo 成为桥接异构微服务体系的中间层。熟悉 Dubbo 多协议实现细节的同学，可能会担心在服务数量较多的场景下，多协议注册会导致地址数量翻倍从而影响地址推送性能；另外在文中《借助 Dubbo 联通异构的微服务体系》一节，关于如何实现异构体系间的透明服务发现部分我们没有做详细的说明。关于涉及服务发现的这部分，我们将在接下来的文章中做具体阐述，看看 Dubbo 2.7.5 版本引入新的服务发现机制是如何解决这个问题的，请持续关注后续文章及 Dubbo 官方文档。
