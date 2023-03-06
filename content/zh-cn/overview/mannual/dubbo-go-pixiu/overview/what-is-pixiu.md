---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/overview/what-is-pixiu/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/overview/what-is-pixiu/
description: Pixiu 是一款开源的 Dubbo 生态的 API 网关和 接入 dubbo 集群的语言解决方案。作为 API 网关形态。
linkTitle: Pixiu 是什么
title: Pixiu 是什么
type: docs
weight: 1
---






### Pixiu 说明


Pixiu 是一款开源的 Dubbo 生态的 API 网关和 接入 dubbo 集群的语言解决方案。作为 API 网关形态， Pixiu 能接收外界的网络请求，将其转换为 dubbo 等协议请求，转发给背后集群；作为 Sidecar，Pixiu 期望可以代替代理服务注册到 Dubbo 集群，让多语言服务接入 Dubbo 集群提供更快捷的解决方案。


![image](/imgs/pixiu/overview/pixiu-overview.png)




### API 网关

作为一款网关产品，Pixiu 帮助用户轻松创建、发布、维护、监控和保护任意规模的 API ，接受和处理成千上万个并发 API 调用，包括流量管理、 CORS 支持、授权和访问控制、限制、监控，以及 API 版本管理。除此以外，作为 Dubbo 的衍生产品，Pixiu 可以帮助 Dubbo 用户进行协议转换，实现跨系统、跨协议的服务能力互通。
Pixiu 的整体设计遵守以下原则：
- High performance: 高吞吐量以及毫秒级的延时。
- 可扩展: 通过 go-plugin，用户可以根据自己的需求延展 Pixiu 的功能。
- 简单可用: 用户通过少量配置，即可上线。


### Sidecar 模式

目前最为主流的接入 dubbo 集群的方式当然是集成语言对应的 sdk，但是如图的左侧部分。但是对于dubbo来讲，它的多语言支持能力不足，目前较为成熟的只有 java 版本和 go 版本，当然 js 版本 和 python 版本也在努力追赶中.其次，就是使用sdk的通用问题，比如代码耦合度高，版本升级困难，服务发现，服务路由和负载均衡策略不易整体调控等。

所以 mesh 话或者 sidecar 的方案，也就是 service mesh 在16年时被提出。将服务发现，服务路由和负载均衡等逻辑放在 sidecar，服务使用轻量级 sdk 与之进行交互。 

![img](/imgs/pixiu/overview/pixiu-sidecar.png)

对于接入 dubbo 的多语言解决方案。首推的当然是 pixiu 作为 sidecar 和 服务进行同时部署。pixiu提供 服务发现，流量治理，路由能力，协议转换能力和通讯能力。如图的左侧部分，使用sidecar的服务可以和原生使用 dubbo 框架的服务组成集群，无感的进行相互调用。
另外一种方案是 pixiu 只单单作为代理，将服务注册到dubbo集群中，如图右侧部分，这种方案部署和运维较为简单，比如适合中小规模的集群。
