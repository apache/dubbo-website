---
aliases:
    - /zh/overview/what/ecosystem/serialization/avro/
    - /zh-cn/overview/what/ecosystem/serialization/avro/
description: "本文介绍 Avro 序列化"
linkTitle: Avro
title: Avro
type: docs
weight: 5
---



## 1 介绍

Avro是一种远程过程调用和数据序列化框架，是在Apache的Hadoop项目之内开发的。它使用JSON来定义数据类型和通讯协议，使用压缩二进制格式来序列化数据。它主要用于Hadoop，它可以为持久化数据提供一种序列化格式，并为Hadoop节点间及从客户端程序到Hadoop服务的通讯提供一种电报格式。

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-avro</artifactId>
      <version>1.0.1</version>
    </dependency>
    <dependency>
        <groupId>org.apache.avro</groupId>
        <artifactId>avro</artifactId>
        <version>1.11.1</version>
    </dependency>
</dependencies>
```

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: avro
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=avro

# or
dubbo.consumer.serialization=avro

# or
dubbo.reference.com.demo.DemoService.serialization=avro
```
或
```xml
<dubbo:protocol serialization="avro" />

<!-- or -->
<dubbo:consumer serialization="avro" />

<!-- or -->
<dubbo:reference interface="xxx" serialization="avro" />
```
