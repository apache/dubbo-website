---
aliases:
    - /zh/overview/tasks/observability/tracing/skywalking/
description: ""
linkTitle: Skywalking
no_list: true
title: Skywalking
type: docs
weight: 2
---

本文演示如何将 Dubbo 接入 Skywalking 全链路监控体系，完整示例请参考 <a href="https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot-tracing-skywalking" target="_blank">dubbo-samples-tracing-skywalking</a>。依赖的 Skywalking Agent 版本为 [skywalking micrometer-1.10 api](https://skywalking.apache.org/docs/skywalking-java/next/en/setup/service-agent/java-agent/application-toolkit-micrometer-1.10/).

## 1. 添加 Micrometer Observation 依赖到你的项目
为了能够将  Micrometer 及相关 Metrics 依赖添加到 classpath，需要增加 `dubbo-metrics-api` 依赖，如下所示：

```xml

<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metrics-api</artifactId>
</dependency>
```

## 2. 添加 Skywalking Micrometer-1.10 Api 到项目

为了将 Dubbo Micrometer tracing 数据集成到 Skywalking，需要添加以下依赖。

```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-micrometer-1.10</artifactId>
</dependency>
```

## 3. 配置 ObservationRegistry

```java
@Configuration
public class ObservationConfiguration {
    @Bean
    ApplicationModel applicationModel(ObservationRegistry observationRegistry) {
        ApplicationModel applicationModel = ApplicationModel.defaultModel();
        observationRegistry.observationConfig()
                .observationHandler(new ObservationHandler.FirstMatchingCompositeObservationHandler(
                        new SkywalkingSenderTracingHandler(), new SkywalkingReceiverTracingHandler(),
                        new SkywalkingDefaultTracingHandler()
                ));
        applicationModel.getBeanFactory().registerBean(observationRegistry);
        return applicationModel;
    }
}
```
## 4. 启动 Skywalking OAP
请参考这里了解如何 [设置 Skywalking OAP](https://skywalking.apache.org/docs/main/v9.3.0/en/setup/backend/backend-setup/)

```shell
bash startup.sh
```

## 5. 启动示例 Demo (skywalking-agent)
首先，我们假设你已经有一个注册中心来协调地址发现，具体可参见示例里指向的注册中心配置。

之后，启动 Provider 和 Consumer 并确保 skywalking-agent 参数被正确设置，skywalking-agent 确保数据可以被正确的上报到后台系统。

* 考虑到 skywalking-agent 本身也有内置的 Dubbo 拦截器，为了确保示例能使用 Dubbo 自带的 Micrometer 集成，我么你需要删除 skywalking-agent 自带的拦截器，直接将 `plugins` 目录删除即可
* 配置 Skywalking OAP 服务器地址，在以下文件中配置 OAP 地址 `/path/to/skywalking-agent/agent.config`，对应的参数项为 `collector.backend_service`。

```shell
java -javaagent:/path/to/skywalking-agent/skywalking-agent.jar -jar dubbo-samples-spring-boot-tracing-skwalking-provider-1.0-SNAPSHOT.jar
```

```shell
java -javaagent:/path/to/skywalking-agent/skywalking-agent.jar -jar dubbo-samples-spring-boot-tracing-skwalking-consumer-1.0-SNAPSHOT.jar
```

## 6. 示例效果
在浏览器中打开 `[skywalking-webapp](http://localhost:8080/)` 查看效果

![skywalking-trace-result-1](/imgs/v3/tasks/observability/tracing/skywalking-trace-result-1.png)
![skywalking-trace-result-2](/imgs/v3/tasks/observability/tracing/skywalking-trace-result-2.png)
![skywalking-trace-result-2](/imgs/v3/tasks/observability/tracing/skywalking-trace-result-3.png)
