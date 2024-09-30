---
description: "dubbo-java and dubbo-go use the same service discovery model. This document demonstrates how to achieve address interoperability based on application-level service discovery."
title: Achieving Address Interoperability Based on Application-Level Service Discovery
linkTitle: Service Discovery Achieves Address Interoperability
type: docs
weight: 6
---

In the previous two examples, we demonstrated the interoperability capabilities of dubbo java and dubbo go at the protocol level, covering both the triple and dubbo protocols.
* [Non-protobuf mode protocol interoperability (triple and dubbo protocols)](../call_java_protocol_dubbo_non_protobuf)
* [protobuf+triple protocol interoperability (triple protocol)](../call_java_protocol_triple_protobuf)

In this document, we will demonstrate the service discovery interoperability between dubbo java and dubbo go. With the combination of protocol compatibility, we can achieve full interoperability between the dubbo java and dubbo go microservice systems.

This document uses the Nacos registry as a demonstration. You can view the [complete example source code](https://github.com/apache/dubbo-go-samples/tree/main/java_interop/service_discovery) here.

> Before running the code, you should follow this instruction to install and start the Nacos server.

## Application-Level Service Discovery

```shell
cd service
```
**Start Java Server**
```shell
cd java-server
sh run.sh
```

**Start Go Client**
```shell
cd go-client
go run client.go

```

#### Go Server <-> Java Client
**Start Go Server**
```shell
cd go-server
go run server.go
```
**Start Java Client**
```shell
cd java-client
sh run.sh
```

## Interface-Level Service Discovery (for dubbo2 users only)
### How to Run
#### Java Server <-> Go Client
```shell
cd interface
```
**Start Java Server**
```shell
cd java-server
sh run.sh
```

**Start Go Client**
```shell
cd go-client
go run client.go

```

#### Go Server <-> Java Client
**Start Go Server**
```shell
cd go-server
go run server.go
```
**Start Java Client**
```shell
cd java-client
sh run.sh
```

