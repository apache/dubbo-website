---
aliases:
    - /en/overview/tasks/protocols/grpc/
description: "Demonstrates how to implement mutual calls between Dubbo services and standard gRPC services using the triple protocol."
linkTitle: Publish/Call Standard gRPC Service
title: Develop gRPC Services with Dubbo
type: docs
weight: 5
---

This example demonstrates how to implement mutual calls between Dubbo services and standard gRPC services using the triple protocol. You can view the [complete source code of the example](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-grpc).

![triple-grpc.png](/imgs/v3/tasks/protocol/triple-grpc.png)

As described in the [Triple Protocol Specification](https://dubbo.apache.org/zh-cn/overview/reference/protocols/triple/), the triple protocol is 100% compatible with the gRPC protocol, while significantly improving usability (e.g., support for cURL, direct browser access, etc.). It can be said that triple is a more user-friendly design and implementation of gRPC.

## Run Example

First, you can download the example source code using the following command:
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

Navigate to the example source directory:
```shell
cd dubbo-samples/2-advanced/dubbo-samples-triple-grpc
```

Next, we will look at how to achieve mutual calls based on the triple protocol from two different directions: calling gRPC from Dubbo and calling Dubbo from gRPC.

### As a Standard gRPC Server
In this section, we will publish a Dubbo Triple Server and then start a standard gRPC consumer (this example uses the gRPC-Java client released by Google) to call the Triple service.

#### Start Dubbo Server
Make sure you are in the `dubbo-samples-triple-grpc` directory and run the following command:
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.server.TriOpServer"
```

#### Call Triple Service Using Standard gRPC Client
Open a new terminal and run the following command in the `dubbo-samples-triple-grpc` directory:
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.server.GrpcClient"
```

### As a Standard gRPC Client
In the following section, we will demonstrate how to access Google’s official gRPC service using the triple protocol (this example uses the gRPC-Java client released by Google).

#### Start Standard gRPC Server
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.client.GrpcServer"
```

#### Call Standard gRPC Service Using Dubbo Client
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.grpc.interop.client.TriOpClient"
```

## More Content

This example mainly demonstrates that triple is 100% compatible with the gRPC framework published by Google. As for the specific code and configuration related to triple, this example is completely consistent with the previously introduced [protobuf-based triple example](../idl/), so we will not repeat the source code and development steps.

This example demonstrates communication compatibility in unary mode, which is also applicable to streaming mode.

