---
type: docs
title: "流量管控"
linkTitle: "流量管控"
weight: 30
description: ""
feature:
  title: 流量管控
  description: >
    Dubbo 支持通过一系列流量规则控制服务与服务之间的流量分布与行为，基于这些规则可以实现基于权重流量分布、流量灰度验证、金丝雀发布、按请求参数的路由、超时、限流降级等能力。
---



## 标签路由
## 动态配置
---
configVersion: v3.0
scope: application/service
key: app-name/group+service+version
enabled: true
configs:
- match:
      address:
         wildcard: xxx
      service:
         oneof: []
      application:
          oneof: []
      param:
      - key: url-key
        value:
         exact: url-value
      - key: url-key
        value:
         exact: url-value
  side: consumer
  parameters:
    timeout: 1000
    cluster: failfase
    loadbalance: random
...