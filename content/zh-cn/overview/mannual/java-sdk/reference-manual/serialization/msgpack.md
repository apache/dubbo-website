---
aliases:
    - /zh/overview/what/ecosystem/serialization/msgpack/
    - /zh-cn/overview/what/ecosystem/serialization/msgpack/
description: "本文介绍 MessagePack 序列化"
linkTitle: MessagePack
title: MessagePack
type: docs
weight: 9
---



## 1 介绍

MessagePack是一种计算机数据交换格式。它是一种二进制形式，用于表示简单的数据结构，如数组和关联数组。MessagePack 旨在尽可能紧凑和简单。

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-msgpack</artifactId>
      <version>1.0.1</version>
    </dependency>
    <dependency>
        <groupId>org.msgpack</groupId>
        <artifactId>msgpack-core</artifactId>
        <version>0.9.3</version>
    </dependency>

    <dependency>
        <groupId>org.msgpack</groupId>
        <artifactId>jackson-dataformat-msgpack</artifactId>
        <version>0.9.3</version>
    </dependency>
</dependencies>
```

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: msgpack
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=msgpack

# or
dubbo.consumer.serialization=msgpack

# or
dubbo.reference.com.demo.DemoService.serialization=msgpack
```
或
```xml
<dubbo:protocol serialization="msgpack" />

        <!-- or -->
<dubbo:consumer serialization="msgpack" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="msgpack" />
```
