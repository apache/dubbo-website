---
aliases:
    - /en/overview/what/ecosystem/serialization/avro/
    - /en/overview/what/ecosystem/serialization/avro/
description: "This article introduces Avro serialization"
linkTitle: Avro
title: Avro
type: docs
weight: 5
---



## 1 Introduction

Avro is a remote procedure call and data serialization framework developed within the Apache Hadoop project. It uses JSON to define data types and communication protocols, and a compact binary format to serialize data. It is primarily used with Hadoop, providing a serialization format for persistent data and serving as a protocol for communication between Hadoop nodes and from client programs to Hadoop services.


## 2 Usage

### 2.1 Add Dependency

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-avro</artifactId>
      <version>3.3.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.avro</groupId>
        <artifactId>avro</artifactId>
        <version>1.11.1</version>
    </dependency>
</dependencies>
```

### 2.2 Configuration Enable


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: avro
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=avro

# or
dubbo.consumer.serialization=avro

# or
dubbo.reference.com.demo.DemoService.serialization=avro
```
or
```xml
<dubbo:protocol serialization="avro" />

<!-- or -->
<dubbo:consumer serialization="avro" />

<!-- or -->
<dubbo:reference interface="xxx" serialization="avro" />
```
