---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/multi-protocols/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/multi-protocols/
    - /zh-cn/overview/tasks/protocols/multi-protocols/
description: 在 Dubbo 中配置多协议
linkTitle: 多协议
title: 多协议
type: docs
weight: 4
---

区别于普通的 RPC 框架，Dubbo 作为一款微服务框架提供了非常灵活的协议支持，它不绑定一个单一通信协议。因此你**可以发布在一个进程中同时发布多个 RPC 协议、调用不同的 RPC 协议**。接下来我们就详细介绍多协议的具体使用场景与使用方式。

## 使用场景
有很多场景可能会用到不同的协议，包括安全性、性能、与第三方系统互调等业务诉求。本文我们不分析具体的业务需求，而是从 Dubbo 框架提供的多协议能力出发分析框架能提供的多协议能力：

* 作为服务提供者（provider），同一个服务发布为多个协议，供不同消费端调用
* 作为服务提供者（provider），多个服务分别发布为不同协议，供不同消费端调用
* 作为服务消费者（consumer），指定以某个特定协议调用某一个服务

## 使用方式

### 同一个服务发布为多个协议

如果使用 Spring Boot，可以修改 application.yml 或 application.properties 如下：
```yaml
dubbo:
  protocols:
    - id: dubbo-id
      name: dubbo
      port: 20880
    - id: tri-id
      name: tri
      port: 50051
```

对于 Spring XML：

```xml
<dubbo:protocol id="dubbo-id" name="dubbo" port="20880"/>
<dubbo:protocol id="triple-id" name="tri" port="50051"/>
```

接下来为服务配置（默认不配置的情况下，服务会发布到以上所有协议配置）：

```java
@DubboService(protocol="dubbo-id,triple-id")
private DemoServiceImpl implements DemoService {}
```

### 多个服务分别发布为不同协议

如果使用 Spring Boot，可以修改 application.yml 或 application.properties 如下：
```yaml
dubbo:
  protocols:
    - id: dubbo-id
      name: dubbo
      port: 20880
    - id: tri-id
      name: tri
      port: 50051
```

接下来为不同的服务分别配置不同的协议引用：

```java
@DubboService(protocol="dubbo-id")
private DemoServiceImpl implements DemoService {}
```

```java
@DubboService(protocol="triple-id")
private GreetingServiceImpl implements GreetingService {}
```

### 指定协议调用服务

对于消费端而言，直接在声明引用的时候指定要调用的协议关键字就可以了：

```java
@DubboReference(protocol="dubbo")
private DemoService demoService;
```

```java
@DubboReference(protocol="tri")
private GreetingService greetingService;
```

## 不同的实现方式

### 多端口多协议
多协议发布是指为同一个服务同时提供多种协议访问方式，多协议可以是任意两个或多个协议的组合，比如下面的配置将同时发布了 dubbo、triple 协议：

```yaml
dubbo:
 protocols:
   - name: tri
     port: 50051
   - name: dubbo
	 port: 20880
```

基于以上配置，如果应用中有服务 DemoService，则既可以通过 dubbo 协议访问 DemoService，也可以通过 triple 协议访问 DemoService，其工作原理图如下：

<img alt="多协议" style="max-width:800px;height:auto;" src="/imgs/v3/tasks/protocol/multiple-protocols.png"/>

1. 提供者实例同时监听两个端口 20880 和 50051
2. 同一个实例，会在注册中心注册两条地址 url
3. 不同的消费端可以选择以不同协议调用同一个提供者发布的服务

对于消费端而言，如果用户没有明确配置，默认情况下框架会自动选择 `dubbo` 协议调用。Dubbo 框架支持配置通过哪个协议访问服务，如 `@DubboReference(protocol="tri")`，或者在 application.yml 配置文件中指定全局默认值：

```yaml
dubbo:
 consumer:
   protocol: tri
```

### 单端口多协议

除了以上发布多个端口、注册多条 url 到注册中心的方式。对于 dubbo、triple 这两个内置协议，框架提供了在单个端口上同时发布 dubbo 和 triple 协议的能力。这对于老用户来说是一个非常重要的能力，因为它可以做到不增加任何负担的情况下，让使用 dubbo 协议的用户可以额外发布 triple 协议，这样当所有的应用都实现多协议发布之后，我们就可以设置消费端去通过 triple 协议发起调用了。

<img alt="单端口多协议" style="max-width:800px;height:auto;" src="/imgs/v3/tasks/protocol/multiple-protocols-on-same-port.png"/>

单端口多协议的基本配置如下：

 ```yaml
 dubbo:
  protocol:
    name: dubbo
    ext-protocol: tri
 ```