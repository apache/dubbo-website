---
aliases:
    - /zh/overview/what/ecosystem/serialization/fastjson2/
    - /zh-cn/overview/what/ecosystem/serialization/fastjson2/
description: "本文介绍 Fastjson2 序列化"
linkTitle: Fastjson2
title: Fastjson2
type: docs
weight: 2
---



## 1 介绍

`FASTJSON v2`是`FASTJSON`项目的重要升级，目标是为下一个十年提供一个高性能的`JSON`库。通过同一套`API`，

- 支持`JSON/JSONB`两种协议，[`JSONPath`](https://alibaba.github.io/fastjson2/jsonpath_cn) 是一等公民。
- 支持全量解析和部分解析。
- 支持`Java`服务端、客户端`Android`、大数据场景。
- 支持`Kotlin` [https://alibaba.github.io/fastjson2/kotlin_cn](https://alibaba.github.io/fastjson2/kotlin_cn)
- 支持`JSON Schema` [https://alibaba.github.io/fastjson2/json_schema_cn](https://alibaba.github.io/fastjson2/json_schema_cn)
- 支持`Android 8+`
- 支持`Graal Native-Image`
- 支持 `JSON Schema` [https://alibaba.github.io/fastjson2/json_schema_cn](https://alibaba.github.io/fastjson2/json_schema_cn)

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
        <version>2.0.23</version>
    </dependency>
</dependencies>
```

注：Fastjson2 序列化仅 Dubbo > 3.1.0 版本支持。在 Dubbo > 3.2.0 中将替代 Hessian 作为默认序列化方式。

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: fastjson2
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=fastjson2

# or
dubbo.consumer.serialization=fastjson2

# or
dubbo.reference.com.demo.DemoService.serialization=fastjson2
```
或
```xml
<dubbo:protocol serialization="fastjson2" />

<!-- or -->
<dubbo:consumer serialization="fastjson2" />

<!-- or -->
<dubbo:reference interface="xxx" serialization="fastjson2" />
```
