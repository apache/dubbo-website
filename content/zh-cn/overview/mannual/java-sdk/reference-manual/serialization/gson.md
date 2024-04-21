---
aliases:
    - /zh/overview/what/ecosystem/serialization/gson/
    - /zh-cn/overview/what/ecosystem/serialization/gson/
description: "本文介绍 Gson 序列化"
linkTitle: Gson
title: Gson
type: docs
weight: 7
---



## 1 介绍

Gson是Google公司发布的一个开放源代码的Java库，主要用途为序列化Java对象为JSON字符串，或反序列化JSON字符串成Java对象。

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-gson</artifactId>
      <version>1.0.1</version>
    </dependency>
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.10.1</version>
    </dependency>
</dependencies>
```

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: gson
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=gson

# or
dubbo.consumer.serialization=gson

# or
dubbo.reference.com.demo.DemoService.serialization=gson
```
或
```xml
<dubbo:protocol serialization="gson" />

        <!-- or -->
<dubbo:consumer serialization="gson" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="gson" />
```
