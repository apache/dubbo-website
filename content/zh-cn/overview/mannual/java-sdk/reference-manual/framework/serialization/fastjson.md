---
aliases:
    - /zh/overview/what/ecosystem/serialization/fastjson/
    - /zh-cn/overview/what/ecosystem/serialization/fastjson/
description: "本文介绍 Fastjson 序列化"
linkTitle: Fastjson
title: Fastjson
type: docs
weight: 4
---



## 1 介绍

Fastjson 是一个 Java 库，可用于将 Java 对象转换为其 JSON 表示形式。它还可用于将 JSON 字符串转换为等效的 Java 对象。 Fastjson 可以处理任意 Java 对象，包括您没有源代码的预先存在的对象。

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-fastjson</artifactId>
      <version>1.0.1</version>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.83</version>
    </dependency>
</dependencies>
```

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: fastjson
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=fastjson

# or
dubbo.consumer.serialization=fastjson

# or
dubbo.reference.com.demo.DemoService.serialization=fastjson
```
或
```xml
<dubbo:protocol serialization="fastjson" />

<!-- or -->
<dubbo:consumer serialization="fastjson" />

<!-- or -->
<dubbo:reference interface="xxx" serialization="fastjson" />
```
