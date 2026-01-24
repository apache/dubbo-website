---
description: PixiuClusterPolicy
linkTitle: PixiuClusterPolicy
title: PixiuClusterPolicy
type: docs
weight: 1
---
## 概述

`PixiuClusterPolicy` 是一个自定义资源扩展，用于为 Pixiu Gateway 中的后端服务配置集群级别的策略。

## 用例

1. 定义用于动态服务发现的注册中心配置（例如，Zookeeper、Nacos）
2. 在不使用服务发现时定义静态端点配置
3. 为后端服务配置负载均衡策略
4. 设置健康检查机制以确保后端服务的可用性
5. 在集群级别配置连接和请求超时

## Pixiu Gateway 中的 PixiuClusterPolicy

使用注册中心（例如：Zookeeper、Nacos）配置服务发现
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuClusterPolicy
metadata:
  name: service-registry-policy
  namespace: default
spec:
  serviceRef:
    - name: dubbo-backend
      type: dynamic
      registries:
        zookeeper:
          protocol: zookeeper
          address: zookeeper:2181
          timeout: 3s
        nacos:
          protocol: nacos
          address: nacos:8848
          namespace: public
          group: DEFAULT_GROUP
```

在服务发现不可用时定义静态端点
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuClusterPolicy
metadata:
  name: static-endpoints-policy
  namespace: default
spec:
  serviceRef:
    - name: static-backend
      type: static
      endpoints:
        - address: 10.0.0.1
          port: 8080
          protocolType: http
        - address: 10.0.0.2
          port: 8080
          protocolType: http
```

为服务设置负载均衡策略
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuClusterPolicy
metadata:
  name: loadbalancer-policy
  namespace: default
spec:
  serviceRef:
    - name: backend-service
      loadBalancer:
        policy: round_robin
```

为后端服务启用健康检查
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuClusterPolicy
metadata:
  name: healthcheck-policy
  namespace: default
spec:
  serviceRef:
    - name: backend-service
      healthCheck:
        protocol: http
        timeout: 5s
        interval: 10s
        healthyThreshold: 2
        unhealthyThreshold: 3
        httpHealthCheck:
          path: /health
          expectedStatuses:
            - 200
            - 201
```

为集群设置超时配置
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuClusterPolicy
metadata:
  name: cluster-timeout-policy
  namespace: default
spec:
  serviceRef:
    - name: backend-service
      timeout:
        connect: 10s
        request: 30s
```

在网关级别配置集群
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuClusterPolicy
metadata:
  name: gateway-cluster-policy
  namespace: pixiu-gateway-helm-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  clusterRef:
    - name: custom-cluster
      type: static
      loadBalancerPolicy: least_request
      endpoints:
        - address: 192.168.1.100
          port: 8080
          protocolType: http
```

## 目标资源绑定
PixiuClusterPolicy 可以应用于服务级别和网关级别的不同层级

### 服务级别配置
当未指定 `targetRef` 或目标为 Service 时，策略按名称应用于服务。`serviceRef` 条目定义特定服务的集群配置。

### 网关级别配置
当 `targetRef` 指定网关时：
- `clusterRef` 条目应用于网关引用的集群
- `serviceRef` 条目应用于附加到网关的 HTTPRoute 引用的服务


### 绑定规则

1. 如果未指定 `targetRef`，策略应用于同一命名空间中的服务
2. 如果 `targetRef.kind` 是 `Gateway`，策略在网关级别应用
3. `serviceRef` 中的服务名称必须与 HTTPRoute `backendRefs` 中使用的服务名称匹配
4. `clusterRef` 中的集群名称必须与网关配置中引用的集群名称匹配

## 优先级和冲突

当多个 `PixiuClusterPolicy` 资源配置相同的服务或集群时：

1. 网关级别策略 `targetRef` 指向 Gateway 对网关引用的集群具有优先权
2. 服务级别策略（没有 `targetRef` 或目标为 Service）应用于 HTTPRoute 中引用的服务
3. 如果多个策略配置相同的服务，行为取决于实现。建议每个服务使用单个策略

## 相关资源

- [PixiuGatewayPolicy](./pixiugatewaypolicy.md) - 配置网关级别策略
- [PixiuFilterPolicy](./pixiufilterpolicy.md) - 配置过滤器级别策略
- [Gateway API 文档](https://gateway-api.sigs.k8s.io/)
