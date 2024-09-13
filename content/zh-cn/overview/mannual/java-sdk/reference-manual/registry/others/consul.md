---
description: Consul 注册中心的基本使用和工作原理。
linkTitle: Consul
title: Consul
type: docs
weight: 5
---


## 前置条件
* 了解 [Dubbo 基本开发步骤](/zh-cn/overview/mannual/java-sdk/quick-start/starter/)
* 安装并启动 [Consul](http://consul.io) 服务

## 使用说明

### 添加依赖

从 Dubbo3 开始，consul 注册中国适配已经不再内嵌在 Dubbo 中，使用前需要单独引入独立的[模块](/zh-cn/download/spi-extensions/#dubbo-registry)。

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-registry-consul</artifactId>
    <version>3.3.0</version>
</dependency>
```

### 基本配置
```xml
<dubbo:registry address="redis://10.20.153.10:6379" />
```

或

```xml
<dubbo:registry address="redis://10.20.153.10:6379?backup=10.20.153.11:6379,10.20.153.12:6379" />
```

或

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379" />
```

或

```xml
<dubbo:registry protocol="redis" address="10.20.153.10:6379,10.20.153.11:6379,10.20.153.12:6379" />
```

## 使用场景

使用 Consul 作为共享注册中心实现，可用于 [Dubbo 与 Spring Cloud 体系的互通或迁移](/zh-cn/blog/2023/10/07/微服务最佳实践零改造实现-spring-cloud-apache-dubbo-互通/)
