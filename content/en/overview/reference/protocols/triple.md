---
description: "Advantages and Goals of the Triple Protocol: The Triple protocol is an HTTP-based RPC communication protocol specification designed for Dubbo3, which is fully compatible with the gRPC protocol and can run simultaneously over HTTP/1 and HTTP/2."
linkTitle: Advantages and Goals of the Triple Protocol
title: Advantages and Goals of the Triple Protocol
type: docs
weight: 1
working_in_progress: true
---

## Introduction
The Triple protocol is an HTTP-based RPC communication protocol specification designed for Dubbo3, fully compatible with the gRPC protocol, supporting communication models like Request-Response and Streaming, and can run on both HTTP/1 and HTTP/2.

The Dubbo framework provides various language implementations of the Triple protocol, helping you build browser- and gRPC-compatible HTTP API interfaces: you only need to define a standard Protocol Buffer format service and implement business logic. Dubbo takes care of generating language-related Server Stub, Client Stub, and seamlessly integrates the entire invocation process with routing, service discovery, and other Dubbo systems. The Triple protocol implementations in languages like Go and Java natively support HTTP/1 transport layer communication. Compared to the official gRPC implementation, Dubbo's protocol implementation is simpler and more stable, making it easier for you to develop and manage microservice applications.

For certain language versions, the Dubbo framework also provides programming modes that are more aligned with language features, such as service definition and development modes that do not bind to IDL. For example, in Dubbo Java, you can choose to define Dubbo services using Java Interfaces and Pojo classes and publish them as microservices based on Triple protocol communication.

## Protocol Specification
With the Triple protocol, you can achieve the following goals:

### When Dubbo is Used as a Client
The Dubbo Client can access Triple protocol services published by the Dubbo server and standard gRPC servers.
* Call standard gRPC servers and send requests with Content-type as standard gRPC types: application/grpc, application/grpc+proto, and application/grpc+json.
* Call Dubbo servers and send requests with Content-type as Triple types: application/json, application/proto, application/triple+wrapper.

### When Dubbo is Used as a Server
The Dubbo Server by default publishes support for both Triple and gRPC protocols simultaneously, and the Triple protocol can work over HTTP/1 and HTTP/2. Therefore, Dubbo Server can handle Triple protocol requests from Dubbo clients, standard gRPC protocol requests, as well as HTTP requests sent by cURL and browsers. The distinction based on Content-type is:
* Handling requests sent by gRPC clients with Content-type as standard gRPC types: application/grpc, application/grpc+proto, application/grpc+json.
* Handling requests sent by Dubbo clients with Content-type as Triple types: application/json, application/proto, application/grpc+wrapper.
* Handling requests sent by cURL, browsers, etc., with Content-type as Triple types: application/json, application/proto, application/grpc+wrapper.

For details, refer to the detailed [Triple Specification](../triple-spec).

## Relationship with the gRPC Protocol
As mentioned above, Triple is fully compatible with the gRPC protocol. Given that gRPC has already provided multi-language framework implementations, why does Dubbo need to reimplement it through Triple? The core goals primarily include two points:

* First, in protocol design, Dubbo refers to both gRPC and gRPC-Web to design the custom Triple protocol: Triple is an RPC protocol based on HTTP transport layer that is fully compatible with gRPC while running on HTTP/1 and HTTP/2.
* Second, the Dubbo framework follows a design philosophy that aligns with its framework positioning during the implementation for each language, making the Dubbo protocol implementation simpler and purer compared to frameworks like grpc-java and grpc-go, attempting to avoid a series of issues present in the official gRPC library.

gRPC itself as an RPC protocol specification is excellent, but we found that the native gRPC library implementation has several issues in practical use, including complexity, IDL binding, and debugging difficulties. Dubbo, starting from practical implementation, effectively avoids these problems:

* The native gRPC implementation is limited by HTTP/2 interaction standards, making it unable to provide interaction methods for browsers and HTTP APIs, requiring additional proxy components like grpc-web and grpc-gateway for functionality. In Dubbo, you can directly access Dubbo HTTP/2 services using cURL and browsers.
* The official gRPC library enforces Proto Buffer binding, with the only development choice being to define and manage services using IDL, which is a significant burden for users with limited multi-language demands. Dubbo, while supporting IDL, also offers language-specific service definitions and development methods for Java, Go, etc.
* During the development phase, services published with the gRPC protocol are challenging to debug, requiring the use of gRPC-specific tools, many of which are rudimentary and immature. With Dubbo3, you can debug your services using cURL | jq or Chrome Developer Tools directly, simply passing in JSON structures to invoke services.
* The gRPC protocol library has over 100,000 lines of code, while the Dubbo (Go, Java, Rust, Node.js, etc.) protocol implementation only has a few thousand lines of code, simplifying code maintenance and troubleshooting.
* The gRPC implementation library provided by Google does not use mainstream third-party or language-official protocol libraries but chooses to maintain its own implementation, complicating maintenance and ecosystem expansion. For instance, grpc-go maintains its own HTTP/2 library instead of using Go's official library. Dubbo, while using official libraries, maintains a performance level comparable to gRPC's self-maintained HTTP protocol library.
* The gRPC library only provides RPC protocol implementations and requires additional work to introduce service governance capabilities, whereas Dubbo is a microservices development framework that is not bound to protocols, with built-in HTTP/2 protocol implementations that integrate better with Dubbo's service governance capabilities.

### Simple Implementation
The Dubbo framework focuses on the Triple protocol itself while relying on well-tested network libraries for underlying network communication, HTTP/2 protocol parsing, etc. For example, Dubbo Java is built on Netty, while Dubbo Go directly uses Go's official HTTP library.

The Triple protocol implementation provided by Dubbo is very simple, corresponding to the Protocol component implementation in Dubbo, and you can grasp Dubbo protocol code implementation in just one afternoon.

### Large-Scale Production Environment Verification
Since the release of Dubbo3, the Triple protocol has been widely used in Alibaba and many community benchmark enterprises, especially in scenarios involving proxy and gateway interoperability. On one hand, Triple has been proven reliable and stable through large-scale production practice; on the other hand, the simplicity, ease of debugging, and non-IDL binding design of Triple are also important factors for its widespread adoption.

### Native Multi-Protocol Support
When launching services externally using the Dubbo framework as a server, it can natively support Triple, gRPC, and HTTP/1 protocols on the same port. This means you can access the services published by Dubbo server in various forms, with all request forms ultimately being forwarded to the same business logic implementation, providing greater flexibility.

Dubbo is fully compatible with gRPC protocols and related features, including streaming, trailers, and error details. You can choose to directly use the Triple protocol in the Dubbo framework (or you can opt to use the native gRPC protocol), and then directly access your published services with the Dubbo client, cURL, browsers, etc. In terms of interoperability with the gRPC ecosystem, any standard gRPC client can normally access Dubbo services; Dubbo clients can also call any standard gRPC services. Here is a provided [interoperability example](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/interop).

Here is an example of using cURL client to access Dubbo server Triple protocol service:

```sh
curl \
    --header "Content-Type: application/json" \
    --data '{"sentence": "Hello Dubbo."}' \
    https://host:port/org.apache.dubbo.sample.GreetService/sayHello
```

### One-Stop Service Governance Integration
We all know that Dubbo has rich microservices governance capabilities, such as service discovery, load balancing, traffic control, etc. This is also one of the advantages of developing applications using the Dubbo framework. To use gRPC protocol communication in the Dubbo system, there are two ways to achieve it: one is to directly introduce the gRPC official published binary package into the Dubbo framework, and the other is to provide a natively compatible source implementation of the gRPC protocol within Dubbo.

Compared to the first method of introducing binary dependencies, the Dubbo framework natively supports the gRPC protocol through built-in Triple protocol implementation. The advantage of this approach is that the source code is entirely under your control, allowing for a closer integration of the protocol implementation with the Dubbo framework, enabling more flexible access to Dubbo's service governance system.

### Java Language
In the Dubbo Java library implementation, you can define services using Java Interfaces in addition to IDL approaches, which can significantly reduce the cost of using the gRPC protocol for many Java users familiar with the Dubbo system.

Additionally, the protocol implementation in the Java version performs on par with the grpc-java library in performance, with even better performance in certain scenarios. All of this is built upon the fact that the implementation complexity of the Dubbo version protocol is much lower than that of the gRPC version, as grpc-java maintains a customized version of the netty protocol implementation.

### Go Language Implementation
Dubbo Go recommends the IDL development model, generating stub code through Dubbo's accompanying protoc plugin. You only need to provide the corresponding business logic implementation, and you can access the gRPC services published by Dubbo Go through cURL and browsers.

## Future Plans
Currently, we have provided Java and Go versions of the Triple protocol, and we plan to successively provide corresponding implementations in Rust, Python, Node.js, and other languages.

