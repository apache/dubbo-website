---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/overview/
description: 对 Dubbo 配置总体设计与工作原理进行了总体概述，包括配置组件、配置来源、配置方式及配置加载流程等。
linkTitle: 配置概述
title: 配置概述
type: docs
weight: 1
---






* [使用 Spring Boot 快速开发 Dubbo 应用](../../../quick-start/spring-boot/)

* [配置项参考手册](../properties)

* [配置加载及覆盖的工作原理](../principle)

组件名称 | 描述 | 范围 | 是否必须配置
------ | ------ | ------ | ------
application |  指定应用名等应用级别相关信息 |  一个应用内只允许出现一个 |  必选
service |  声明普通接口或实现类为 Dubbo 服务 |  一个应用内可以有 0 到多个 service |  service/reference 至少一种
reference |  声明普通接口为 Dubbo 服务 |  一个应用内可以有 0 到多个 reference |  service/reference 至少一种
protocol |  要暴露的 RPC 协议及相关配置如端口号等 |  一个应用可配置多个，一个 protocol 可作用于一组 service&reference |  可选，默认 dubbo
registry |  注册中心类型、地址及相关配置 |  一个应用内可配置多个，一个 registry 可作用于一组 service&reference|  必选
config-center | 配置中心类型、地址及相关配置 |  一个应用内可配置多个，所有服务共享 |  可选
metadata-report |  元数据中心类型、地址及相关配置 |  一个应用内可配置多个，所有服务共享 |  可选
consumer |  reference 间共享的默认配置 |  一个应用内可配置多个，一个 consumer 可作用于一组 reference |  可选
provider |  service 间共享的默认配置 |  一个应用内可配置多个，一个 provider 可作用于一组 service |  可选
monitor |  监控系统类型及地址 |  一个应用内只允许配置一个 |  可选
metrics |  数据采集模块相关配置 |  一个应用内只允许配置一个 |  可选
ssl |  ssl/tls 安全链接相关的证书等配置 |  一个应用内只允许配置一个 |  可选
method | 指定方法级的配置 | service 和 reference 的子配置 |  可选
argument | 某个方法的参数配置 | method的子配置 |  可选

## 实现原理

为了更好地管理各种配置，Dubbo 抽象了一套结构化的配置组件，各组件总体以用途划分，分别控制不同作用域的行为。

![dubbo-config](/imgs/user/dubbo-config.jpg)




> 从实现原理层面，最终 Dubbo 所有的配置项都会被组装到 URL 中，以 URL 为载体在后续的启动、RPC 调用过程中传递，进而控制框架行为。如想了解更多，请参照 Dubbo 源码解析系列文档或 [Blog](/zh-cn/blog/2019/10/17/dubbo-中的-url-统一模型/#rpc调用)。

> 各组件支持的具体配置项及含义请参考 [配置项手册](../properties)

### service 与 reference
`service` 与 `reference` 是 Dubbo 最基础的两个配置项，它们用来将某个指定的接口或实现类注册为 Dubbo 服务，并通过配置项控制服务的行为。
* `service` 用于服务提供者端，通过 `service` 配置的接口和实现类将被定义为标准的 Dubbo 服务，从而实现对外提供 RPC 请求服务。
* `reference` 用于服务消费者端，通过 `reference` 配置的接口将被定义为标准的 Dubbo 服务，生成的 proxy 可发起对远端的 RPC 请求。

> 一个应用中可以配置任意多个 `service` 与 `reference`。

### consumer 与 provider
* 当应用内有多个 `reference` 配置时，`consumer` 指定了这些 `reference` 共享的默认值，如共享的超时时间等以简化繁琐的配置，如某个 `reference` 中单独设置了配置项值则该 `reference` 中的配置优先级更高。
* 当应用内有多个 `service` 配置时，`provider` 指定了这些 `service` 共享的默认值，如某个 `service` 中单独设置了配置项值则该 `service` 中的配置优先级更高。

> consumer 组件还可以对 reference 进行虚拟分组，不通分组下的 reference 可有不同的 consumer 默认值设定；如在 XML 格式配置中，<dubbo:reference /> 标签可通过嵌套在 <dubbo:consumer /> 标签之中实现分组。provider 与 service 之间也可以实现相同的效果。

## 配置方式

### 属性配置
根据属性Key-value生成配置组件，类似SpringBoot的ConfigurationProperties，具体请参考[属性配置](../properties)。

属性配置的另外一个重要的功能特性是[属性覆盖](../principle/#32-属性覆盖)，使用外部属性的值覆盖已创建的配置组件属性。

如果要将属性配置放到外部的配置中心，请参考[外部化配置](../principle/#33-外部化配置)。

除了外围驱动方式上的差异，Dubbo 的配置读取总体上遵循了以下几个原则：

1. Dubbo 支持了多层级的配置，并按预定优先级自动实现配置间的覆盖，最终所有配置汇总到数据总线URL后驱动后续的服务暴露、引用等流程。
2. 配置格式以 Properties 为主，在配置内容上遵循约定的 `path-based` 的[命名规范](../principle/#1-配置格式)

### API 配置
> 以Java编码的方式组织配置，包括Raw API和Bootstrap API，具体请参考[API配置](../api)。

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

### XML 配置
> 以XML方式配置各种组件，支持与Spring无缝集成，具体请参考[XML配置](../xml)。

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

### Annotation 配置
> 以注解方式暴露服务和引用服务接口，支持与Spring无缝集成，具体请参考[Annotation配置](../annotation)。

```java
  // AnnotationService服务实现

  @DubboService
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

### Spring Boot 配置
> 使用 Spring Boot 减少非必要配置，结合 Annotation 与 application.properties/application.yml 开发 Dubbo 应用，具体请参考[Annotation 配置](../annotation)。

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

## 配置规范与来源

Dubbo 遵循一种 [path-based 的配置规范](../principle/)，每一个配置组件都可以通过这种方式进行表达。而在配置的来源上，总共支持 6 种配置来源，即 Dubbo 会分别尝试从以下几个位置尝试加载配置数据：

- JVM System Properties，JVM -D 参数
- System environment，JVM进程的环境变量
- Externalized Configuration，[外部化配置](../principle/#33-外部化配置)，从配置中心读取
- Application Configuration，应用的属性配置，从Spring应用的Environment中提取"dubbo"打头的属性集
- API / XML /注解等编程接口采集的配置可以被理解成配置来源的一种，是直接面向用户编程的配置采集方式
- 从classpath读取配置文件 dubbo.properties