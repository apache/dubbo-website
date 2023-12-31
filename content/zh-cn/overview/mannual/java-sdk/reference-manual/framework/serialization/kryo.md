---
aliases:
    - /zh/overview/what/ecosystem/serialization/kryo/
    - /zh-cn/overview/what/ecosystem/serialization/kryo/
description: "本文介绍 Kryo 序列化"
linkTitle: Kryo
title: Kryo
type: docs
weight: 8
---




## 1 介绍

Kryo是一种非常成熟的序列化实现，已经在Twitter、Groupon、Yahoo以及多个著名开源项目（如Hive、Storm）中广泛的使用。

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-kryo</artifactId>
      <version>1.0.1</version>
    </dependency>
    <dependency>
        <groupId>com.esotericsoftware</groupId>
        <artifactId>kryo</artifactId>
        <version>5.4.0</version>
    </dependency>
    <dependency>
        <groupId>de.javakaffee</groupId>
        <artifactId>kryo-serializers</artifactId>
        <version>0.45</version>
    </dependency>
</dependencies>
```

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: kryo
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=kryo

# or
dubbo.consumer.serialization=kryo

# or
dubbo.reference.com.demo.DemoService.serialization=kryo
```
或
```xml
<dubbo:protocol serialization="kryo" />

        <!-- or -->
<dubbo:consumer serialization="kryo" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="kryo" />
```
