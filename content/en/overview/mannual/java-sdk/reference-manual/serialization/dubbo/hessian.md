---
aliases:
    - /en/overview/what/ecosystem/serialization/hessian/
    - /en/overview/what/ecosystem/serialization/hessian/
description: "This article introduces Hessian serialization"
linkTitle: Hessian
title: Hessian
type: docs
weight: 2
---



## 1 Introduction

Hessian serialization is a network protocol that supports dynamic typing, cross-language, and object-based transfer. The binary stream of Java object serialization can be used by other languages (such as C++, Python). Its features include:

1. Self-describing serialization types. It does not rely on external description files or interface definitions and uses one byte to represent common basic types, significantly shortening the binary stream.
2. Language-independent, supports scripting languages.
3. Simple protocol, more efficient than Java native serialization.
4. Compared to Hessian1, Hessian2 adds compressed encoding, the size of its serialized binary stream is 50% of Java serialization, serialization time is 30% of Java serialization, and deserialization time is 20% of Java serialization.

## 2 Usage

In the Dubbo framework, when using the Dubbo communication protocol, Hessian2 is used as the default serialization.

### 2.1 Configuration

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: hessian2
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=hessian2

# or
dubbo.consumer.serialization=hessian2

# or
dubbo.reference.com.demo.DemoService.serialization=hessian2
```
or
```xml
<dubbo:protocol serialization="hessian2" />

        <!-- or -->
<dubbo:consumer serialization="hessian2" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="hessian2" />
```


