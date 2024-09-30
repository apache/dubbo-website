---
aliases:
    - /en/overview/what/ecosystem/serialization/msgpack/
    - /en/overview/what/ecosystem/serialization/msgpack/
description: "This article introduces MessagePack serialization"
linkTitle: MessagePack
title: MessagePack
type: docs
weight: 9
---



## 1 Introduction

MessagePack is a computer data interchange format. It is a binary format used to represent simple data structures such as arrays and associative arrays. MessagePack is designed to be as compact and simple as possible.

## 2 How to Use

### 2.1 Adding Dependencies

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-msgpack</artifactId>
      <version>3.3.0</version>
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

### 2.2 Configuration Enable

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: msgpack
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=msgpack

# or
dubbo.consumer.serialization=msgpack

# or
dubbo.reference.com.demo.DemoService.serialization=msgpack
```
or
```xml
<dubbo:protocol serialization="msgpack" />

        <!-- or -->
<dubbo:consumer serialization="msgpack" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="msgpack" />
```
