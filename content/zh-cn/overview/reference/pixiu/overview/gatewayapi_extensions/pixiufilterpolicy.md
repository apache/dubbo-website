---
description: PixiuFilterPolicy
linkTitle: PixiuFilterPolicy
title: PixiuFilterPolicy
type: docs
weight: 2
---

## 概述

`PixiuFilterPolicy` 是一个自定义资源扩展，用于为 Pixiu Gateway 配置特定过滤器的策略。

## 用例

- 提供声明式方式来配置过滤器，而无需直接修改 Gateway 或 HTTPRoute 资源
- 支持多种过滤器，包括身份验证、授权、速率限制和协议代理
- 将过滤器配置应用于 Gateway、HTTPRoute 或其他 Gateway API 资源
- 为 Gateway 中的特定监听器配置过滤器

为 HTTPRoute 启用基于 JWT 的身份验证：
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuFilterPolicy
metadata:
  name: jwt-filter-policy
  namespace: default
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: backend
  filterType: dgp.filter.http.auth.jwt
  config:
    rules:
      - match:
          prefix: /health
      - match:
          prefix: /user
        requires:
          requires_any:
            provider_name: provider1
    providers:
      - name: provider1
        from_headers:
          name: Authorization
          value_prefix: "Bearer "
        issuer: issuer1
        local_jwks:
          inline_string: "{...}"
```

应用速率限制以保护后端服务
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuFilterPolicy
metadata:
  name: ratelimit-filter-policy
  namespace: default
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: backend
  filterType: dgp.filter.http.ratelimit
  config:
    resources:
      - name: test-http
        items:
          - matchStrategy: 1
            pattern: "/v1/*"
    rules:
      - enable: true
        flowRule:
          resource: "test-http"
          threshold: 100
          statintervalinms: 1000
```

启用 Open Policy Agent (OPA) 进行细粒度授权
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuFilterPolicy
metadata:
  name: opa-plugin-policy
  namespace: default
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: backend
  filterType: dgp.filter.http.opa
  config:
    opa_server:
      url: http://opa-server:8181
    policy_path: /v1/data/httpapi/authz
```


启用跨域资源共享（CORS）
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuFilterPolicy
metadata:
  name: cors-filter-policy
  namespace: default
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: backend
  filterType: dgp.filter.http.cors
  config:
    allow_origin:
      - "*"
    allow_methods:
      - GET
      - POST
      - PUT
      - DELETE
    allow_headers:
      - Content-Type
      - Authorization
    max_age: 3600
```


启用 Prometheus 指标收集：
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuFilterPolicy
metadata:
  name: prometheus-filter-policy
  namespace: default
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: backend
  filterType: dgp.filter.http.prometheusmetric
  config:
    metric_collect_rules:
      metric_path: "/metrics"
      push_gateway_url: "http://prometheus-pushgateway:9091"
      counter_push: true
      push_interval_threshold: 1
      push_job_name: "pixiu-gateway-helm"
```

为 Gateway 中的特定监听器配置过滤器
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuFilterPolicy
metadata:
  name: listener-filter-policy
  namespace: pixiu-gateway-helm-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  filterType: dgp.filter.network.dubboconnectionmanager
  listenersRef:
    - name: dubbo
      filterChains:
        type: dgp.filter.network.dubboconnectionmanager
      config:
        route_config:
          routes:
            - match:
                prefix: "/"
              route:
                cluster: dubbo-service
```

## 目标资源绑定

`PixiuFilterPolicy` 使用 `targetRef` 字段绑定到 Gateway API 资源。策略将过滤器配置应用于指定的目标。

### 支持的目标资源

- **Gateway** (`gateway.networking.k8s.io/v1`)：将过滤器配置应用于 Gateway 中的所有监听器或特定监听器
- **HTTPRoute** (`gateway.networking.k8s.io/v1`)：将过滤器配置应用于 HTTP 路由

### 绑定规则

1. `targetRef.kind` 必须是支持的 Gateway API 资源类型
2. `targetRef.name` 必须匹配现有资源
3. 如果未指定 `targetRef.namespace`，策略应用于与策略相同命名空间中的资源
4. 对于 Gateway 目标，使用 `listenersRef` 配置特定监听器
5. 对于 HTTPRoute 目标，过滤器应用于路由的过滤器链

## 优先级和冲突

当多个 `PixiuFilterPolicy` 资源目标相同的资源时：

1. 目标为 HTTPRoute 的策略优先于网关级别策略
2. 使用 `listenersRef` 时，监听器特定配置优先
3. 如果多个策略指定相同的 `filterType`，行为取决于实现。建议每个目标每个过滤器类型使用单个策略

状态条件：`PixiuFilterPolicy` 资源包含一个 `status` 字段，其中包含指示策略当前状态的条件：

- **Accepted**：指示策略是否已被接受
- **Ready**：指示过滤器配置是否已准备就绪并处于活动状态

## 相关资源

- [PixiuGatewayPolicy](./pixiugatewaypolicy.md) - 配置网关级别策略
- [PixiuClusterPolicy](./pixiuclusterpolicy.md) - 配置集群级别策略
- [Gateway API 文档](https://gateway-api.sigs.k8s.io/)
