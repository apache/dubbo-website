---
aliases:
    - /zh/overview/tasks/observability/metrics-start/
description: ""
linkTitle: 指标入门
no_list: true
title: 指标监控入门指南
type: docs
weight: 10
---


# 指标监控入门指南
## 指标模块简介
Dubbo的指标模块帮助用户从外部观察正在运行的系统的内部服务状况 ，Dubbo参考 *四个黄金信号*、*RED方法*、*USE方法* 等理论并结合实际企业应用场景从不同维度统计了丰富的关键指标，关注这些核心指标对于提供可用性的服务是至关重要的。

Dubbo的关键指标包含：**延迟（Latency）**、**流量（Traffic）**、 **错误（Errors）** 和 **饱和度（Saturation）** 等内容 。同时，为了更好的监测服务运行状态，Dubbo 还提供了对核心组件状态的监控，如Dubbo应用信息、线程池信息、三大中心交互的指标数据等。

Dubbo指标监控目前推荐使用Prometheus来进行服务监控，Grafana来展示指标数据。接下来就通过案例来快速入门Dubbo的指标监控吧。

## 快速入门
### 环境
- 系统：Windows、Linux、MacOS
- JDK 8 及以上
- Git
- Maven
- Prometheus [使用教程](../prometheus)
- Grafana [使用教程](../grafana)

### 参考案例
Dubbo官方案例中提供了指标埋点的示例，可以访问如下地址获取案例源码：
- Spring项目参考案例：  [dubbo-samples-metrics-prometheus](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-prometheus)
- SpringBoot项目参考案例: [dubbo-samples-metrics-spring-boot](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-spring-boot)