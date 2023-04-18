---
aliases:
    - /zh/overview/tasks/observability/metrics-start/
description: ""
linkTitle: 指标入门
no_list: true
title: 指标监控入门指南
type: docs
weight: 2
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
目前Dubbo的指标埋点仅支持3.2及以上版本，同时需要额外引入dubbo-spring-boot-observability-starter依赖如下所示：
```xml
      <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-observability-starter</artifactId>
            <version>3.2及以上的正式版本</version>
        </dependency>
```

### 配置
目前Dubbo支持推和拉两种模式获取指标数据，下面以普罗米修斯拉取指标数据的方式来作为演示，Dubbo的指标埋点服务端口复用了QOS的服务，拉取模式只需要开启QOS相关对应配置即可。下面介绍两种开启的方式分别为Spring文件中配置和dubbo.properties配置文件中配置，您可以选择其中一种适合自己方式即可。

#### Spring XML配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <dubbo:application name="metrics-provider" qos-enable="true" qos-port="22222"  qos-accept-foreign-ip="false"
                       qos-accept-foreign-ip-whitelist="192.168.1.169,47.96.183.43,192.168.1.9,121.199.25.64"/>

    <dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>
    <dubbo:config-center address="zookeeper://${zookeeper.address:127.0.0.1}:2181" />
    <dubbo:metadata-report address="zookeeper://${zookeeper.address:127.0.0.1}:2181" />

    <dubbo:metrics protocol="prometheus">
        <dubbo:aggregation enabled="true"/>
    </dubbo:metrics>

    <bean id="demoService" class="org.apache.dubbo.samples.metrics.prometheus.provider.impl.DemoServiceImpl"/>
    <dubbo:service interface="org.apache.dubbo.samples.metrics.prometheus.api.DemoService" ref="demoService"/>


    <bean id="demoService2" class="org.apache.dubbo.samples.metrics.prometheus.provider.impl.DemoServiceImpl2"/>
    <dubbo:service interface="org.apache.dubbo.samples.metrics.prometheus.api.DemoService2" ref="demoService2"/>
</beans>
```

#### dubbo.properties配置

```
dubbo.application.qos-port=22222
dubbo.application.qos-accept-foreign-ip=false
dubbo.application.qos-accept-foreign-ip-whitelist=8.131.79.126,114.55.147.139,121.199.25.64
dubbo.metrics.aggregation.enabled=true
dubbo.metrics.protocol=prometheus
```

### 查询Apache Dubbo指标

如果需要测试指标数据可以直接在服务器上面执行如下命令：

```bash
curl http://localhost:22222/metrics
```


 