
---
type: docs
title: "Dubbo的可观测性"
linkTitle: "可观测性"
weight: 2
no_list: true
hide_summary: true
---



# Dubbo的可观测性
可观测性是从外部观察正在运行的系统的内部状态的能力。它由日志记录、指标和跟踪三大支柱组成。

为了深入观察Dubbo内部的运行状况，Dubbo可观测性包括许多附加功能，帮助您在将应用程序推向生产时监视和管理应用程序。您可以选择使用HTTP端点或JMX来管理和监视应用程序。审计、运行状况和度量收集也可以自动应用于应用程序。

如何开启Dubbo的可观测性？主要通过引入如下依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-actuator</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

Dubbo可观测性主要管理如下几大纬度分别是:
+ [指标埋点](./meter.md) 
+ [链路追踪](./tracing.md) 
+ [日志管理](./logging.md) 
+ [健康检查](./health-information.md)  
+ [K8S探测器](./kubernetes-probes.md)
+ [文档案例](./doc.md/) 
 

