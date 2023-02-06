---
type: docs
title: "观测服务"
linkTitle: "观测服务"
weight: 60
description: ""
feature:
  title: 可观测性
  description: >
    多维度的可观测指标（Metrics、Tracing、Access Logs）帮助了解服务运行状态，为持续定位、维护和优化服务提供依据，Admin 控制台帮助实现数据指标可视化展示
---

Dubbo 内部维护了多个纬度的可观测指标，并且支持多种方式的可视化监测。可观测性指标从总体上来说分为三个度量纬度：

* **Metrics。** Dubbo 统计了一系列的流量指标如 QPS、RT、成功请求数、失败请求数等，还包括一系列的内部组件状态如线程池数、服务健康状态等。

* **Tracing。** Dubbo 与业界主流的链路追踪工作做了适配，包括 Skywalking、Zipkin、Jaeger 都支持 Dubbo 服务的链路追踪。

* **Logging。** Dubbo 支持多种日志框架适配。以 Java 体系为例，支持包括 Slf4j、Log4j2、Log4j、Logback、Jcl 等，用户可以基于业务需要选择合适的框架；同时 Dubbo 还支持 Access Log 记录请求踪迹。

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
关于指标的配置可以参考配置项中的指标配置信息，在这里引入的配置中enable-jvm-metrics是对JVM指标的埋点，
如果不需要这些配置项可以将其删除或者设置为false，
aggregation配置是针对指标数据的聚合处理使监控指标更平滑，
prometheus-exporter配置为指标数据导出器，这里配置指标服务的端口号为20888，
启动服务后，普罗米修斯监控服务通过访问：[http://localhost:20888](http://localhost:20888) 即可拉取数据


### 可视化页面
也可以使用 Grafana、Prometheus 等实现可视化指标监测，具体请参考以下可视化任务示例：

* [Admin 任务链接]()
* [Grafana 任务链接]()
* [Prometheus 任务链接]()

## Tracing
全链路追踪对于监测分布式系统运行状态具有非常重要的价值，Dubbo 通过 Filter 拦截器实现了请求运行时的埋点跟踪，通过将跟踪数据导出到一些主流实现如 Zipkin、Skywalking、Jaeger 等，可以实现全链路跟踪数据的分析与可视化展示。

![Admin 效果图](/imgs/v3/advantages/observability-tracing.png)

只需要简单的一行配置即可切换链路跟踪的后端实现，并且，你可以随时通过 Dubbo Admin 等治理平台动态调整 Dubbo 的链路追踪采样率，对于问题排查都非常有价值。

* [基于 Skywalking 实现全链路追踪]()
* [基于 Zipkin 实现全链路追踪]()

## Logging
访问日志可以帮助分析系统的流量情况，在有些场景下，开启访问日志对于排查问题也非常有帮助。

* [开启 Access Log]()