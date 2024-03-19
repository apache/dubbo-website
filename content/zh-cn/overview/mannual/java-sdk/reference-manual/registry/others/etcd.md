---
description: Etcd 注册中心的基本使用和工作原理。
linkTitle: Etcd
title: Etcd
type: docs
weight: 5
---



## 前置条件
* 了解 [Dubbo 基本开发步骤](/zh-cn/overview/mannual/java-sdk/quick-start/starter/)
* 安装并启动 Etcd 服务

## 使用说明

### 添加依赖

从 Dubbo3 开始，etcd 注册中心适配已经不再内嵌在 Dubbo 中，使用前需要单独引入独立的[模块](/zh-cn/download/spi-extensions/#dubbo-registry)。

```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-registry-etcd</artifactId>
    <version>3.3.0</version>
</dependency>
```

### 基本配置
```xml
<dubbo:registry address="etcd://10.20.153.10:6379" />
```

或

```xml
<dubbo:registry address="etcd://10.20.153.10:6379?backup=10.20.153.11:6379,10.20.153.12:6379" />
```

或

```xml
<dubbo:registry protocol="etcd" address="10.20.153.10:6379" />
```

或

```xml
<dubbo:registry protocol="etcd" address="10.20.153.10:6379,10.20.153.11:6379,10.20.153.12:6379" />
```