---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/hessian/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/hessian/
    - /en/overview/mannual/java-sdk/reference-manual/protocol/hessian/
description: Hessian Protocol
linkTitle: Hessian Protocol
title: Hessian Protocol
type: docs
weight: 10
---




## Feature Description
The Hessian protocol is used for integrating services that utilize Hessian. It is based on HTTP communication and uses Servlet to expose services, with Dubbo embedding Jetty as the server implementation by default.

[Hessian](http://hessian.caucho.com) is an open-source RPC framework from Caucho, whose communication efficiency is higher than that of WebService and Java's built-in serialization.

* Number of connections: multiple connections
* Connection method: short connection
* Transport protocol: HTTP
* Transport method: synchronous transmission
* Serialization: Hessian binary serialization
* Applicable scope: larger incoming and outgoing parameter data packets, more providers than consumers, higher pressure on providers, allows file transfer.
* Applicable scenarios: page transfer, file transfer, or interoperability with native Hessian services.

Dubbo's Hessian protocol can interoperate with native Hessian services, which means:

* Providers expose services using Dubbo's Hessian protocol, and consumers can directly call it using the standard Hessian interface,
* or providers can expose services using standard Hessian while consumers call it using Dubbo's Hessian protocol.

#### Constraints
* Parameters and return values must implement the `Serializable` interface.
* Parameters and return values cannot implement interfaces like `List`, `Map`, `Number`, `Date`, `Calendar`, etc., via custom implementations; only JDK's built-in implementations can be used, as Hessian applies special processing that causes property values in custom classes to be lost.

## Usage Scenarios
Hessian is a lightweight RPC service implemented based on Binary-RPC protocol, demonstrating serialization and deserialization instances.


## Usage

### Dependencies

As of Dubbo 3, the Hessian protocol is no longer embedded in Dubbo and needs to be separately introduced as an independent [module](/en/download/spi-extensions/#dubbo-rpc).
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-hessian</artifactId>
    <version>3.3.0</version>
</dependency>
```

```xml
<dependency>
    <groupId>com.caucho</groupId>
    <artifactId>hessian</artifactId>
    <version>4.0.7</version>
</dependency>
```

### Define Hessian Protocol
```xml
<dubbo:protocol name="hessian" port="8080" server="jetty" />
```

### Set Default Protocol
```xml
<dubbo:provider protocol="hessian" />
```

### Set Service Protocol
```xml
<dubbo:service protocol="hessian" />
```

### Multiple Ports
```xml
<dubbo:protocol id="hessian1" name="hessian" port="8080" />
<dubbo:protocol id="hessian2" name="hessian" port="8081" />
```

### Direct Connection
```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="hessian://10.20.153.10:8080/helloWorld" />
```
