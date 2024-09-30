---
aliases:
    - /en/overview/tasks/observability/tracing/zipkin/
    - /en/overview/tasks/observability/tracing/zipkin/
description: "This example demonstrates a basic example of Dubbo integrating Zipkin for end-to-end tracing."
linkTitle: Zipkin
no_list: true
title: Zipkin
type: docs
weight: 3
---

This example demonstrates a basic example of Dubbo integrating Zipkin for end-to-end tracing. For the complete code, please refer to <a href="https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot3-tracing" target="_blank">dubbo-samples-tracing-zipkin</a>, which consists of three parts:

* dubbo-samples-spring-boot3-tracing-provider
* dubbo-samples-spring-boot3-tracing-consumer
* dubbo-samples-spring-boot3-tracing-interface

## Quick Start

### Install & Launch Zipkin

Refer to [Zipkin's quick start](https://zipkin.io/pages/quickstart.html) to install Zipkin.

Here we use Docker to demonstrate how to quickly start the Zipkin service.

```bash
docker run -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Next, you can confirm that Zipkin is working properly through the following link: `[http://localhost:9411](http://localhost:9411)`

![zipkin_home](/imgs/v3/tasks/observability/tracing/zipkin_home.png)

### Install & Launch Nacos

Follow [Nacos's quick start](https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html) to quickly install and launch Nacos.

### Start Example Provider

Run `org.apache.dubbo.springboot.demo.provider.ProviderApplication` directly in the IDE.

### Start Example Consumer

Run `org.apache.dubbo.springboot.demo.consumer.ConsumerApplication` directly in the IDE.

### Check Monitoring Effects

Open `http://localhost:9411/zipkin/` in your browser to see the effects.

![zipkin.png](/imgs/v3/tasks/observability/tracing/zipkin.png)

## How to Use Dubbo Tracing in SpringBoot Projects

### 1. Add Dubbo Tracing Related Starter Dependencies

Choose one from the two starters below to add to your project, with differences in the choice of Tracer, one is Opentelemetry, and the other is Brave:

```xml
<!-- Opentelemetry as Tracer, Zipkin as exporter -->
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-otel-zipkin-starter</artifactId>
</dependency>
```

```xml
<!-- Brave as Tracer, Zipkin as exporter -->
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-brave-zipkin-starter</artifactId>
</dependency>
```

### 2. Configuration

Add the following configuration in application.yml:

```yaml
dubbo:
  tracing:
    enabled: true # Default is false
    sampling:
      probability: 0.5 # Sampling rate, default is 0.1
    propagation:
      type: W3C # Propagator type: W3C/B3, default is W3C
    tracing-exporter:
      zipkin-config:
        endpoint: http://localhost:9411/api/v2/spans
        connect-timeout: 1s # Connection timeout, default is 1s
        read-timeout: 10s # Data transmission timeout, default is 10s

# Output tracing information to logging
logging:
  pattern:
    level: '%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]'
```

## Extension

### Choose the Right Sender

The Sender in Zipkin is a client implementation for the Exporter to report the traced data, all implementations can be [referenced here](https://github.com/openzipkin/zipkin-reporter-java).

There are many implementations of Sender:

* URLConnectionSender reports via Java's built-in HTTP client
* OkHttpSender reports via OKHttp3
* KafkaSender reports via Kafka messaging queue
* ActiveMQSender reports via ActiveMQ messaging queue
* RabbitMQSender reports via RabbitMQ messaging queue

Currently, the default starter for Dubbo Tracing uses OKHttpSender and also supports URLConnectionSender. If you want to send Spans to Zipkin via URLConnectionSender, you can directly add the following dependency in your pom:

```xml
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-sender-urlconnection</artifactId>
</dependency>
```

Configure Zipkin's endpoint, connectTimeout, readTimeout.

```yaml
dubbo:
  tracing:
    enabled: true # Default is false
    tracing-exporter:
      zipkin-config:
        endpoint: http://localhost:9411/api/v2/spans
        connect-timeout: 1s # Connection timeout, default is 1s
        read-timeout: 10s # Data transmission timeout, default is 10s
```

If you want to use other types of Sender, you will need to manually inject the corresponding Bean in your project and configure the corresponding properties, such as KafkaSender:

```java
@Configuration
public class KafkaSenderConfiguration {

    @Bean
    KafkaSender kafkaSender(){
        KafkaSender.Builder builder = KafkaSender.newBuilder();
        builder.bootstrapServers("127.0.0.0.1:9092");
        builder.topic("zipkin");
        builder.encoding(Encoding.JSON);
        return builder.build();
    }

}
```

### SpringBoot2 Example

The usage of dubbo-tracing remains largely the same between SpringBoot2 and 3, the example for SpringBoot2 can be referenced at [code address](https://github.com/conghuhu/dubbo-samples/tree/master/4-governance/dubbo-samples-tracing/dubbo-samples-spring-boot-tracing-zipkin).

### Non-SpringBoot Project Example

For non-SpringBoot projects, tracing can also be used through the Dubbo Bootstrap API method, detailed examples can be referenced at [code address](https://github.com/conghuhu/dubbo-samples/tree/master/4-governance/dubbo-samples-tracing/dubbo-sample-api-tracing-otel-zipkin)

