---
aliases:
    - /zh/overview/tasks/observability/grafana/
description: ""
linkTitle: Grafana
no_list: true
title: 使用 Grafana 可视化查看集群 Metrics 指标
type: docs
weight: 3
---

指标可视化页面目前推荐的方式是使用 Grafana 来配置 Dubbo 的可观测性监控大盘。

## 在您开始之前
- 一个可以访问的 Kubernetes 集群
- 正确安装并配置 [普罗米修斯服务](../../../reference/integrations/prometheus)
- 安装 [Grafana](../../../reference/integrations/grafana)
- 部署 [示例应用](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-spring-boot) 并开启指标采集

## 确认组件正常运行

### Kubernetes
确保 Prometheus 正常运行

```sh
$ kubectl -n dubbo-system get svc prometheus
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
prometheus   ClusterIP   10.0.250.230   <none>        9090/TCP   180s
```

确保 Grafana 正常运行

```sh
$ kubectl -n dubbo-system get svc grafana
NAME      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
grafana   ClusterIP   10.0.244.130   <none>        3000/TCP   180s
```

## 查看 Grafana 可视化面板

示例程序启动后会自动模拟服务调用，只需等待一会能在 Grafana 中可视化的看到 Metrics 指标。
1. 如果是通过 [Dubbo 控制面](../../../reference/admin/architecture/) 安装的 Grafana，则可以访问 Admin 控制台并在左侧菜单中找到 Grafana 可视化监控入口

2. 如果是独立安装的 Grafana 组件，则可以直接访问 Grafana 可视化控制台地址：

```sh
$ kubectl port-forward service/grafana 3000:3000
```

在浏览器打开 Grafana 控制台：http://localhost:3000

### 服务统计视图
支持基于应用、实例粒度的统计视图，同时对于每一种指标统计粒度，你还可以进一步查看：

1. 提供者流量视图

![grafana-dashboard-1.png](/imgs/v3/advantages/grafana-dashboard-1.png)

2. 消费者流量视图

![grafana-dashboard-1.png](/imgs/v3/advantages/grafana-dashboard-1.png)

3. 注册中心视图

TBD

4. 配置中心视图

TBD

### JVM 实例视图

![grafana-dashboard-2.png](/imgs/v3/advantages/grafana-dashboard-2.png)

### 关于 Dubbo 官方提供的 Grafana Dashboard

Dubbo 提供了丰富的指标面板，以上视图面板均可以在 Grafana 官方面板库中找到：您可以直接导入如下模版，并配置好数据源即可。

**Apache Dubbo Observability Dashboard：**  [https://grafana.com/grafana/dashboards/18469](https://grafana.com/grafana/dashboards/18469)

**JVM (Micrometer) Dashboard：** [https://grafana.com/grafana/dashboards/4701](https://grafana.com/grafana/dashboards/4701)
