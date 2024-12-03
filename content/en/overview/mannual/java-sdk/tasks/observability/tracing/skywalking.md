---
aliases:
    - /en/overview/tasks/observability/tracing/skywalking/
    - /en/overview/tasks/observability/tracing/skywalking/
description: "This article demonstrates how to integrate Dubbo with the Skywalking full-link monitoring system."
linkTitle: Skywalking
no_list: true
title: Skywalking
type: docs
weight: 4
---

This article demonstrates how to integrate Dubbo with the Skywalking full-link monitoring system. For complete examples, please refer to <a href="https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot-tracing-skywalking" target="_blank">dubbo-samples-tracing-skywalking</a>. The required Skywalking Agent version is [skywalking micrometer-1.10 api](https://skywalking.apache.org/docs/skywalking-java/next/en/setup/service-agent/java-agent/application-toolkit-micrometer-1.10/).

## 1. Add Micrometer Observation dependency to your project
To add Micrometer and related Metrics dependencies to the classpath, you need to include the `dubbo-metrics-api` dependency as follows:

```xml

<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metrics-api</artifactId>
</dependency>
```

## 2. Add Skywalking Micrometer-1.10 Api to the project

To integrate Dubbo Micrometer tracing data into Skywalking, add the following dependency.

```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-micrometer-1.10</artifactId>
</dependency>
```

## 3. Configure ObservationRegistry

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
## 4. Start Skywalking OAP
Please refer here for how to [set up Skywalking OAP](https://skywalking.apache.org/docs/main/latest/en/setup/backend/backend-setup/)

```shell
bash startup.sh
```

## 5. Start Example Demo (skywalking-agent)
First, we assume you already have a registry to coordinate address discovery, details can be found in the registry configuration pointed to in the example.

Then, start the Provider and Consumer and ensure that the skywalking-agent parameters are correctly set, as skywalking-agent ensures data can be correctly reported to the backend system.

* Given that the skywalking-agent itself also has built-in Dubbo interceptors, to ensure the example can use Dubbo's Micrometer integration, we need you to remove the interceptors that come with skywalking-agent by simply deleting the `plugins` directory.
* Configure the Skywalking OAP server address in the following file by setting the OAP address `/path/to/skywalking-agent/agent.config`, the corresponding parameter item is `collector.backend_service`.

```shell
java -javaagent:/path/to/skywalking-agent/skywalking-agent.jar -jar dubbo-samples-spring-boot-tracing-skwalking-provider-1.0-SNAPSHOT.jar
```

```shell
java -javaagent:/path/to/skywalking-agent/skywalking-agent.jar -jar dubbo-samples-spring-boot-tracing-skwalking-consumer-1.0-SNAPSHOT.jar
```

## 6. Example Effect
Open `[skywalking-webapp](http://localhost:8080/)` in your browser to see the effect

![skywalking-trace-result-1](/imgs/v3/tasks/observability/tracing/skywalking-trace-result-1.png)
![skywalking-trace-result-2](/imgs/v3/tasks/observability/tracing/skywalking-trace-result-2.png)
![skywalking-trace-result-2](/imgs/v3/tasks/observability/tracing/skywalking-trace-result-3.png)

