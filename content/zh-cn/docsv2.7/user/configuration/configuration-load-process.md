---
aliases:
    - /zh/docsv2.7/user/configuration/configuration-load-process/
description: Dubbo 中的配置加载流程介绍
linkTitle: 配置加载流程
title: 配置加载流程
type: docs
weight: 5
---



此篇文档主要讲在**应用启动阶段，Dubbo框架如何将所需要的配置采集起来**（包括应用配置、注册中心配置、服务配置等），以完成服务的暴露和引用流程。

根据驱动方式的不同（比如Spring或裸API编程）配置形式上肯定会有所差异，具体请参考[XML配置](../xml)、[Annotation配置](../annotation)、[API配置](../api)三篇文档。除了外围驱动方式上的差异，Dubbo的配置读取总体上遵循了以下几个原则：

1. Dubbo 支持了多层级的配置，并按预定优先级自动实现配置间的覆盖，最终所有配置汇总到数据总线URL后驱动后续的服务暴露、引用等流程。
2. ApplicationConfig、ServiceConfig、ReferenceConfig 可以被理解成配置来源的一种，是直接面向用户编程的配置采集方式。
3. 配置格式以 Properties 为主，在配置内容上遵循约定的 `path-based` 的命名[规范](#配置格式)



## 配置来源

首先，从Dubbo支持的配置来源说起，默认有四种配置来源：

- JVM System Properties，-D 参数
- Externalized Configuration，外部化配置
- ServiceConfig、ReferenceConfig 等编程接口采集的配置
- 本地配置文件 dubbo.properties

### 覆盖关系

下图展示了配置覆盖关系的优先级，从上到下优先级依次降低：

![覆盖关系](/imgs/blog/configuration.jpg)

点此查看[外部化配置详情](../config-center)


## 配置格式

目前Dubbo支持的所有配置都是`.properties`格式的，包括`-D`、`Externalized Configuration`等，`.properties`中的所有配置项遵循一种`path-based`的配置格式：

```properties
# 应用级别
dubbo.{config-type}[.{config-id}].{config-item}={config-item-value}
# 服务级别
dubbo.service.{interface-name}[.{method-name}].{config-item}={config-item-value}
dubbo.reference.{interface-name}[.{method-name}].{config-item}={config-item-value}
# 多配置项
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
```

应用级别

```properties
dubbo.application.name=demo-provider
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.protocol.port=-1
```

服务级别

```properties
dubbo.service.org.apache.dubbo.samples.api.DemoService.timeout=5000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.timeout=6000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.timeout=7000
```

多配置项

```properties
dubbo.registries.unit1.address=zookeeper://127.0.0.1:2181
dubbo.registries.unit2.address=zookeeper://127.0.0.1:2182

dubbo.protocols.dubbo.name=dubbo
dubbo.protocols.dubbo.port=20880
dubbo.protocols.hessian.name=hessian
dubbo.protocols.hessian.port=8089
```

扩展配置

```properties
dubbo.application.parameters=[{item1:value1},{item2:value2}]
dubbo.reference.org.apache.dubbo.samples.api.DemoService.parameters=[{item3:value3}]
```

## 几种编程配置方式

接下来，我们看一下选择不同的开发方式时，对应到 ServiceConfig、ReferenceConfig 等编程接口采集的配置的变化。

#### Spring XML

> 参见[示例](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-spring-xml)

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

> 参见[示例](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-annotation)

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

> 参考[示例](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api)

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
