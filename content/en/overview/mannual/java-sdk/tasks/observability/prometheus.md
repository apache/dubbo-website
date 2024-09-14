---
aliases:
    - /zh/overview/tasks/observability/prometheus/
    - /zh-cn/overview/tasks/observability/prometheus/
description: ""
linkTitle: Prometheus
no_list: true
title: 从 Prometheus 查询 Metrics 监控指标
type: docs
weight: 2
---

## 准备条件

本文演示如何在 Kubernetes 环境下部署 Prometheus 并实现对 Dubbo 集群的监控数据统计与查询，你需要完成或具备以下内容：

* 本地或远端 Kubernetes 集群
* 确保 [Prometheus 正确安装](/zh-cn/overview/reference/integrations/prometheus/#安装)
* 部署 [示例应用](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-spring-boot) 并开启指标采集
* 使用 Prometheus dashboard 查询数据指标

## 确保 Prometheus 正确运行

验证 Prometheus 已经正确部署

```yaml
kubectl -n dubbo-system get svc prometheus-server
NAME                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
prometheus-server   ClusterIP   10.109.160.254   <none>        9090/TCP   4m
```

## 部署示例

```yaml
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/4-governance/dubbo-samples-metrics-spring-boot/Deployment.yml
```

等待示例应用正常运行，通过以下命令确认应用状态：
```yaml
kubectl -n dubbo-demo get deployments
```

## 查询 Prometheus

获得 Prometheus 访问地址 `kubectl port-forward service/prometheus-server 9090:9090`，
打开浏览器，访问 localhost:9090/graph 即可打开 Prometheus 控制台。

接下来，执行 Prometheus 查询命令。可以在此确认 [Dubbo 支持的 Metrics 指标](/zh-cn/overview/reference/metrics/standard_metrics/)。

**1. 在 “Expression” 一览，输入 `dubbo_consumer_qps_total`，返回以下结果**

![img](/imgs/v3/tasks/observability/prometheus.png)
