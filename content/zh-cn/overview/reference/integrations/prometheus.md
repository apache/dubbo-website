---
aliases:
    - /zh/overview/reference/integrations/prometheus/
description: 配置 Prometheus 与 Dubbo 一起工作
linkTitle: Prometheus
title: Prometheus
type: docs
weight: 1
---

## 安装

你可以使用 Dubbo 社区提供的示例配置快速安装 Prometheus。

```bash
kubectl create -f https://raw.githubusercontent.com/apache/dubbo-admin/refactor-with-go/deploy/kubernetes/prometheus.yaml
```
> 本安装仅适用于测试或体验使用，生产级别的安装请参考 Prometheus 官方安装文档。

执行端口映射 `kubectl -n dubbo-system port-forward svc/prometheus-server 9090:9090`，访问页面 `http://localhost:9090`，切换到 graph 视图。

![Prometheus](/imgs/v3/reference/integrations/prometheus.jpg)

## Scrape 配置

Dubbo 的每个实例都会暴露一个 http 端口用于 Metrics 采集，Prometheus 通过 scraping 每个实例的 http 接口来采集统计数据。具体的 scraping 路径可以通过 Prometheus 配置文件进行调整，该文件控制 scraping 实例的端口、路径、TLS 设置等。

### Kubernetes 注解约定

在 Kubernetes 部署模式下，使用官方社区维护的 [Helm Charts 安装 Prometheus](https://github.com/prometheus-community/helm-charts)，Prometheus 服务可以自动识别包含 `prometheus.io` 注解的 Dubbo Pod 实例，并将它们列入 Scraping 实例列表。

Dubbo 官网给出的示例即是基于 `prometheus.io` 注解实现了 scraping target 地址的自动发现，具体注解配置可参见示例中的 [Deployment 资源定义](https://github.com/apache/dubbo-samples/blob/master/4-governance/dubbo-samples-metrics-spring-boot/Deployment.yml)。

```yaml
annotations:
   prometheus.io/scrape: "true"
   prometheus.io/path: /management/prometheus
   prometheus.io/port: "22222"
```

在此模式下，Dubbo 实例默认提供的 Prometheus Metrics 采集路径是：`/management/prometheus`。

### 自定义配置

对于已经安装好的 Prometheus 服务，可以通过 Dubbo Admin 提供的 Prometheus http_sd 服务发现接口来配置 Dubbo Metrics 采集的目标实例。可以参考 Admin 安装相关文档，安装完成后 Prometheus 侧需要调整的配置如下：

```yaml
- job_name: 'dubbo'
  http_sd_configs:
    - url: http://{admin-address}/api/dev/metrics/prometheus
```

