---
aliases:
    - /en/overview/what/ecosystem/serialization/fastjson/
    - /en/overview/what/ecosystem/serialization/fastjson/
description: "This article introduces the underlying serialization mechanism implementation when developing triple services based on the Java interface model."
linkTitle: Protobuf Wrapper
title: Implementation of the underlying serialization mechanism when developing triple services based on the Java interface model
type: docs
weight: 2
---

## 1 Introduction

The triple protocol implemented by Dubbo offers better usability (not binding Protobuf), allowing developers to directly define services using Java interfaces. For users expecting a smooth upgrade, with no multilingual services, or unfamiliar with Protobuf, the Java interface approach is the simplest way to use triple.

The following details the underlying serialization specifics in this protocol model: the framework will wrap the request and response using a built-in protobuf object, **which means the object will be serialized twice. The first serialization is done using the method specified by `serialization=hessian`, and the second is to wrap the byte[] serialized in the first step with the protobuf wrapper before transmission**.

## 2 Usage

**When using [Java interface method development for triple communication services](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/), the dubbo server will automatically enable support for protobuf and protobuf-json serialization modes.**

### 2.1 Add Dependencies

To use the triple protocol, you must first add the following dependencies:

```xml
<dependencies>
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java</artifactId>
		<version>3.19.6</version>
	</dependency>
	<!-- Providing support for protobuf-json formatted requests -->
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java-util</artifactId>
		<version>3.19.6</version>
	</dependency>
</dependencies>
```

### 2.2 Configuration Enablement

As long as you use [the Java interface method for the triple protocol](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/), protobuf wrapper serialization will be used, simply define the Java interface and enable the triple protocol:

Define Dubbo service via Java interface:
```java
public interface GreetingsService {
    String sayHi(String name);
}
```

Configure to use the triple protocol (if you need to set the underlying serialization protocol, continue setting serialization, such as hessian, msgpack, etc.):

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   name: tri
   serialization: hessian
```
or
```properties
# dubbo.properties
dubbo.protocol.name=tri
dubbo.protocol.serialization=hessian
```

or
```xml
<dubbo:protocol name="tri" serialization="hessian"/>
```

