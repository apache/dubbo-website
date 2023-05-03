---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/overview/terminology/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/overview/terminology/
description: Pixiu 术语
linkTitle: Pixiu 术语
title: Pixiu 术语
type: docs
weight: 2
---







![img](/imgs/pixiu/overview/terminology.png)

### Listener 监听器

Lisnter 代表网络端口监听的能力，可以配置监听的协议类型，地址，端口。目前支持 TCP、HTTP、HTTP2 和 TRIPLE 协议。

### Network Filter 网络过滤器

NetworkFilter 直接和 Listener 进行对接，代表对基础网络请求的处理，包括原始协议解析，路由解析等功能。

### Http Filter & Dubbo Filter HTTP & Dubbo 过滤器

Http Filter 和 Dubbo Filter 可以看做二级 Filter，提供诸如协议转换，限流，身份认证等通用功能。

### Route 路由

Route 代表请求的路由规则

### Cluster 集群

Cluter 代表相同服务的集群，Endpoint 则代表服务集群中的单一服务实例。

### Adapter 适配器

Adapter 则代表 Pixiu 和外界进行元数据获取的能力。能够根据服务中的服务元数据，进行路由和集群信息的动态获取。目前 Pixiu 支持两宽 Adapter，分别是从 Dubbo 集群和 Springcloud 集群获取信息。