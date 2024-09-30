---
aliases:
  - /en/overview/what/ecosystem/serialization/fastjson/
  - /en/overview/what/ecosystem/serialization/fastjson/
description: "This article introduces Fastjson serialization"
linkTitle: Fastjson
title: Fastjson
type: docs
weight: 4
---



## 1 Introduction

Fastjson is a Java library used to convert Java objects to their JSON representation. It can also be used to convert JSON strings to equivalent Java objects. Fastjson can handle any Java object, including pre-existing objects for which you do not have source code.

## 2 How to Use

### 2.1 Adding Dependencies

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-fastjson</artifactId>
      <version>3.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.83</version>
    </dependency>
</dependencies>
```

### 2.2 Configuration Enabling

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: fastjson
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=fastjson

# or
dubbo.consumer.serialization=fastjson

# or
dubbo.reference.com.demo.DemoService.serialization=fastjson
```
or
```xml
<dubbo:protocol serialization="fastjson" />

<!-- or -->
<dubbo:consumer serialization="fastjson" />

<!-- or -->
<dubbo:reference interface="xxx" serialization="fastjson" />
```

## 3 Supported RPC Protocols

