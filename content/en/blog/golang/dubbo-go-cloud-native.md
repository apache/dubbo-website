---
title: "dubbogo 3.0：牵手 gRPC 走向云原生时代"
linkTitle: "dubbogo 3.0：牵手 gRPC 走向云原生时代"
tags: ["Go"]
date: 2021-01-15
description: 本文介绍了 dubbo-go 3.0 对云原生的支持和规划
---

自从 2011 年 Dubbo 开源之后，被大量中小公司采用，一直是国内最受欢迎的 RPC 框架。2014 年，由于阿里内部组织架构调整，Dubbo 暂停维护了一段时间，之后随着 Spring Cloud 的面世，两个体系在融合中一起助推了微服务的火热。

不过这世界变化快，自从以 docker 为代表的的容器技术和以 K8s 为代表的容器编排技术登上舞台之后，云原生时代到来了。在云原生时代，不可变的基础设施给原有的中间件带来了不可变的中间件基础设施：gRPC 统一了底层通信层；protobuf 统一了序列化协议；以 envoy + istio 为代表的 service mesh 逐渐统一了服务的控制面与数据面。

dubbogo 的天然使命是：Bridging the gap between Java and Go。保持 Go 应用与 Java 应用互联互通的同时，借助 Go 语言（事实上的第一云原生语言）的优势拥抱云原生时代。dubbogo 社区 2020 年勠力打造三支箭：

- 已经发布的对齐 dubbo 2.7 的 dubbogo v1.5 版本；
- 近期将要发布的 sidecar 形态的 dubbo-go-proxy 项目；
- 以及处于进行时的 dubbogo 3.0。

用一句话概括 dubbogo 3.0 即是：新通信协议、新序列化协议、新应用注册模型以及新的服务治理能力！本文主要着重讨论 dubbogo 3.0 的新通信协议和应用级服务注册发现模型。

## dubbogo 3.0 vs gRPC

知己知彼，方能进步。dubbogo 3.0 的通信层改进主要借鉴了 gRPC。

gRPC 协议，简单来说就是 http2 协议的基础之上，增加了特定的协议 header：“grpc-” 开头的 header 字段，采用特定的打解包工具（protobuf）对数据进行序列化，从而实现 RPC 调用。

![img](/imgs/blog/dubbo-go/3.0-plan/p1.webp)

众所周知，gRPC 几乎没有服务治理能力，而阿里云现有 dubbo 框架兼具 RPC 和服务治理能力，整体实力不逊于 gRPC。但在“大家都用 gRPC” 这样的背景之下，dubbogo 3.0 的新通信协议就必须**完美兼容 gRPC**，对开发者已部署的服务完全兼容，并在此基础之上延续已有 dubbo 协议和服务治理能力，进而推出一系列新策略：比如 mesh 支持、应用级服务注册等。

![img](/imgs/blog/dubbo-go/3.0-plan/p2.webp)

## dubbogo 3.0 vs dubbogo 1.5

目前已有的 dubbo 2.7 协议已经尽可能实现了 gRPC 的支持。开发者可以通过 protoc-gen-dubbo 工具将 pb IDL 协议转换为框架支持的 stub，再借助底层 gRPC conn 的 RPC 过程，将已有的服务治理能力自上而下传递给 gRPC，因此实现了 gRPC 服务的支持。

dubbo-go v1.5.x 也支持 gRPC 的 Stream 调用。和 unary RPC 类似，通过产生框架支持的 stub，在底层 gRPC stream 调用的基础之上，将流式 RPC 的能力和并入框架。但由于 dubbo v2.7.x / dubbo-go v1.5.x 本身并不支持流式调用，所以没有对 gRPC stream 调用的进行上层服务治理支持。

开发者所面临的问题就是：我们在使用 dubbo-go2.7 进行 grpc 协议传输的时候，或多或少不是那么放心。

而即将推出的 dubbo-go 3.0 协议将从根源解决这个问题。

## 协议兼容的三种层次

笔者认为，一款服务框架对于第三方协议的支持可分为三个程度：应用层次、协议层次、传输层次。

一款框架如果在一个协议的 sdk 之上封装接口，可以认为它处于应用层次支持，这样的框架需要遵循下层 sdk 的接口，可扩展性较差。

处于协议层次的框架，从配置层到服务治理层均由本框架提供，而在此之下的协议层到网络传输层均使用某个固定的通信协议，这样的框架可以解决服务治理的问题，但框架本身无法与第三方协议完全适配，如果不适配就会出现对第三方协议支持的削弱，比如上面说到的 dubbo-go 1.5 对 stream rpc 支持的缺陷。

如果想进一步支持更多的第三方协议，需要从传输层下手，真正了解第三方协议的具体字段、所依赖的底层协议（比如 HTTP2）的帧模型和数据流，再开发出与第三方协议完全一致的数据交互模块，作为本框架的底层。这样做的好处是最大程度赋予了协议的可扩展性，可以在兼容已有协议的基础之上，可选地增加开发者需要的字段，从而实现已有协议无法实现的功能，就比如 dubbogo 3.0 将支持的反压策略。

## 基于 HTTP2 的通信流程

gRPC 一次基于 HTTP2 的 unary rpc 调用传输主要流程如下：

- client 发送 Magic 信息：
  PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n；
- server 收到并检查是否正确；
- client 和 server 互相发送 setting 帧，收到后发送 ACK 确认；
- client 发送 Header 帧，包含 gRPC 协议字段，以 End Headers 作为 Header 结束标志；
- client 紧接着发送 Data 帧，包含 RPC 调用的 request 信息，以 End Stream 作为 Data 结束标志；
- server 调用函数获得结果；
- server 发送 Header 帧，包含 gRPC 协议字段，以 End Headers 作为 Header 结束标志；
- server 紧接着发送 Data 帧，包含 RPC 调用回传的 response 信息；
- server 紧接着再次发送 Header 帧，包含 RPC 状态和 message 信息，以 End Stream 作为本次 RPC 调用结束标志。

其中包含 gRPC 调用信息的 HTTP2 Header 帧如下图：

![img](/imgs/blog/dubbo-go/3.0-plan/p3.webp)

另外，在 gRPC 的 stream 调用中，可在 server 端回传的过程中发送多次 Data，调用结束后再发送 Header 终止 RPC 过程，并汇报状态信息。

dubbogo 3.0 的通信层将在 HTTP2 通信协议之上采用同样的通信流程，以保证与 gRPC 的底层通信沟通能力。

## dubbogo 3.0 预期通信架构

除了通信协议采用 HTTP2 外，dubbogo 3.0 将采用基于 google protobuf 的 triple 协议【下面称为 dubbo3 协议】作为 dubbogo 3.0 的序列化协议，为 dubbo 将来支持更多的编程语言打下通信协议层面的基础。

目前设计的 dubbogo 3.0 传输模型如下：

![img](/imgs/blog/dubbo-go/3.0-plan/p4.webp)

- 为保证同时支持 unary RPC 和 stream RPC，在 server 端和 client 端增加数据流结构，以异步调用的形式完成数据传递；
- 继续支持原有的 TCP 通信能力；
- 在 HTTP2 的通信协议之上支持 dubbo3 协议，decode 过程兼容 gRPC 使用的 protobuf，保证与 gRPC 服务打通。

## 应用级服务注册发现

#### 1. 应用级服务注册发现介绍

dubbogo 3.0 使用的新一代服务注册发现体系，将摒弃旧版的“接口级注册发现”，使用“应用级别注册发现”。

简单地说，接口级别注册发现，在注册中心中以 RPC 服务为 key，以实例列表作为 value 来组织数据的，而我们新引入的“应用粒度的服务发现”，它以应用名（Application）作为 key，以这个应用部署的一组实例（Instance）列表作为 value。这带来两点不同：

- 数据映射关系变了，从 RPC Service -> Instance 变为 Application -> Instance；
- 数据变少了，注册中心没有了 RPC Service 及其相关配置信息。

可以认为，基于应用粒度的模型所存储和推送的数据量是和应用、实例数成正比的，只有当我们的应用数增多或应用的实例数增长时，地址推送压力才会上涨。

而对于基于接口粒度的模型，数据量是和接口数量正相关的，鉴于一个应用通常发布多个接口的现状，其数量级一般是比应用粒度的数十倍。另外一个关键点在于，接口的定义更多的是业务侧的内部行为，接口粒度导致的集群规模评估的不透明，而实例、应用增长都通常是在运维侧的规划之中，可控性较好。

工商银行曾经对这两个模型进行生产测算：应用级服务注册模型可以让注册中心上的数据量变成原来的 1.68%，新模型可以让 zookeeper 轻松支撑 10 万级别的服务量和 10 万级别的节点量。

#### 2. 元数据中心同步机制的引入

数据中心的数据量变少所造成的结果，是 RPC 服务相关的数据在注册中心消失了，只有 application - instance  这两个层级的数据。为了保证这部分缺少的 RPC 服务数据仍然能被 Consumer 端正确的感知，我们在 Consumer 和 Provider  间建立了一条单独的通信通道，目前针对元数据同步有两种具体的可选方案，分别是：

- 内建 MetadataService；
- 独立的元数据中心，通过中细化的元数据集群协调数据。

#### 3. 兼容旧版本 dubbo-go

为了使整个开发流程对老的 dubbo-go 用户更透明，同时避免指定 provider 对可扩展性带来的影响），我们设计了一套 RPC服务到应用名的映射关系，以尝试在 consumer 自动完成 RPC 服务到 provider 应用名的转换。

![img](/imgs/blog/dubbo-go/3.0-plan/p5.webp)

这套设计可以让 dubbogo 3.0 中同时保持对 dubbo v2.6.x、dubbo v2.7.x 和 dubbo v3.0.x 三个大版的互联互通。

## 统一路由的支持

路由在概念上可以理解为从已有的所有 IP 地址列表中，根据特定的路由规则，挑选出需要的 ip 地址子集。路由的过程需要根据配置好的路由规则进行筛选，最终取所有路由规则的交集获得结果。多个路由如同流水线一样，形成一条路由链，从所有的地址表中筛选出最终目的地址集合，再通过负载均衡策略选择访问的地址。

#### 1. 路由链

![img](/imgs/blog/dubbo-go/3.0-plan/p6.webp)

可以把路由链的逻辑简单理解为 target = rn(...r3(r2(r1(src))))。对于每一个 router 内部的逻辑，可以抽象为输入地址 addrs-in 与 router 中按全量地址 addrs-all 实现切分好的 n 个**互不相交**的地址池 addrs-pool-1 ... addrs-pool-n 按实现定义好的规则取交集作为输出地址。以此类推，完成整个路由链的计算。

![img](/imgs/blog/dubbo-go/3.0-plan/p7.webp)

#### 2. failover

在路由规则配置文件中可以配置 failover 字段。在寻找地址失败时可以 failover， 选择其他 subset，并且顺序执行下来，直到找到地址，否则最后报地址找不到异常。

#### 3. 兜底路由

在的路由规则配置中，可以配置一个没有任何条件的 match, 最终的结果是至少会有一个 subset 被选到，以达到地址空保护的作用。

作为 2020 年 dubbogo 社区打造并将在 2021 年初亮出的的三支箭之一，dubbogo 3.0 将带来不同平常且焕然一新的开发体验，敬请广大开发者期待！

如果你有任何疑问，欢迎钉钉扫码加入交流群【钉钉群号 31363295】：

dubbogo 3.0 目前是社区和 dubbo 官方团队-- 阿里中间件团队共同合作开发。

阿里云-中间件团队招募对 dubbo3 (java & go)、dapr、arthas 有兴趣的开发者。可以钉钉联系 northlatitude，或者发送邮件至 beiwei.ly@alibaba-inc.com。

> 作者简介
> 
> **李志信** (GitHubID LaurenceLiZhixin)，阿里云云原生中间件团队开发工程师，dubbogo 社区开发者，中山大学软件工程专业在校学生，擅长使用 Go 语言，专注于云原生和微服务等技术方向。
> 
> **于雨**(github @AlexStocks)，dubbo-go 项目和社区负责人，一个有十多年服务端做着基础架构研发一线工作经验的程序员，陆续参与改进过 Muduo/Pika/Dubbo/Sentinel-go 等知名项目，目前在蚂蚁金服可信原生部从事容器编排和 service mesh 工作。
