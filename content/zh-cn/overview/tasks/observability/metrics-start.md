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


### 依赖
todo 


### 配置

**dubbo.properties配置文件中的指标配置**


### 启动服务

配置完成后即可启动服务。

查询Apache Dubbo指标


如果需要测试指标数据可以直接在服务器上面执行如下命令：

```bash
curl http://localhost:20888
```
为了使演示结果更清晰下面是使用浏览器发起的GET请求获取到的指标数据：
![metrics.png](/imgs/v3/advantages/metrics.png)

### 从普罗米修斯查询指标

#### 普罗米修斯采集与查询指标

接下来我们可以通过普罗米修斯服务来获取指标数据。普罗米修斯通过服务发现的形式来获取数据，下面演示普罗米修斯拉取指标数据的方式：
普罗米修斯配置静态服务发现，获取指标数据的配置参考如下：

```yaml
# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'
    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.
  - job_name: 'dubbo'
    static_configs:
    - targets: ['IP:20888']
```
上面仅仅以单台机器演示，将IP关键词替换为实际IP即可，当然在实际企业应用中可以根据实际情况配置为动态服务发现地址这样可以获取所有服务的指标数据。

使用普罗米修斯的图形界面来查询指标数据如下图所示：
![prometheus.png](/imgs/v3/advantages/prometheus.png)

### 使用Grafana可视化指标
指标可视化页面目前推荐的方式是使用Grafana来配置Dubbo的可观测性监控大盘。

#### 在您开始之前

- 安装[普罗米修斯服务](../../reference/integrations/prometheus)
- 安装[Grafana](../../reference/integrations/grafana)

#### 查看Dubbo指标面板

Dubbo提供了丰富的指标面板，这些面板均可以在Grafana官方面板库中找到：您可以直接导入如下模版，并配置好数据源即可。

**Apache Dubbo Observability Dashboard：**  [https://grafana.com/grafana/dashboards/18051](https://grafana.com/grafana/dashboards/18051)

**JVM (Micrometer) Dashboard：** [https://grafana.com/grafana/dashboards/4701](https://grafana.com/grafana/dashboards/4701)

下面以Grafana可视化为例来看下如何通过Dubbo可观测性大盘来监测Dubbo服务：

![grafana-dashboard-1.png](/imgs/v3/advantages/grafana-dashboard-1.png)
![grafana-dashboard-2.png](/imgs/v3/advantages/grafana-dashboard-2.png)