---
description: PixiuGatewayPolicy
linkTitle: PixiuGatewayPolicy
title: PixiuGatewayPolicy
type: docs
weight: 3
---
## 概述

`PixiuGatewayPolicy` 是一个自定义资源扩展，用于为 Pixiu Gateway 实例配置网关级别的策略。

## 用例

- 提供统一的方式来配置网关级别设置，而无需直接修改 Gateway 资源
- 配置日志和分布式追踪，以便更好地观测网关操作
- 在监听器和全局级别管理连接和请求超时
- 配置优雅关闭行为以确保零停机部署

控制 Gateway 中所有监听器的空闲、读取和写入超时
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuGatewayPolicy
metadata:
  name: gateway-timeout-policy
  namespace: pixiu-gateway-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  listener:
    timeout:
      idle: 300s
      read: 60s
      write: 60s
```

配置分布式追踪以跟踪跨服务的请求
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuGatewayPolicy
metadata:
  name: gateway-tracing-policy
  namespace: pixiu-gateway-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  tracing:
    name: jaeger
    serviceName: pixiu-gateway
    sampler:
      type: probabilistic
      param: "0.1"
    config:
      url: http://jaeger-collector:14268/api/traces
      headers:
        Authorization: "Bearer token"
```

自定义网关的日志行为
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuGatewayPolicy
metadata:
  name: gateway-log-policy
  namespace: pixiu-gateway-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  log:
    level: info
    encoding: json
    outputPaths:
      - stdout
      - /var/log/pixiu/gateway.log
    errorOutputPaths:
      - stderr
      - /var/log/pixiu/error.log
    development: false
    disableCaller: false
    disableStacktrace: false
```

设置优雅关闭行为
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuGatewayPolicy
metadata:
  name: gateway-shutdown-policy
  namespace: pixiu-gateway-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  shutdown:
    timeout: 30s
    stepTimeout: 5s
    rejectPolicy: immediate
```

配置全局连接和请求超时
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuGatewayPolicy
metadata:
  name: gateway-global-timeout-policy
  namespace: pixiu-gateway-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  timeout:
    connect: 10s
    request: 30s
```

## 目标资源绑定

`PixiuGatewayPolicy` 使用 `targetRef` 字段绑定到特定的 Gateway 资源。策略应用于 `targetRef` 中指定的 Gateway。

### 支持的目标资源

- **Gateway** (`gateway.networking.k8s.io/v1`)：将网关级别配置应用于 Gateway 中的所有监听器

### 绑定规则

1. `targetRef.kind` 必须是 `Gateway`
2. `targetRef.name` 必须匹配现有的 Gateway 资源
3. 如果未指定 `targetRef.namespace`，策略应用于与策略相同命名空间中的 Gateway
4. 如果指定了 `targetRef.namespace`，它必须与 Gateway 的命名空间匹配

## 优先级和冲突

目前，只能将一个 `PixiuGatewayPolicy` 应用于 Gateway。如果多个策略目标相同的 Gateway，行为取决于实现。建议每个 Gateway 使用单个策略以避免冲突。

状态条件：`PixiuGatewayPolicy` 资源包含一个 `status` 字段，其中包含指示策略当前状态的条件：

- **Accepted**：指示策略是否已被接受和应用
- **Ready**：指示策略配置是否已准备就绪并处于活动状态

## 相关资源

- [PixiuFilterPolicy](./pixiufilterpolicy.md) - 配置过滤器级别策略
- [PixiuClusterPolicy](./pixiuclusterpolicy.md) - 配置集群级别策略
- [Gateway API 文档](https://gateway-api.sigs.k8s.io/)
