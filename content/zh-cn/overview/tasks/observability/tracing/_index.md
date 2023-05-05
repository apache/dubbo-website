---
aliases:
    - /zh/overview/tasks/observability/tracing/
description: ""
linkTitle: 全链路追踪
no_list: true
title: 全链路追踪
type: docs
weight: 2
---


{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
<div class="lead"></div>
<header class="article-meta"></header>
<div class="row">
        <div class="col-sm col-md-6 mb-4">
          <div class="h-100 card shadow">
                <div class="card-body">
                    <h4 class="card-title">
                        <a href='{{< relref "./zipkin/" >}}'>Zipkin 全链路追踪</a>
                    </h4>
                    <p>演示如果通过 Zipkin 实现对 Dubbo 服务的全链路追踪。
                    </p>
                </div>
            </div>
        </div>
        <div class="col-sm col-md-6 mb-4">
            <div class="h-100 card shadow">
                <div class="card-body">
                    <h4 class="card-title">
                        <a href='{{< relref "./skywalking/" >}}'>Skywalking 全链路追踪</a>
                    </h4>
                    <p>演示如果通过 Skywalking 实现对 Dubbo 服务的全链路追踪。
                    </p>
                </div>
            </div>
        </div>
</div>
<hr>
</div>
{{< /blocks/section >}}
---
aliases:
    - /zh/overview/tasks/observability/tracing/
description: ""
linkTitle: 全链路追踪
no_list: true
title: 全链路追踪
type: docs
weight: 2
---

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
<div class="lead"></div>
<header class="article-meta"></header>
<div class="row">
        <div class="col-sm col-md-6 mb-4">
          <div class="h-100 card shadow">
                <div class="card-body">
                    <h4 class="card-title">
                        <a href='{{< relref "./zipkin/" >}}'>Zipkin 全链路追踪</a>
                    </h4>
                    <p>演示如果通过 Zipkin 实现对 Dubbo 服务的全链路追踪。
                    </p>
                </div>
            </div>
        </div>
        <div class="col-sm col-md-6 mb-4">
            <div class="h-100 card shadow">
                <div class="card-body">
                    <h4 class="card-title">
                        <a href='{{< relref "./skywalking/" >}}'>Skywalking 全链路追踪</a>
                    </h4>
                    <p>演示如果通过 Skywalking 实现对 Dubbo 服务的全链路追踪。
                    </p>
                </div>
            </div>
        </div>
</div>
<hr>
</div>
{{< /blocks/section >}}

## 说明

目前Dubbo内置了Micrometer（SpringBoot3内置的可观测组件）

## Tracing相关概念

- tracer: 处理span生命周期的库（dubbo支持opentelemetry和brave）。它可以通过exporter创建、启动、停止和报告spans到外部系统（如Zipkin、Jagger等）。
- exporter: 将产生的trace信息通过http等接口上报到外部系统。

## SpringBoot Starters

对于SpringBoot用户，Dubbo提供了tracing相关的starters，自动装配Micrometer相关的配置代码，且用户可自由选择tracer和exporter。

### opentelemetry作为tracer，将trace信息export到zipkin

```yml
  <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-otel-zipkin-starter</artifactId>
    <version>${version}</version>
  </dependency>
```

### brave作为tracer，将trace信息export到zipkin

```yml
  <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-tracing-brave-zipkin-starter</artifactId>
    <version>${version}</version>
  </dependency>
```

### 自由组装tracer和exporter

如果用户基于Micrometer有自定义的需求，想将trace信息上报至其他外部系统观测，可参照如下自由组装tracer和exporter：

```yml
  <!-- 自动装配 -->
  <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-spring-boot-observability-starter</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- otel作为tracer -->
  <dependency>
      <groupId>io.micrometer</groupId>
      <artifactId>micrometer-tracing-bridge-otel</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- export到zipkin -->
  <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-exporter-zipkin</artifactId>
      <version>${version}</version>
  </dependency>
```

```yml
  <!-- 自动装配 -->
  <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-spring-boot-observability-starter</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- brave作为tracer  -->
  <dependency>
      <groupId>io.micrometer</groupId>
      <artifactId>micrometer-tracing-bridge-brave</artifactId>
      <version>${version}</version>
  </dependency>
  <!-- export到zipkin -->
  <dependency>
      <groupId>io.zipkin.reporter2</groupId>
      <artifactId>zipkin-reporter-brave</artifactId>
      <version>${version}</version>
  </dependency>
```

后续还会开发更多的starter，敬请期待
