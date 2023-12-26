---
description: ""
linkTitle: Kubernetes最佳实践
title: 最佳实践
type: docs
weight: 8
---

## 部署架构

### 半托管
```yaml
dubboctl install --profile=demo
```

安装 nacos、dubbo-control-plane 等

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes.png" style="max-width:650px;height:auto;" />

### 全托管

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes-service.png" style="max-width:650px;height:auto;" />

在这个模式下，我们需要安装 dubbo-control-plane

```yaml
dubboctl install --profile=control-plane
```

dubbo-control-plane

路由规则

## 部署应用

请查看 dubbo-samples 了解示例

```yaml
kind: service
```

```yaml
kind: deployment
```

## 优雅上下线

配置 probe
配置 pre-stop

## 观测服务状态


