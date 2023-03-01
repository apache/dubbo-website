---
aliases:
    - /zh/docs/references/configuration/properties/
description: 以属性配置的方式来配置你的 Dubbo 应用
linkTitle: 属性配置
title: 属性配置
type: docs
weight: 50
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/)。
{{% /pageinfo %}}

Dubbo属性配置有两个职责：

1. 定义配置：根据属性创建配置组件实例，类似SpringBoot的`@ConfigurationProperties`的作用。
2. 属性覆盖：覆盖已存在的配置组件实例的属性值，类似Spring `PropertyOverrideConfigurer` 的作用。


> 一个属性配置的例子 [dubbo-spring-boot-samples](https://github.com/apache/dubbo-spring-boot-project/tree/master/dubbo-spring-boot-samples)

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

## 配置来源

从Dubbo支持的配置来源说起，默认有6种配置来源：

- JVM System Properties，JVM -D 参数
- System environment，JVM进程的环境变量
- Externalized Configuration，外部化配置，从配置中心读取
- Application Configuration，应用的属性配置，从Spring应用的Environment中提取"dubbo"打头的属性集
- API / XML /注解等编程接口采集的配置可以被理解成配置来源的一种，是直接面向用户编程的配置采集方式
- 从classpath读取配置文件 dubbo.properties

关于dubbo.properties属性：

1. 如果在 classpath 下有超过一个 dubbo.properties 文件，比如，两个 jar 包都各自包含了 dubbo.properties，dubbo 将随机选择一个加载，并且打印错误日志。
2. Dubbo 可以自动加载 classpath 根目录下的 dubbo.properties，但是你同样可以使用 JVM 参数来指定路径：`-Ddubbo.properties.file=xxx.properties`。

### 覆盖关系

下图展示了配置覆盖关系的优先级，从上到下优先级依次降低：

![覆盖关系](/imgs/blog/configuration.jpg)

请参考相关内容：[属性覆盖](../properties#属性覆盖)。

## 处理流程

属性配置处理流程请查看 [配置加载流程](../overview#配置加载流程)。


## 配置格式

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

### 应用级配置（无id）

应用级配置的格式为：配置类型单数前缀，无id/name。
```properties
# 应用级配置（无id）
dubbo.{config-type}.{config-item}={config-item-value}
```

* 如果该类型的配置不存在任何实例时，则将使用应用级配置的属性创建默认实例。
* 如果该类型的配置存在一个或多个实例，且没有找到配置实例对应的配置时，则将应用级配置的属性用于属性覆盖。详细请参考[属性覆盖](../properties#属性覆盖)。

```properties
dubbo.application.name=demo-provider
dubbo.application.qos-enable=false

dubbo.registry.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=-1
```

### 实例级配置（指定id或name）

针对某个实例的属性配置需要指定id或者name，其前缀格式为：配置类型复数前缀 + id/name。

```properties
# 实例级配置（指定id或name）
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
dubbo.{config-type}s.{config-name}.{config-item}={config-item-value}

```

* 如果不存在该id或者name的实例，则根据属性创建配置组件实例。
* 如果已存在相同id或name的实例，则提取该前缀的属性集合用于属性覆盖。详细请参考[属性覆盖](../properties#属性覆盖)。
* 具体的配置复数形式请参考[单复数配置对照表](../properties#单复数配置对照表)

```properties
dubbo.registries.unit1.address=zookeeper://127.0.0.1:2181
dubbo.registries.unit2.address=zookeeper://127.0.0.1:2182

dubbo.protocols.dubbo.name=dubbo
dubbo.protocols.dubbo.port=20880

dubbo.protocols.hessian.name=hessian
dubbo.protocols.hessian.port=8089
```

### 服务接口配置

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

### 参数配置

parameters参数为map对象，支持xxx.parameters=[{key:value},{key:value}]方式进行配置。
```properties
dubbo.application.parameters=[{item1:value1},{item2:value2}]
dubbo.reference.org.apache.dubbo.samples.api.DemoService.parameters=[{item3:value3}]
```

### 传输层配置

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



### 属性与XML配置映射规则

可以将 xml 的 tag 名和属性名组合起来，用 ‘.’ 分隔。每行一个属性。

* `dubbo.application.name=foo` 相当于 `<dubbo:application name="foo" />`
* `dubbo.registry.address=10.20.153.10:9090` 相当于 `<dubbo:registry address="10.20.153.10:9090" /> `

如果在 xml 配置中有超过一个的 tag，那么你可以使用 ‘id’ 进行区分。如果你不指定id，它将作用于所有 tag。

* `dubbo.protocols.rmi.port=1099` 相当于 `<dubbo:protocol id="rmi" name="rmi" port="1099" /> `
* `dubbo.registries.china.address=10.20.153.10:9090` 相当于 `<dubbo:registry id="china" address="10.20.153.10:9090" />`


## 属性覆盖

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


## 单复数配置对照表

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
