---
type: docs
title: "使用 Grafana 可视化查看集群 Metrics 指标"
linkTitle: "Grafana"
description: ""
weight: 20
no_list: true
---

这个示例演示了如何使用 Grafana 可视化的展示 Metrics 监控指标

## 开始之前
* 安装 Prometheus
* 安装 Grafana
* 部署示例项目

## 查看 Grafana 面板


## 示例详解
### 参考案例
Dubbo官方案例中提供了指标埋点的示例，可以访问如下地址获取案例源码：
- Spring项目参考案例：
  - [https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-prometheus](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-prometheus)
- SpringBoot项目参考案例:
  - [https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-spring-boot](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-spring-boot)

### 依赖
目前Dubbo的指标埋点仅支持3.2及以上版本，同时需要引入dubbo-metrics-prometheus依赖如下所示：
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metrics-prometheus</artifactId>
    <version>3.2及以上版本</version>
</dependency>
```

### 配置
开启Dubbo的指标埋点只需要引入以下配置即可。
```xml
<dubbo:metrics protocol="prometheus" enable-jvm-metrics="true">
    <dubbo:aggregation enabled="true"/>
    <dubbo:prometheus-exporter enabled="true"  metrics-port="20888"/>
</dubbo:metrics>
```
关于指标的配置可以参考配置项中的指标配置信息，在这里引入的配置中:
- **enable-jvm-metrics：** 是对JVM指标的埋点， 如果不需要这些配置项可以将其删除或者设置为false。
- **aggregation：** 针对指标数据的聚合处理使监控指标更平滑。
- **prometheus-exporter：** 指标数据导出器，这里配置指标服务的端口号为20888。

配置完成后即可启动服务。

### 指标获取

前面的例子中提供了指标服务，接下来我们可以通过普罗米修斯来获取数据。
普罗米修斯监控服务通过访问：[http://localhost:20888](http://localhost:20888) 即可拉取数据
指标数据如下所示：
![metrics.png](/imgs/v3/advantages/metrics.png)

普罗米修斯获取数据的配置参考如下：
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
当然在实际企业应用中这个服务发现的地址并不会使用这个静态配置，需要改成动态配置。


也可以使用普罗米修斯的图形界面来查询指标数据如下图所示：
![prometheus.png](/imgs/v3/advantages/prometheus.png)

### 可视化页面
也可以使用 Grafana可视化指标监测，下面以Grafana可视化为例：
Dubbo可观测性面板可以在Grafana官网的模板库中可以找到，您可以直接导入如下模版，并配置好数据源即可。
[https://grafana.com/grafana/dashboards/18051](https://grafana.com/grafana/dashboards/18051)


![grafana-dashboard-1.png](/imgs/v3/advantages/grafana-dashboard-1.png)
![grafana-dashboard-2.png](/imgs/v3/advantages/grafana-dashboard-2.png)


