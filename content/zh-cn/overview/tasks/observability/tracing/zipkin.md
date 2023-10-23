---
aliases:
    - /zh/overview/tasks/observability/tracing/zipkin/
description: ""
linkTitle: Zipkin
no_list: true
title: Zipkin
type: docs
weight: 1
---

这个示例演示了 Dubbo 集成 Zipkin 全链路追踪的基础示例，完整代码请参考 <a href="https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot3-tracing" target="_blank">dubbo-samples-tracing-zipkin</a>，此示例共包含三部分内容：

* dubbo-samples-spring-boot3-tracing-provider
* dubbo-samples-spring-boot3-tracing-consumer
* dubbo-samples-spring-boot3-tracing-interface

## 快速开始

### 安装 & 启动 Zipkin

参考 [Zipkin's quick start](https://zipkin.io/pages/quickstart.html) 安装 Zipkin。

这里我们使用 Docker 来演示如何快速的启动 Zipkin 服务。

```bash
docker run -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

紧接着，你可以通过如下链接确认 Zipkin 正常工作 `[http://localhost:9411](http://localhost:9411)`

![zipkin_home](/imgs/v3/tasks/observability/tracing/zipkin_home.png)

### 安装 & 启动 Nacos

跟随 [Nacos's quick start](https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html) 快速安装并启动 Nacos。

### 启动示例 Provider

在 IDE 中直接运行 `org.apache.dubbo.springboot.demo.provider.ProviderApplication`。

### 启动示例 Consumer

在 IDE 中直接运行 `org.apache.dubbo.springboot.demo.consumer.ConsumerApplication`。

### 检查监控效果

在浏览器中打开 `http://localhost:9411/zipkin/` 查看效果。

![zipkin.png](/imgs/v3/tasks/observability/tracing/zipkin.png)

## 如何在SpringBoot项目中使用 Dubbo Tracing

### 1. 添加 Dubbo Tracing 相关的 Starter 依赖

从下面两个 starter 中选择一个加入到你的项目中，区别在于 Tracer 的选型不一样，一个是 Opentelemetry，一个是 Brave：

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

### 2. 配置

在application.yml中添加如下配置：

```yaml
dubbo:
  tracing:
    enabled: true # 默认为false
    sampling:
      probability: 0.5 # 采样率, 默认是 0.1
    propagation:
      type: W3C # 传播器类型：W3C/B3 默认是W3C
    tracing-exporter:
      zipkin-config:
        endpoint: http://localhost:9411/api/v2/spans
        connect-timeout: 1s # 建立连接超时时间, 默认为1s
        read-timeout: 10s # 传递数据超时时间, 默认为10s

# tracing信息输出到logging
logging:
  pattern:
    level: '%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]'
```

## 扩展

### 选择合适的Sender

Zipkin 的 Sender，是 Exporter 将埋点后的数据进行上报的客户端实现，全部实现可[参考](https://github.com/openzipkin/zipkin-reporter-java)

Sender 有很多种实现：

* URLConnectionSender 通过 Java 自带的 HTTP 客户端上报
* OkHttpSender 通过 OKHttp3 上报
* KafkaSender 通过 Kafka 消息队列上报
* ActiveMQSender 通过 ActiveMQ 消息队列上报
* RabbitMQSender 通过 RabbitMQ 消息队列上报

Dubbo Tracing 相关的 starter 目前默认是使用 OKHttpSender，也支持 URLConnectionSender，如果想通过 URLConnectionSender 向 Zipkin 发送 Spans，可直接在 pom 中添加如下依赖：

```xml
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-sender-urlconnection</artifactId>
</dependency>
```

配置 Zipkin 的 endpoint、connectTimeout、readTimeout

```yaml
dubbo:
  tracing:
    enabled: true # 默认为false
    tracing-exporter:
      zipkin-config:
        endpoint: http://localhost:9411/api/v2/spans
        connect-timeout: 1s # 建立连接超时时间, 默认为1s
        read-timeout: 10s # 传递数据超时时间, 默认为10s
```

如果想使用其他类型的 Sender ，需要用户在项目中手动注入对应的 Bean，并配置对应的属性，如 KafkaSender：

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

### SpringBoot2案例

dubbo-tracing相关的使用在SpringBoot2与3中区别不大，SpringBoot2的案例可参考[代码地址](https://github.com/conghuhu/dubbo-samples/tree/master/4-governance/dubbo-samples-tracing/dubbo-samples-spring-boot-tracing-zipkin)。

### 非SpringBoot项目案例

对于非SpringBoot项目，也可以使用 Dubbo Bootstrap 的 api 方式使用 tracing，详细案例可参考[代码地址](https://github.com/conghuhu/dubbo-samples/tree/master/4-governance/dubbo-samples-tracing/dubbo-sample-api-tracing-otel-zipkin)
