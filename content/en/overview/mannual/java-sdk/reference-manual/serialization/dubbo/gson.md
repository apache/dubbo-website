---
aliases:
    - /en/overview/what/ecosystem/serialization/gson/
    - /en/overview/what/ecosystem/serialization/gson/
description: "This article introduces Gson serialization"
linkTitle: Gson
title: Gson
type: docs
weight: 7
---



## 1 Introduction

Gson is an open-source Java library released by Google, primarily used for serializing Java objects to JSON strings or deserializing JSON strings into Java objects.

## 2 Usage

### 2.1 Add Dependency

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-gson</artifactId>
      <version>3.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.10.1</version>
    </dependency>
</dependencies>
```

### 2.2 Configuration Enable


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: gson
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=gson

# or
dubbo.consumer.serialization=gson

# or
dubbo.reference.com.demo.DemoService.serialization=gson
```
or
```xml
<dubbo:protocol serialization="gson" />

        <!-- or -->
<dubbo:consumer serialization="gson" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="gson" />
```


