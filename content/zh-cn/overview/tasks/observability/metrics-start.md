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

```
dubbo.application.qos-port=22222
dubbo.application.qos-accept-foreign-ip=true
dubbo.metrics.aggregation.enabled=true
dubbo.metrics.protocol=prometheus
```

### 查询Apache Dubbo指标

如果需要测试指标数据可以直接在服务器上面执行如下命令：

```bash
curl http://localhost:22222/metrics
```