---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/principle/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/principle/
description: Dubbo 配置方式和工作原理的深度解读，包括配置格式、设计思路、来源、加载流程等。
linkTitle: 配置加载流程
title: 配置工作原理
type: docs
weight: 5
---

本文主要讲解 Dubbo 配置相关的 API 与工作原理，学习 Dubbo 的多种配置源、每种配置源的具体配置方式、不同配置源之间的优先级与覆盖关系。

## 实现原理

为了更好地管理各种配置，Dubbo 抽象了一套结构化的配置组件，各组件总体以用途划分，分别控制不同作用域的行为。

![dubbo-config](/imgs/user/dubbo-config.jpg)


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


> 从实现原理层面，最终 Dubbo 所有的配置项都会被组装到 URL 中，以 URL 为载体在后续的启动、RPC 调用过程中传递，进而控制框架行为。如想了解更多，请参照 Dubbo 源码解析系列文档或 [Blog](/zh-cn/blog/2019/10/17/dubbo-中的-url-统一模型/#rpc调用)。

> 各组件支持的具体配置项及含义请参考 [配置项手册](../properties)


{{% alert title="注意" color="info" %}}
**背景**

在每个dubbo应用中某些种类的配置类实例只能出现一次（比如`ApplicationConfig`、`MonitorConfig`、`MetricsConfig`、`SslConfig`、`ModuleConfig`），有些能出现多次（比如`RegistryConfig`、`ProtocolConfig`等）。

如果应用程序意外的扫描到了多个唯一配置类实例（比如用户在一个dubbo应用中错误了配置了两个`ApplicationConfig`），应该以哪种策略来处理这种情况呢？是直接抛异常？是保留前者忽略后者？是忽略前者保留后者？还是允许某一种形式的并存（比如后者的属性覆盖到前者上）？

目前dubbo中的唯一配置类类型和以及某唯一配置类型找到多个实例允许的配置模式/策略如下。

**唯一配置类类型**

`ApplicationConfig`、`MonitorConfig`、`MetricsConfig`、`SslConfig`、`ModuleConfig`。

前四个属于应用级别的，最后一个属于模块级别的。

**配置模式**

- `strict`：严格模式。直接抛异常。
- `override`：覆盖模式。忽略前者保留后者。
- `ignore`：忽略模式。忽略后者保留前者。
- `override_all`：属性覆盖模式。不管前者的属性值是否为空，都将后者的属性覆盖/设置到前者上。
- `override_if_absent`：若不存在则属性覆盖模式。只有前者对应属性值为空，才将后者的属性覆盖/设置到前者上。

注：后两种还影响配置实例的属性覆盖。因为dubbo有多种配置方式，即存在多个配置源，配置源也有优先级。比如通过xml方式配置了一个`ServiceConfig`且指定属性`version=1.0.0`，同时我们又在外部配置(配置中心)中配置了`dubbo.service.{interface}.version=2.0.0`，在没有引入`config-mode`配置项之前，按照原有的配置源优先级，最终实例的`version=2.0.0`。但是引入了`config-mode`配置项之后，配置优先级规则也不再那么严格，即如果指定`config-mode为override_all`则为`version=2.0.0`，如果`config-mode为override_if_absent`则为`version=1.0.0`，`config-mode`为其他值则遵循原有配置优先级进行属性设值/覆盖。

**配置方式**

配置的key为`dubbo.config.mode`，配置的值为如上描述的几种，默认的策略值为`strict`。下面展示了配置示例

```properties
# JVM -D
-Ddubbo.config.mode=strict

# 环境变量
DUBBO_CONFIG_MODE=strict

# 外部配置(配置中心)、Spring应用的Environment、dubbo.properties
dubbo.config.mode=strict
```
{{% /alert %}}

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






> [dubbo-spring-boot-samples](https://github.com/apache/dubbo-spring-boot-project/tree/master/dubbo-spring-boot-samples)

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

  ## service default version
  dubbo.provider.version=1.0.0
```
接下来，我们就围绕这个示例，分别从配置格式、配置来源、加载流程三个方面对 Dubbo 配置的工作原理进行分析。

## 1 配置格式

目前Dubbo支持的所有配置都是`.properties`格式的，包括`-D`、`Externalized Configuration`等，`.properties`中的所有配置项遵循一种`path-based`的配置格式。

在Spring应用中也可以将属性配置放到`application.yml`中，其树层次结构的方式可读性更好一些。

```properties
# 应用级配置（无id）
dubbo.{config-type}.{config-item}={config-item-value}

# 实例级配置（指定id或name）
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}

# 服务接口配置
dubbo.service.{interface-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{config-item}={config-item-value}

# 方法配置
dubbo.service.{interface-name}.{method-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{method-name}.{config-item}={config-item-value}

# 方法argument配置
dubbo.reference.{interface-name}.{method-name}.{argument-index}.{config-item}={config-item-value}

```

### 1.1 应用级配置（无id）

应用级配置的格式为：配置类型单数前缀，无id/name。
```properties
# 应用级配置（无id）
dubbo.{config-type}.{config-item}={config-item-value}
```

类似 `application`、`monitor`、`metrics` 等都属于应用级别组件，因此仅允许配置单个实例；而 `protocol`、`registry` 等允许配置多个的组件，在仅需要进行单例配置时，可采用此节描述的格式。常见示例如下：

```properties
dubbo.application.name=demo-provider
dubbo.application.qos-enable=false

dubbo.registry.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=-1
```

### 1.2 实例级配置（指定id或name）

针对某个实例的属性配置需要指定id或者name，其前缀格式为：配置类型复数前缀 + id/name。适用于 `protocol`、`registry` 等支持多例配置的组件。

```properties
# 实例级配置（指定id或name）
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}
```

* 如果不存在该id或者name的实例，则框架会基于这里列出来的属性创建配置组件实例。
* 如果已存在相同id或name的实例，则框架会将这里的列出的属性作为已有实例配置的补充，详细请参考[属性覆盖](../principle#32-属性覆盖)。
* 具体的配置复数形式请参考[单复数配置对照表](../principle#17-配置项单复数对照表)

配置示例：

```properties
dubbo.registries.unit1.address=zookeeper://127.0.0.1:2181
dubbo.registries.unit2.address=zookeeper://127.0.0.1:2182

dubbo.protocols.dubbo.name=dubbo
dubbo.protocols.dubbo.port=20880

dubbo.protocols.hessian.name=hessian
dubbo.protocols.hessian.port=8089
```

### 1.3 服务接口配置

```properties
dubbo.service.org.apache.dubbo.samples.api.DemoService.timeout=5000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.timeout=6000
```

### 方法配置

方法配置格式:

```properties
# 方法配置
dubbo.service.{interface-name}.{method-name}.{config-item}={config-item-value}
dubbo.reference.{interface-name}.{method-name}.{config-item}={config-item-value}

# 方法argument配置
dubbo.reference.{interface-name}.{method-name}.{argument-index}.{config-item}={config-item-value}
```

方法配置示例：
```properties
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.timeout=7000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.oninvoke=notifyService.onInvoke
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.onreturn=notifyService.onReturn
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.onthrow=notifyService.onThrow
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.0.callback=true
```

等价于XML配置：

```xml
<dubbo:reference interface="org.apache.dubbo.samples.api.DemoService" >
    <dubbo:method name="sayHello" timeout="7000" oninvoke="notifyService.onInvoke"
                  onreturn="notifyService.onReturn" onthrow="notifyService.onThrow">
        <dubbo:argument index="0" callback="true" />
    </dubbo:method>
</dubbo:reference>
```

### 1.4 参数配置

parameters参数为map对象，支持xxx.parameters=[{key:value},{key:value}]方式进行配置。
```properties
dubbo.application.parameters=[{item1:value1},{item2:value2}]
dubbo.reference.org.apache.dubbo.samples.api.DemoService.parameters=[{item3:value3}]
```

### 1.5 传输层配置

triple协议采用Http2做底层通信协议，允许使用者自定义Http2的[6个settings参数](https://datatracker.ietf.org/doc/html/rfc7540#section-6.5.2)

配置格式如下：

```properties
# 通知对端header压缩索引表的上限个数
dubbo.rpc.tri.header-table-size=4096

# 启用服务端推送功能
dubbo.rpc.tri.enable-push=false

# 通知对端允许的最大并发流数
dubbo.rpc.tri.max-concurrent-streams=2147483647

# 声明发送端的窗口大小
dubbo.rpc.tri.initial-window-size=1048576

# 设置帧的最大字节数
dubbo.rpc.tri.max-frame-size=32768

# 通知对端header未压缩的最大字节数
dubbo.rpc.tri.max-header-list-size=8192
```

等价于yml配置：

```yaml
dubbo:
  rpc:
    tri:
      header-table-size: 4096
      enable-push: false
      max-concurrent-streams: 2147483647
      initial-window-size: 1048576
      max-frame-size: 32768
      max-header-list-size: 8192
```



### 1.6 属性与XML配置映射规则

可以将 xml 的 tag 名和属性名组合起来，用 ‘.’ 分隔。每行一个属性。

* `dubbo.application.name=foo` 相当于 `<dubbo:application name="foo" />`
* `dubbo.registry.address=10.20.153.10:9090` 相当于 `<dubbo:registry address="10.20.153.10:9090" /> `

如果在 xml 配置中有超过一个的 tag，那么你可以使用 ‘id’ 进行区分。如果你不指定id，它将作用于所有 tag。

* `dubbo.protocols.rmi.port=1099` 相当于 `<dubbo:protocol id="rmi" name="rmi" port="1099" /> `
* `dubbo.registries.china.address=10.20.153.10:9090` 相当于 `<dubbo:registry id="china" address="10.20.153.10:9090" />`

### 1.7 配置项单复数对照表
复数配置的命名与普通单词变复数的规则相同：

1. 字母y结尾时，去掉y，改为ies
2. 字母s结尾时，加es
3. 其它加s

| Config Type                       | 单数配置                                                     | 复数配置                            |
| --------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| application                       | dubbo.application.xxx=xxx                                    | dubbo.applications.{id}.xxx=xxx <br/> dubbo.applications.{name}.xxx=xxx    |
| protocol                          | dubbo.protocol.xxx=xxx                                       | dubbo.protocols.{id}.xxx=xxx <br/> dubbo.protocols.{name}.xxx=xxx       |
| module                            | dubbo.module.xxx=xxx                                         | dubbo.modules.{id}.xxx=xxx <br/> dubbo.modules.{name}.xxx=xxx         |
| registry                          | dubbo.registry.xxx=xxx                                       | dubbo.registries.{id}.xxx=xxx       |
| monitor                           | dubbo.monitor.xxx=xxx                                        | dubbo.monitors.{id}.xxx=xxx         |
| config-center                     | dubbo.config-center.xxx=xxx                                  | dubbo.config-centers.{id}.xxx=xxx   |
| metadata-report                   | dubbo.metadata-report.xxx=xxx                                | dubbo.metadata-reports.{id}.xxx=xxx |
| ssl                               | dubbo.ssl.xxx=xxx                                            | dubbo.ssls.{id}.xxx=xxx             |
| metrics                           | dubbo.metrics.xxx=xxx                                        | dubbo.metricses.{id}.xxx=xxx        |
| provider                          | dubbo.provider.xxx=xxx                                       | dubbo.providers.{id}.xxx=xxx        |
| consumer                          | dubbo.consumer.xxx=xxx                                       | dubbo.consumers.{id}.xxx=xxx        |
| service                           | dubbo.service.{interfaceName}.xxx=xxx                        | 无                                  |
| reference                         | dubbo.reference.{interfaceName}.xxx=xxx                      | 无                                  |
| method                            | dubbo.service.{interfaceName}.{methodName}.xxx=xxx <br/> dubbo.reference.{interfaceName}.{methodName}.xxx=xxx | 无                                  |
| argument                          | dubbo.service.{interfaceName}.{methodName}.{arg-index}.xxx=xxx | 无                                  |


## 2 配置来源

Dubbo 默认支持 6 种配置来源：

- JVM System Properties，JVM -D 参数
- System environment，JVM进程的环境变量
- Externalized Configuration，[外部化配置](#33-外部化配置)，从配置中心读取
- Application Configuration，应用的属性配置，从Spring应用的Environment中提取"dubbo"打头的属性集
- API / XML /注解等编程接口采集的配置可以被理解成配置来源的一种，是直接面向用户编程的配置采集方式
- 从classpath读取配置文件 dubbo.properties

关于dubbo.properties属性：

1. 如果在 classpath 下有超过一个 dubbo.properties 文件，比如，两个 jar 包都各自包含了 dubbo.properties，dubbo 将随机选择一个加载，并且打印错误日志。
2. Dubbo 可以自动加载 classpath 根目录下的 dubbo.properties，但是你同样可以使用 JVM 参数来指定路径：`-Ddubbo.properties.file=xxx.properties`。

### 2.1 覆盖关系

如果通过多种配置来源指定了相同的配置项，则会出现配置项的互相覆盖，具体覆盖关系和优先级请参考下一小节。

## 3 配置加载流程

### 3.1 处理流程

Dubbo 配置加载大概分为两个阶段：

![配置加载流程](/imgs/v3/config/config-load.svg)

* 第一阶段为DubboBootstrap初始化之前，在Spring context启动时解析处理XML配置/注解配置/Java-config 或者是执行API配置代码，创建config bean并且加入到ConfigManager中。
* 第二阶段为DubboBootstrap初始化过程，从配置中心读取外部配置，依次处理实例级属性配置和应用级属性配置，最后刷新所有配置实例的属性，也就是[属性覆盖](../principle#32-属性覆盖)。

### 3.2 属性覆盖

发生属性覆盖可能有两种情况，并且二者可能是会同时发生的：
1. 不同配置源配置了相同的配置项
2. 相同配置源，但在不同层次指定了相同的配置项

#### 3.2.1 不同配置源

![覆盖关系](/imgs/blog/configuration.jpg)

#### 3.2.1 相同配置源

属性覆盖是指用配置的属性值覆盖config bean实例的属性，类似Spring [PropertyOverrideConfigurer](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/config/PropertyOverrideConfigurer.html) 的作用。

> Property resource configurer that overrides bean property values in an application context definition. It pushes values from a properties file into bean definitions.
Configuration lines are expected to be of the following form:
>
> beanName.property=value

但与`PropertyOverrideConfigurer`的不同之处是，Dubbo的属性覆盖有多个匹配格式，优先级从高到低依次是：

```properties
#1. 指定id的实例级配置
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}

#2. 指定name的实例级配置
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}

#3. 应用级配置（单数配置）
dubbo.{config-type}.{config-item}={config-item-value}
```

属性覆盖处理流程：

按照优先级从高到低依次查找，如果找到此前缀开头的属性，则选定使用这个前缀提取属性，忽略后面的配置。

![属性覆盖流程](/imgs/v3/config/properties-override.svg)

### 3.3 外部化配置

外部化配置目的之一是实现配置的集中式管理，这部分业界已经有很多成熟的专业配置系统如 Apollo, Nacos 等，Dubbo 所做的主要是保证能配合这些系统正常工作。

外部化配置和其他本地配置在内容和格式上并无区别，可以简单理解为 `dubbo.properties` 的外部化存储，配置中心更适合将一些公共配置如注册中心、元数据中心配置等抽取以便做集中管理。

```properties
# 将注册中心地址、元数据中心地址等配置集中管理，可以做到统一环境、减少开发侧感知。
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.simplified=true

dubbo.metadata-report.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=20880

dubbo.application.qos.port=33333
```

- 优先级
  外部化配置默认较本地配置有更高的优先级，因此这里配置的内容会覆盖本地配置值，关于各配置形式间的[覆盖关系](#21-覆盖关系) 有单独一章说明。

- 作用域
  外部化配置有全局和应用两个级别，全局配置是所有应用共享的，应用级配置是由每个应用自己维护且只对自身可见的。当前已支持的扩展实现有 Zookeeper、Apollo、Nacos。

#### 3.3.1 外部化配置使用方式

1. 增加 config-center 配置

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

2. 在相应的配置中心（zookeeper、Nacos 等）增加全局配置项，如下以 Nacos 为例：

![nacos-extenal-properties](/imgs/v3/config-center/nacos-extenal-properties.png)

开启外部化配置后，registry、metadata-report、protocol、qos 等全局范围的配置理论上都不再需要在应用中配置，应用开发侧专注业务服务配置，一些全局共享的全局配置转而由运维人员统一配置在远端配置中心。

这样能做到的效果就是，应用只需要关心：
* 服务暴露、订阅配置
* 配置中心地址
当部署到不同的环境时，其他配置就能自动的被从对应的配置中心读取到。

举例来说，每个应用中 Dubbo 相关的配置只有以下内容可能就足够了，其余的都托管给相应环境下的配置中心：

```yaml
dubbo
  application
    name: demo
  config-center
    address: nacos://127.0.0.1:8848
```

#### 3.3.2 自行加载外部化配置

所谓 Dubbo 对配置中心的支持，本质上就是把 `.properties` 从远程拉取到本地，然后和本地的配置做一次融合。理论上只要 Dubbo 框架能拿到需要的配置就可以正常的启动，它并不关心这些配置是自己加载到的还是应用直接塞给它的，所以Dubbo还提供了以下API，让用户将自己组织好的配置塞给 Dubbo 框架（配置加载的过程是用户要完成的），这样 Dubbo 框架就不再直接和 Apollo 或 Zookeeper 做读取配置交互。

```java
// 应用自行加载配置
Map<String, String> dubboConfigurations = new HashMap<>();
dubboConfigurations.put("dubbo.registry.address", "zookeeper://127.0.0.1:2181");
dubboConfigurations.put("dubbo.registry.simplified", "true");

//将组织好的配置塞给Dubbo框架
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setExternalConfig(dubboConfigurations);
```
