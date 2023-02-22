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

* **Metrics** Dubbo 统计了一系列的流量指标如 QPS、RT、成功请求数、失败请求数等，还包括一系列的内部组件状态如线程池数、服务健康状态等。
* **Tracing** Dubbo 与业界主流的链路追踪工作做了适配，包括 Skywalking、Zipkin、Jaeger 都支持 Dubbo 服务的链路追踪。
* **Logging** Dubbo 支持多种日志框架适配。以 Java 体系为例，支持包括 Slf4j、Log4j2、Log4j、Logback、Jcl 等，用户可以基于业务需要选择合适的框架；同时 Dubbo 还支持 Access Log 记录请求踪迹等日志的分层。
# 指标
## 指标模块简介
Dubbo的指标模块帮助用户从外部观察正在运行的系统的内部服务状况 ，Dubbo参考 *[四个黄金信号](https://sre.google/sre-book/monitoring-distributed-systems/)*、*RED方法*、*USE方法*等理论并结合实际企业应用场景从不同维度统计了丰富的关键指标，关注这些核心指标对于提供可用性的服务是至关重要的。 

Dubbo的关键指标包含：**延迟（Latency）**、**流量（Traffic）**、 **错误（Errors）** 和 **饱和度（Saturation）** 等内容 。同时，为了更好的监测服务运行状态，Dubbo 还提供了对核心组件状态的监控，如Dubbo应用信息、线程池信息、三大中心交互的指标数据等。

Dubbo目前推荐使用Prometheus来进行服务监控，Grafana来展示指标数据。接下来就通过案例来快速入门Dubbo的指标监控吧。

## 快速入门
### 环境
- 系统：Windows、Linux、MacOS
- JDK 8 及以上
- Git  
- Maven   
- Prometheus [安装教程](../install/prometheus-install)
- Grafana [安装教程](../install/grafana-install)

### 参考案例
Dubbo官方案例中提供了指标埋点的示例，可以访问如下地址获取案例源码：
- Spring项目参考案例：  [dubbo-samples-metrics-prometheus](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-prometheus)
- SpringBoot项目参考案例: [dubbo-samples-metrics-spring-boot](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-spring-boot)

### 依赖
目前Dubbo的指标埋点仅支持3.2及以上版本，同时需要额外引入dubbo-metrics-prometheus依赖如下所示：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metrics-prometheus</artifactId>
    <version>3.2及以上版本</version>
</dependency>
```

### 配置
目前Dubbo支持推和拉两种模式获取指标数据，下面以普罗米修斯拉取指标数据的方式来作为演示，开启Dubbo的指标埋点只需要引入以下对应配置即可。下面介绍两种开启的方式分别为Spring文件中配置和dubbo.properties配置文件中配置，您可以选择其中一种适合自己方式即可。

**Spring配置文件中的指标配置**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <dubbo:application name="metrics-provider"/>

    <dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>
    <dubbo:config-center address="zookeeper://${zookeeper.address:127.0.0.1}:2181" />
    <dubbo:metadata-report address="zookeeper://${zookeeper.address:127.0.0.1}:2181" />

    <dubbo:metrics protocol="prometheus" enable-jvm-metrics="true">
        <dubbo:aggregation enabled="true"/>
        <dubbo:prometheus-exporter enabled="true"  metrics-port="20888"/>
    </dubbo:metrics>
</beans>

```
**dubbo.properties配置文件中的指标配置**

当然您也可以通过在dubbo.properties这样的配置文件中新增如下配置：

```bash
dubbo.application.name=metrics-provider
dubbo.metrics.protocol=prometheus
dubbo.metrics.enable-jvm-metrics=true
dubbo.metrics.aggregation.enabled=true
dubbo.metrics.prometheus.exporter.enabled=true
dubbo.metrics.prometheus.exporter.metrics-port=20888
dubbo.registry.address=zookeeper://${zookeeper.address:127.0.0.1}:2181
```

关于指标的配置可以参考配置项中的指标配置信息，在这里引入的配置中:

- **protocol：** 当前指标体系类型，这里是普罗米修斯。

- **enable-jvm-metrics：** 是对JVM指标的埋点， 如果不需要这些配置项可以将其删除或者设置为false。
- **aggregation：** 针对指标数据的聚合处理使监控指标更平滑。
- **prometheus-exporter：** 指标数据导出器，这里配置指标服务的端口号为20888。

配置完成后即可启动服务。

### 指标获取

前面的例子中提供了指标服务，下面就来看下如何将指标上报到普罗米修斯系统中。
如果需要测试指标数据可以直接在服务器上面执行如下命令：
```bash
curl http://localhost:20888
```
为了使演示结果更清晰下面是使用浏览器发起的GET请求获取到的指标数据：
![metrics.png](/imgs/v3/advantages/metrics.png)

接下来我们可以通过普罗米修斯来获取数据。普罗米修斯通过服务发现的形式来获取数据，下面演示普罗米修斯拉取指标数据的方式：
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

### 可视化页面
可视化页面目前推荐的方式是使用Grafana来配置Dubbo的可观测性监控大盘，下面以Grafana可视化为例来看下如何通过Dubbo可观测性大盘来监测Dubbo服务：

![grafana-dashboard-1.png](/imgs/v3/advantages/grafana-dashboard-1.png)
![grafana-dashboard-2.png](/imgs/v3/advantages/grafana-dashboard-2.png)


Dubbo提供了丰富的指标面板，这些面板均可以在Grafana官方面板库中找到：您可以直接导入如下模版，并配置好数据源即可。

**Apache Dubbo Observability Dashboard：**  [https://grafana.com/grafana/dashboards/18051](https://grafana.com/grafana/dashboards/18051)

**JVM (Micrometer) Dashboard：** [https://grafana.com/grafana/dashboards/4701](https://grafana.com/grafana/dashboards/4701)


### Dubbo 指标含义
#### Provider Metrics

| 指标                                      | 含义                                      |
| ----------------------------------------- | ----------------------------------------- |
| dubbo_provider_qps_seconds                | 提供者每秒接收的请求数                    |
| dubbo_provider_requests_total             | 提供者总的接收请求数                      |
| dubbo_provider_requests_processing        | 提供者正在处理的接收的请求数              |
| dubbo_provider_requests_succeed_total     | 提供者请求成功接收的请求数                |
| dubbo_provider_requests_total_aggregate   | 滑动窗口下的提供者总的接收请求数          |
| dubbo_provider_requests_succeed_aggregate | 滑动窗口下的提供者成功的接收请求数        |
| dubbo_provider_rt_seconds_min             | 提供者处理请求中最小的响应时间            |
| dubbo_provider_rt_seconds_avg             | 提供者处理请求的平均响应时间              |
| dubbo_provider_rt_seconds_sum             | 提供者处理请求的时间总和                  |
| dubbo_provider_rt_seconds_max             | 提供者处理请求中最大的响应时间            |
| dubbo_provider_rt_seconds_last            | 提供者处理请求中当前的响应时间            |
| dubbo_provider_rt_seconds_p95             | 提供者处理请求中95%的请求耗费的总响应时间 |
| dubbo_provider_rt_seconds_p99             | 提供者处理请求中99%的请求耗费的总响应时间 |


#### Consumer Metrics

| 指标                                      | 含义                                      |
| ----------------------------------------- | ----------------------------------------- |
| dubbo_consumer_qps_seconds                | 消费者每秒发送的请求数                    |
| dubbo_consumer_requests_total             | 消费者总的发送请求数                      |
| dubbo_consumer_requests_processing        | 消费者正在处理的发送的请求数              |
| dubbo_provider_requests_succeed_total     | 消费者请求成功发送的请求数                |
| dubbo_consumer_requests_total_aggregate   | 滑动窗口下的消费者总的发送请求数          |
| dubbo_consumer_requests_succeed_aggregate | 滑动窗口下的消费者成功的发送请求数        |
| dubbo_consumer_rt_seconds_min             | 消费者处理请求中最小的响应时间            |
| dubbo_consumer_rt_seconds_avg             | 消费者处理请求的平均响应时间              |
| dubbo_consumer_rt_seconds_sum             | 消费者处理请求的时间总和                  |
| dubbo_consumer_rt_seconds_max             | 消费者处理请求中最大的响应时间            |
| dubbo_consumer_rt_seconds_last            | 消费者处理请求中当前的响应时间            |
| dubbo_consumer_rt_seconds_p95             | 消费者处理请求中95%的请求耗费的总响应时间 |
| dubbo_consumer_rt_seconds_p99             | 消费者处理请求中99%的请求耗费的总响应时间 |

#### ThreadPool Metrics

#### Registration Center Metrics

#### Metadata Center Metrics

#### Configuration Center Metrics







## Tracing
全链路追踪对于监测分布式系统运行状态具有非常重要的价值，Dubbo 通过 Filter 拦截器实现了请求运行时的埋点跟踪，通过将跟踪数据导出到一些主流实现如 Zipkin、Skywalking、Jaeger 等，可以实现全链路跟踪数据的分析与可视化展示。

![Admin 效果图](/imgs/v3/advantages/observability-tracing.png)

只需要简单的一行配置即可切换链路跟踪的后端实现，并且，你可以随时通过 Dubbo Admin 等治理平台动态调整 Dubbo 的链路追踪采样率，对于问题排查都非常有价值。

* [基于 Skywalking 实现全链路追踪]()
* [基于 Zipkin 实现全链路追踪]()

## Logging
访问日志可以帮助分析系统的流量情况，在有些场景下，开启访问日志对于排查问题也非常有帮助。

* [开启 Access Log]()