---
aliases:
    - /en/overview/what/ecosystem/serialization/fastjson2/
    - /en/overview/what/ecosystem/serialization/fastjson2/
description: "This article introduces Fastjson2 serialization"
linkTitle: Fastjson2
title: Fastjson2
type: docs
weight: 3
---



## 1 Introduction

`FASTJSON v2` is an important upgrade of the `FASTJSON` project, aimed at providing a high-performance `JSON` library for the next decade. With the same `API`,

- Supports both `JSON/JSONB` protocols, with [`JSONPath`](https://alibaba.github.io/fastjson2/jsonpath_cn) as a first-class citizen.
- Supports full parsing and partial parsing.
- Supports `Java` server-side, client-side `Android`, and big data scenarios.
- Supports `Kotlin` [https://alibaba.github.io/fastjson2/kotlin_cn](https://alibaba.github.io/fastjson2/kotlin_cn)
- Supports `JSON Schema` [https://alibaba.github.io/fastjson2/json_schema_cn](https://alibaba.github.io/fastjson2/json_schema_cn)
- Supports `Android 8+`
- Supports `Graal Native-Image`
- Supports `JSON Schema` [https://alibaba.github.io/fastjson2/json_schema_cn](https://alibaba.github.io/fastjson2/json_schema_cn)

## 2 Usage

### 2.1 Add Dependency

```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
        <version>2.0.23</version>
    </dependency>
</dependencies>
```

Note: Fastjson2 serialization is only supported in Dubbo > 3.1.0. In Dubbo > 3.2.0, it will replace Hessian as the default serialization method.

### 2.2 Configure to Enable

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: fastjson2
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=fastjson2

# or
dubbo.consumer.serialization=fastjson2

# or
dubbo.reference.com.demo.DemoService.serialization=fastjson2
```
or
```xml
<dubbo:protocol serialization="fastjson2" />

<!-- or -->
<dubbo:consumer serialization="fastjson2" />

<!-- or -->
<dubbo:reference interface="xxx" serialization="fastjson2" />
```


