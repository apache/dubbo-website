---
description: 描述 Dubbo 的流量路由与控制功能。
linkTitle: 流量管理
title: 流量管理
type: docs
weight: 1
---
> 目前服务网格处于初步实验阶段。资源命名可能会出现变化。

## 介绍
Dubbo 服务网格的流量管理模型与 Istio 保持一致，但针对 Dubbo 协议和无 Sidecar 架构进行了优化。核心组件包括：

- **ServiceRoute**：定义路由规则，控制请求如何路由到服务实例
- **SubsetRule**：定义服务子集和流量策略，如负载均衡、连接池、TLS 设置等

通过配置这些资源，您可以实现流量路由、负载均衡、故障恢复等功能，而无需修改应用程序代码。

## 服务路由
ServiceRoute 是 Dubbo 服务网格中用于定义路由规则的核心资源，对应 Istio 的 VirtualService。它允许您配置如何将请求路由到服务的不同版本或实例。

服务路由让您能够：
- 将流量路由到服务的不同版本（如 v1、v2）
- 基于请求属性（如头信息、路径）进行路由
- 配置权重路由，实现流量分割和灰度发布
- 配置超时、重试等故障恢复策略

### 服务路由示例
以下示例展示了如何配置 ServiceRoute 来实现流量分割：

```yaml
apiVersion: networking.dubbo.apache.org/v1
kind: ServiceRoute
metadata:
  name: provider-weights
  namespace: grpc-app
spec:
  hosts:
  - provider.grpc-app.svc.cluster.local
  http:
  - route:
    - destination:
        host: provider.grpc-app.svc.cluster.local
        subset: v1
      weight: 10
    - destination:
        host: provider.grpc-app.svc.cluster.local
        subset: v2
      weight: 90
```

#### hosts 字段
`hosts` 字段指定了 ServiceRoute 应用到的服务。可以使用完全限定域名（FQDN）或短名称。控制平面会自动将短名称解析为 FQDN。

#### 路由规则
路由规则定义了如何将请求路由到目标服务。每个路由规则可以包含：

- **匹配条件**：基于请求属性（如路径、头信息）进行匹配
- **Destination**：目标服务的主机名、子集和端口
- **权重**：流量分配的权重比例

#### 路由规则优先级
当多个 ServiceRoute 匹配同一个服务时，控制平面会按照配置的创建时间顺序应用规则。更具体的匹配条件会优先于通用规则。

### 路由规则的更多内容
ServiceRoute 支持更复杂的路由场景，包括：

- **基于路径的路由**：根据请求路径将流量路由到不同的服务版本
- **基于头信息的路由**：根据 HTTP 头信息进行路由决策
- **委托路由**：通过 `delegate` 字段实现路由规则的组合和复用

## 子集规则

SubsetRule 是 Dubbo 服务网格中用于定义服务子集和流量策略的资源，对应 Istio 的 DestinationRule。它允许您将服务实例组织成逻辑子集，并为每个子集配置流量策略。

### 负载均衡选项
SubsetRule 支持多种负载均衡策略，通过 MeshConfig 中的 `LocalityLbSetting` 配置：

- **基于地域的负载均衡**：优先将流量路由到同一地域的实例
- **轮询（ROUND_ROBIN）**：依次将请求分发到各个实例
- **最少连接（LEAST_CONN）**：将请求路由到连接数最少的实例

### 子级规则示例
以下示例展示了如何创建子集并配置流量策略：

```yaml
apiVersion: networking.dubbo.apache.org/v1
kind: SubsetRule
metadata:
  name: provider-versions
  namespace: grpc-app
spec:
  host: provider.grpc-app.svc.cluster.local
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
    tls:
      mode: ISTIO_MUTUAL
```

子集通过 Pod 标签进行匹配。在上面的示例中，带有 `version: v1` 标签的 Pod 会被分配到 `v1` 子集，带有 `version: v2` 标签的 Pod 会被分配到 `v2` 子集。

## 网关
通过网关统一控制网格的入站与出站流量，可以规定哪些流量允许进入或离开网格。

Dubbo 网格网关是基于 Kubernetes Gateway API 实现，使用 Pixiu Gateway 作为数据面代理。

### Gateway 示例

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: dubbo-ingress
spec:
  gatewayClassName: dubbo
  listeners:
  - name: default
    hostname: "*.example.com"
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: All
```

## 相关内容

- [快速入门](/zh-cn/overview/mesh/getting-started/)
- [安全概念](/zh-cn/overview/mesh/concepts/security/)
- [可观测性](/zh-cn/overview/mesh/concepts/observability/)
