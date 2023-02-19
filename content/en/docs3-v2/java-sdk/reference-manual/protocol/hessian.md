---
type: docs
title: "Hessian Agreement"
linkTitle: "Hessian Protocol"
weight: 10
---


## Feature description
The Hessian protocol is used to integrate Hessian's services. The bottom layer of Hessian uses Http communication and Servlet to expose services. Dubbo's default embedded Jetty is implemented as a server.

[Hessian](http://hessian.caucho.com) is an open source RPC framework of Caucho, whose communication efficiency is higher than the serialization that comes with WebService and Java.

* Number of connections: multiple connections
* Connection method: short connection
* Transmission protocol: HTTP
* Transmission method: synchronous transmission
* Serialization: Hessian binary serialization
* Scope of application: The incoming and outgoing parameter data packets are large, the number of providers is larger than that of consumers, the pressure on providers is high, and files can be transferred.
* Applicable scenarios: page transfer, file transfer, or interoperability with native Hessian services.

Dubbo's Hessian protocol can interoperate with native Hessian services, namely:

* The provider uses Dubbo's Hessian protocol to expose the service, and the consumer directly uses the standard Hessian interface to call,
* Or the provider uses the standard Hessian to expose the service, and the consumer uses Dubbo's Hessian protocol to call.

#### Constraints
* Parameters and return values need to implement `Serializable` interface.
* Parameters and return values cannot be customized to implement `List`, `Map`, `Number`, `Date`, `Calendar` and other interfaces, only the implementations that come with JDK can be used, because hessian will do special processing and customize the implementation All attribute values in the class are lost.

## scenes to be used
Hessian is a lightweight RPC service implemented based on the Binary-RPC protocol, serializing and deserializing instances.


## How to use

### Dependencies

Starting from Dubbo 3, the Hessian protocol is no longer embedded in Dubbo, and an independent [module](/zh-cn/download/spi-extensions/#dubbo-rpc) needs to be introduced separately.
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-hessian</artifactId>
    <version>1.0.0</version>
</dependency>
```

```xml
<dependency>
    <groupId>com.caucho</groupId>
    <artifactId>hessian</artifactId>
    <version>4.0.7</version>
</dependency>
```

### Define the hessian protocol
```xml
<dubbo:protocol name="hessian" port="8080" server="jetty" />
```

### Set the default protocol
```xml
<dubbo:provider protocol="hessian" />
```

### Set service protocol
```xml
<dubbo:service protocol="hessian" />
```

### Multiport
```xml
<dubbo:protocol id="hessian1" name="hessian" port="8080" />
<dubbo:protocol id="hessian2" name="hessian" port="8081" />
```

### direct connection
```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="hessian://10.20.153.10:8080/helloWorld" />
```
