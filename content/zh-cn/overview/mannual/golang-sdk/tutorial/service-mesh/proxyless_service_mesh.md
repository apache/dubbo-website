---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/service-mesh/proxyless_service_mesh/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/service-mesh/proxyless_service_mesh/
description: 无代理服务网格
keywords: 无代理服务网格
title: 无代理服务网格
type: docs
---






## 1. 什么是 Proxyless Service-Mesh (无代理服务网格) ?

### 1.1 Service Mesh 简析

Istio 是当今最流行的开源服务网格。它由控制平面和数据平面构成，其架构如下，图片摘自 [istio官网](https://istio.io/)

![使用 Istio 后](/imgs/docs3-v2/golang-sdk/concept/mesh/proxyless_service_mesh/service-mesh.svg)

位于图中下半部分的控制平面负责配置、服务信息、证书等资源的下发。位于上半部分的数据平面关注业务之间的通信流量；传统服务网格通过代理的方式拦截所有的业务网络流量，代理需要感知到控制平面下发的配置资源，从而按照要求控制网络流量的走向。

在 Istiod 环境中，其控制平面是一个名为 istiod 的进程，网络代理是 envoy 。istiod 通过监听 K8S 资源 例如Service、Endpoint 等，获取服务信息，并将这些资源统一通过 XDS 协议下发给位于数据平面的网络代理。envoy 是一个独立的进程，以 sidecar（边车）的形式伴随业务应用 Pod 运行，他与应用进程共用同一个主机网络，并通过修改路由表的方式，劫持业务应用的网络流量。

Service Mesh 可以解决微服务场景下的众多问题，随着集群规模的扩大与业务复杂度的增长，基于原生 k8s 的容器编排方案将会难以应付，开发人员不得不面对巨大的服务治理挑战。而 Service Mesh 很好地解决了这一问题，它将服务治理需求封装在了控制平面与代理中，业务开发人员只需要关注于业务逻辑。在应用部署之后，只需要运维人员通过修改配置，即可实现例如故障恢复、负载均衡、灰度发布等功能，这极大地提高了研发和迭代效率。

Istio 的 sidecar 通过容器注入的形式伴随业务应用进程的整个生命周期，对于业务应用是毫无侵入的，这解决了业务应用可迁移、多语言、基础架构耦合等问题。但这也带来了高资源消耗、请求时延增长的问题。

Service 为服务治理提供了一个很好的思路，将基础架构与业务逻辑解耦，让应用开发人员只需关注业务。另一方面，由于 sidecar 的弊端，我们可以考虑使用 sdk 的形式，来替代 sidecar 支撑起数据平面。

### 1.2 Proxyless Service-Mesh 

无代理服务网格，是近几年提出的一个新的概念，isito、gRPC、brpc 等开源社区都在这一方向进行了探索和实践。无代理服务网格框架以 SDK 的形式被业务应用引入，负责服务之间的通信、治理。来自控制平面的配置直接下发至服务框架，由服务框架代替上述 sidecar 的功能。

![img](/imgs/docs3-v2/golang-sdk/concept/mesh/proxyless_service_mesh/894c0e52-9d34-4490-b49b-24973ef4aabc.png)

服务框架（SDK）的主要能力可以概括为以下三点：

1. 对接控制平面，监听配置资源。
2. 对接应用，为开发者提供方便的接口。
3. 对接网络，根据资源变动，响应流量规则。

### 1.3 Proxyless 的优缺点

优点：

- 性能：无代理模式的网络调用为点对点的直接通信，网络时延会比代理模式小很多。
- 稳定性：proxyless 的模式是单进程，拓扑简单，便于调试，稳定性高。
- 框架集成：市面上已有众多 sdk 模式的服务框架，切换至 mesh 后便与复用框架已有能力
- 资源消耗：没有 sidecar，资源消耗低

缺点：

- 语言绑定：需要开发多种语言的 sdk
- 可迁移性低：无法通过切换 sidecar 的形式来无侵入地升级基础设施。

总体来讲，Proxyless 架构以其高性能、高稳定性的特点，更适合与生产环境使用。

## 2. Dubbo-go 与 Proxyless Service-Mesh

### 2.1 Dubbo-go 在 Proxyless Service-Mesh 场景的设计

#### 服务注册发现

Dubbo-go 本身拥有可扩展的服务注册发现能力，我们为 service mesh 场景适配了注册中心的实现。开发人员可以将 dubbo-go 应用的信息注册在 istiod 控制平面上。客户端应用可以查询已经注册的接口数据，完成服务发现过程。

![img](/imgs/docs3-v2/golang-sdk/concept/mesh/proxyless_service_mesh/454d1e31-0be3-41fe-97ec-f52673ebf74f.png)

1. 开发人员使用 dubbogo-cli 工具创建应用模板，发布 Deployment / Service 到集群中。
2. 服务端拉取全量 CDS 和 EDS ，比对本机IP，拿到当前应用的的主机名。并将本应用的所有接口名到主机名的映射，注册在Istiod上面。
3. 客户端从 istiod 拉取全量接口名到主机名的映射，缓存在本地。当需要发起调用时，查询本地缓存，将接口名转换为主机名，再通过CDS 和 EDS 拉取到当前 cluster 所对应的全量端点。
4. 全量端点经过 Dubbo-go 内置的 Mesh Router，筛选出最终的端点子集，并按照配置的负载均衡策略进行请求。

开发人员全程只需要关注接口即可，完全无需关心主机名和端口信息。即服务端开发者只需要实现pb接口，使用框架暴露出来；客户端开发者只需要引入pb接口，直接发起调用即可。

#### 流量治理

Dubbo-go 拥有路由能力，通过 xds 协议客户端从 istiod 订阅路由配置，并实时更新至本地路由规则，从而实现服务的管理。Dubbo-go 兼容 istio 生态的流量治理规则，可以通过配置 Virtual Service 和 Destination Rule，将打标的流量路由至指定子集，也可以在灰度发布、切流等场景进行更深入地使用。

#### 云原生脚手架

dubbogo-cli 是 Apache/dubbo-go 生态的子项目，为开发者提供便利的应用模板创建、工具安装、接口调试等功能，以提高用户的研发效率。

详情可以参阅 [【dubbogo-cli 工具】](/zh-cn/overview/mannual/golang-sdk/refer/use_dubbogo_cli/)

## 3. Dubbo-go-Mesh 的优势

### 3.1 接口级服务发现

前文介绍到了通过接口级服务注册发现的优势，即开发人员无需关心下游主机名和端口号，只需要引入接口存根，或实现接口，通过框架启动即可。

### 3.2 高性能

我们在 k8s 集群内部署 istio 环境，分别测试了 sidecar 模式的 gRPC 服务调用和 Proxyless 模式的 dubbo-go 应用服务调用。发现 proxyless 在请求耗时方面比 sidecar 模式少一个数量级，即性能提升十倍左右。

### 3.3 跨生态

Dubbo-go 是一个横跨多个生态的服务框架。

- mesh 生态

  开发人员可以使用 Dubbo-go 进行应用开发的同时，使用 istio 生态所提供的强大能力。

- gRPC 生态

  - Dubbo-go 支持与 gRPC 服务互通，HTTP2 协议栈。
  - Dubbo-go 默认使用 pb 序列化方式，高性能。

- Dubbo 生态

  - 多语言优势，可以实现 go-java 应用互通。
  - 兼容 pixiu 网关，方便地进行服务的暴露和协议转换。
  - 使用 Dubbo-go 生态组件。