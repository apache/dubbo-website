---
type: docs
title: "使用 Grafana 可视化查看集群 Metrics 指标"
linkTitle: "Grafana"
description: ""
weight: 20
no_list: true
---

# 指标
## 指标模块简介
Dubbo的指标模块帮助用户从外部观察正在运行的系统的内部服务状况 ，Dubbo参考 ["四大黄金信号"](https://sre.google/sre-book/monitoring-distributed-systems/) 并结合实际企业应用场景从不同维度统计了丰富的关键指标，关注这些核心指标对于提供可用性的服务是至关重要的。

Dubbo的关键指标包含：**延迟（Latency）**、**流量（Traffic）**、 **错误（Errors）** 和 **饱和度（Saturation）** 等内容 。同时，为了更好的监测服务运行状态，Dubbo 还提供了对核心组件状态的监控，如线程池数量、三大中心交互的指标数据等。

Dubbo目前推荐使用Prometheus来进行服务监控，Grafana来展示指标数据。接下来就通过案例来快速入门Dubbo的指标监控吧。

## 快速入门
### 环境
- 系统：Windows、Linux、MacOS
- JDK 8 及以上
- Git
- Maven

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
- enable-jvm-metrics是对JVM指标的埋点， 如果不需要这些配置项可以将其删除或者设置为false，
- aggregation配置是针对指标数据的聚合处理使监控指标更平滑，
- prometheus-exporter配置为指标数据导出器，这里配置指标服务的端口号为20888，

- 启动服务后，普罗米修斯监控服务通过访问：[http://localhost:20888](http://localhost:20888) 即可拉取数据


### 可视化页面
也可以使用 Grafana、Prometheus 等实现可视化指标监测，具体请参考以下可视化任务示例：

* [Admin 任务链接]()
* [Grafana 任务链接]()
* [Prometheus 任务链接]()

