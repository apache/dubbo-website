---
aliases:
    - /zh/overview/what/ecosystem/serialization/fst/
    - /zh-cn/overview/what/ecosystem/serialization/fst/
description: "本文介绍 FST 序列化"
linkTitle: FST
title: FST
type: docs
weight: 6
---




## 1 介绍

FST序列化全称是Fast Serialization，它是对Java序列化的替换实现。既然前文中提到Java序列化的两点严重不足，在FST中得到了较大的改善，FST的特征如下：

1. 比JDK提供的序列化提升了10倍，体积也减少 3-4 倍多
2. 支持堆外Maps，和堆外Maps的持久化
3. 支持序列化为JSON

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-fst</artifactId>
      <version>1.0.1</version>
    </dependency>
    <dependency>
        <groupId>de.ruedigermoeller</groupId>
        <artifactId>fst</artifactId>
        <version>3.0.3</version>
    </dependency>
</dependencies>
```

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: fst
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=fst

# or
dubbo.consumer.serialization=fst

# or
dubbo.reference.com.demo.DemoService.serialization=fst
```
或
```xml
<dubbo:protocol serialization="fst" />

        <!-- or -->
<dubbo:consumer serialization="fst" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="fst" />
```
