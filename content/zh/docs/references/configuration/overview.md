---
type: docs
title: "配置概述"
linkTitle: "概述"
weight: 10
description: "Dubbo配置介绍"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/config/overview/)。
{{% /pageinfo %}}

本文主要介绍Dubbo配置概况，包括配置组件、配置来源、配置方式及配置加载流程。

## 配置组件

Dubbo框架的配置项比较繁多，为了更好地管理各种配置，将其按照用途划分为不同的组件，最终所有配置项都会汇聚到URL中，传递给后续处理模块。

常用配置组件如下：
- application:  Dubbo应用配置
- registry:  注册中心
- protocol: 服务提供者RPC协议
- config-center: 配置中心
- metadata-report: 元数据中心
- service: 服务提供者配置
- reference: 远程服务引用配置
- provider: service的默认配置或分组配置
- consumer: reference的默认配置或分组配置
- module: 模块配置
- monitor: 监控配置
- metrics: 指标配置
- ssl:  SSL/TLS配置

### consumer 与 reference的关系

reference可以指定具体的consumer，如果没有指定consumer则会自动使用全局默认的consumer配置。

consumer的属性是reference属性的默认值，可以体现在两个地方：

1. 在刷新属性(属性覆盖)时，先提取其consumer的属性，然后提取reference自身的属性覆盖上去，叠加后的属性集合作为配置来源之一。
2. 在组装reference的URL参数时，先附加其consumer的属性，然后附加reference自身的属性。

> 可以将consumer组件理解为reference组件的虚拟分组，根据需要可以定义多个不同的consumer，不同的consumer设置特定的默认值，
然后在reference中指定consumer或者将<dubbo:reference /> 标签嵌套在<dubbo:consumer />标签之中。

### provider 与 service的关系

service可以指定具体的provider，如果没有指定则会自动使用全局默认的provider配置。
provider的属性是service属性的默认值，覆盖规则类似上面的consumer与reference，也可以将provider理解为service的虚拟分组。


## 配置来源

从Dubbo支持的配置来源说起，默认有6种配置来源：

- JVM System Properties，JVM -D 参数
- System environment，JVM进程的环境变量
- Externalized Configuration，外部化配置，从配置中心读取
- Application Configuration，应用的属性配置，从Spring应用的Environment中提取"dubbo"打头的属性集
- API / XML /注解等编程接口采集的配置可以被理解成配置来源的一种，是直接面向用户编程的配置采集方式
- 从classpath读取配置文件 dubbo.properties

### 覆盖关系

下图展示了配置覆盖关系的优先级，从上到下优先级依次降低：

![覆盖关系](/imgs/blog/configuration.jpg)

请参考相关内容：[属性覆盖](../properties#属性覆盖)。


## 配置方式

按照驱动方式可以分为以下四种方式：

### API配置
以Java编码的方式组织配置，包括Raw API和Bootstrap API，具体请参考[API配置](../api)。

### XML配置
以XML方式配置各种组件，支持与Spring无缝集成，具体请参考[XML配置](../xml)。

### Annotation配置
以注解方式暴露服务和引用服务接口，支持与Spring无缝集成，具体请参考[Annotation配置](../annotation)。

### 属性配置
根据属性Key-value生成配置组件，类似SpringBoot的ConfigurationProperties，具体请参考[属性配置](../properties)。

属性配置的另外一个重要的功能特性是[属性覆盖](../properties#属性覆盖)，使用外部属性的值覆盖已创建的配置组件属性。

如果要将属性配置放到外部的配置中心，请参考[外部化配置](../external-config)。

除了外围驱动方式上的差异，Dubbo的配置读取总体上遵循了以下几个原则：

1. Dubbo 支持了多层级的配置，并按预定优先级自动实现配置间的覆盖，最终所有配置汇总到数据总线URL后驱动后续的服务暴露、引用等流程。
2. 配置格式以 Properties 为主，在配置内容上遵循约定的 `path-based` 的[命名规范](../properties#配置格式)


## 配置加载流程

![配置加载流程](/imgs/v3/config/config-load.svg)

从上图可以看出，配置加载大概分为两个阶段：

* 第一阶段为DubboBootstrap初始化之前，在Spring context启动时解析处理XML配置/注解配置/Java-config 或者是执行API配置代码，创建config bean并且加入到ConfigManager中。
* 第二阶段为DubboBootstrap初始化过程，从配置中心读取外部配置，依次处理实例级属性配置和应用级属性配置，最后刷新所有配置实例的属性，也就是[属性覆盖](../properties#属性覆盖)。


## 几种编程配置方式

接下来，我们看一下选择不同的开发方式时，对应到 ServiceConfig、ReferenceConfig 等编程接口采集的配置的变化。

#### Spring XML

> 参见[示例](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-basic)

```xml
  <!-- dubbo-provier.xml -->
  
  <dubbo:application name="demo-provider"/>
  <dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
  
  <dubbo:registry address="zookeeper://127.0.0.1:2181" simplified="true"/>
  <dubbo:metadata-report address="redis://127.0.0.1:6379"/>
  <dubbo:protocol name="dubbo" port="20880"/>
  
  <bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>
  <dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>
```

#### Spring Annotation

> 参见[示例](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-annotation)

```java
  // AnnotationService服务实现
  
  @Service
  public class AnnotationServiceImpl implements AnnotationService {
      @Override
      public String sayHello(String name) {
          System.out.println("async provider received: " + name);
          return "annotation: hello, " + name;
      }
  }
```

```properties
  ## dubbo.properties

dubbo.application.name=annotation-provider
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
```

#### Spring Boot

> 参见[示例](https://github.com/apache/dubbo-spring-boot-project/tree/master/dubbo-spring-boot-samples)

```properties
  ## application.properties

# Spring boot application
spring.application.name=dubbo-externalized-configuration-provider-sample

# Base packages to scan Dubbo Component: @com.alibaba.dubbo.config.annotation.Service
dubbo.scan.base-packages=com.alibaba.boot.dubbo.demo.provider.service

# Dubbo Application
## The default value of dubbo.application.name is ${spring.application.name}
## dubbo.application.name=${spring.application.name}

# Dubbo Protocol
dubbo.protocol.name=dubbo
dubbo.protocol.port=12345

## Dubbo Registry
dubbo.registry.address=N/A

## DemoService version
demo.service.version=1.0.0
```

#### API

> 参考[示例](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-api)

```java
public static void main(String[] args) throws IOException {
        ServiceConfig<GreetingsService> service = new ServiceConfig<>();
        service.setApplication(new ApplicationConfig("first-dubbo-provider"));
        service.setRegistry(new RegistryConfig("multicast://224.5.6.7:1234"));
        service.setInterface(GreetingsService.class);
        service.setRef(new GreetingsServiceImpl());
        service.export();
        System.out.println("first-dubbo-provider is running.");
        System.in.read();
        }
```

