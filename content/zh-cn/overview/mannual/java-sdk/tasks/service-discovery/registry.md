---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description:
linkTitle: 选择合适的注册中心
title: 配置服务发现
type: docs
weight: 1
---
Dubbo 支持基于注册中心同步的自动实例地址发现机制，即 Dubbo 提供者注册实例地址到注册中心，Dubbo 消费者通过订阅注册中心变更事件自动获取最新实例变化，从而确保流量始终转发到正确的节点之上。Dubbo 目前支持 Nacos、Zookeeper、Kubernetes Service 等多种注册中心接入。

## 服务发现
以下是 Dubbo 服务发现接入的一些主流注册中心实现，更多扩展实现与工作原理请查看 [注册中心参考手册]()：

| 注册中心 | 配置值 | 服务发现模型 | 是否支持鉴权 | spring-boot-starter |
| --- | --- | --- | --- | --- |
| Nacos | nacos | 应用级、接口级 | 是 | dubbo-nacos-spring-boot-starter |
| Zookeeper | zookeeper | 应用级、接口级 | 是 | - dubbo-zookeeper-spring-boot-starter <br/> - dubbo-zookeeper-curator5-spring-boot-starter |
| Kubernetes Service | 参考下文使用文档 | 应用级 | 是 | 无 |

### Nacos 注册中心
以 Spring Boot 场景下的应用开发为例，增加以下配置使用基于 Nacos 注册中心的服务发现（Zookeeper 的使用方式类似）。

在项目中添加 macos-client 等相关依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
    <version>3.3.0-beta.1</version>
</dependency>
```

在 `application.yml` 文件增加 retistry 注册中心配置。

```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
```

之后启动 Dubbo 进程，provider 将自动注册服务和地址到 Nacos server，同时 consumer 自动订阅地址变化。

**Dubbo 支持配置到注册中心连接的鉴权，也支持指定命名空间、分组等以实现注册数据的隔离，此外，Dubbo 还支持设置如延迟注册、推空保护、只注册、只订阅等注册订阅行为。** 以下是一些简单的配置示例，请查看 [注册中心参考手册]() 了解更多配置详情。

```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
    group: group1 # use separated group in registry server.
    delay: 10000 # delay registering instance to registry server.
    parameters.namespace: xxx # set target namespace to operate in registry server.
    parameters.key: value # extended key value that will be used when building connection with registry.
```

{{% alert title="服务发现模型说明" color="warning" %}}
Dubbo3 在兼容 Dubbo2 `接口级服务发现`的同时，定义了新的`应用级服务发现`模型，关于它们的含义与工作原理请参考 [应用级服务发现]()。

Dubbo3 具备自动协商服务发现模型的能力，因此老版本 Dubbo2 用户可以无缝升级 Dubbo3。强烈建议新用户明确配置使用应用级服务发现。
```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
    register-mode: instance # 新用户请设置此值，表示启用应用级服务发现，可选值 interface、instance、all
```
新用户与老用户均建议参考 [应用级服务发现迁移指南]() 了解更多配置详情。
{{% /alert %}}

### Zookeeper 注册中心

### Kubernetes 注册中心
Dubbo 支持关于使用 <a target="_blank" href="">Kubernetes Service</a> 服务发现，由于其架构复杂性，我们有专门的文档展开说明，请参考 [Dubbo+Kubernetes 最佳实践]()。

半托管

全托管架构

在这里都描述一下，架构图给看看

### 基于多个注册中心的发现服务


关于工作原理与更多使用场景说明

### 服务发现问题排查
相比于 client 到 server 的 RPC 直连调用，开启服务发现后，常常会遇到各种个样奇怪的调用失败问题，以下是一些常见的问题与排查方法。

> 如果你的项目开启了服务发现，但在测试中想调用某个特定的 ip，可通过设置对端 ip 地址的 [直连模式]() 绕过服务发现机制进行调用。

1. 消费方地址找不到 (No Provider available)
2. 忘记配置注册中心，
3. 注册中心连不上
4. 消费方启动报错
