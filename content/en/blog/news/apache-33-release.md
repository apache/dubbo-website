---
title: "Apache Dubbo 3.3 Released: Triple X Leads a New Era of Microservices Communication"
linkTitle: "Apache Dubbo 3.3 Released"
date: 2024-09-11
tags: ["News"]
description: >
  With Apache Dubbo surpassing 40k Stars, the Apache Dubbo team officially announces the release of Dubbo 3.3! As a leading open-source microservices framework, Dubbo has been dedicated to providing developers with high-performance, scalable, and flexible distributed service solutions. This release, Dubbo 3.3, through the new upgrade of Triple X, breaks past limitations, achieving comprehensive support for both north-south and east-west traffic, and enhancing compatibility with cloud-native architectures.
---

Apache Dubbo has surpassed 40,000 stars, and the team is proud to announce the official release of Dubbo 3.3! As a leading open-source microservices framework, Dubbo has always been committed to providing developers with high-performance, scalable, and flexible solutions for distributed services. The release of Dubbo 3.3, featuring the **Triple X** upgrade, breaks previous limitations, achieving comprehensive support for both north-south and east-west traffic, and enhancing compatibility with cloud-native architectures.

## Introduction to Dubbo

**Apache Dubbo** is a high-performance, lightweight microservices framework that was initially developed in Java. It has since expanded to support multiple languages, such as **Go, Rust, and Python**, making it ideal for building cross-language, cross-platform distributed systems. Dubbo provides rich service governance features, including service registration and discovery, load balancing, fault tolerance, and call chain tracing, which help developers build efficient, flexible microservices architectures.

With its evolution, Dubbo has significantly improved its communication performance, service governance, and cross-language compatibility, making it a powerful tool for supporting modern microservices architectures.

## Background of the Triple X Upgrade

In its early applications, Dubbo demonstrated excellent performance in data center service interoperability. However, as technology evolved and application scenarios expanded, the original architecture began to show bottlenecks. These limitations became especially evident in cross-region and cross-cloud environments, where frequent switches between web frameworks and RPC frameworks led to increased development complexity and decreased system performance.

**Pain Points of the Traditional Architecture:**

1. **Limited to Data Center Applications**: In cross-region or cross-cloud applications, Dubbo's traditional architecture lacked native support for wide-area environments, forcing developers to switch between multiple protocols and frameworks, increasing complexity.

2. **Challenges with North-South and East-West Traffic**: Traditional RPC frameworks, like Dubbo, often focus more on service-to-service (east-west) traffic optimization. However, the need for efficient north-south communication (client-to-server) has increased, creating new challenges.

3. **Cloud-Native and Cross-Language Requirements**: With the growth of cloud-native technologies, systems require better support for HTTP protocols and cross-language communication, areas where traditional Dubbo wasn't optimized.

**Triple X's Transformation and Breakthroughs:** The **Triple X** upgrade directly addresses these pain points. It continues Dubbo's high-performance communication capabilities while achieving full compatibility with the gRPC protocol, supporting HTTP/1, HTTP/2, and HTTP/3 protocols. This provides more flexibility and efficiency for cross-cloud and cross-region application scenarios.

![Triple X Overview](/imgs/blog/33-release/cc93cf33-8f19-45dc-970f-1288994bf8a5.png)

## Overview of Triple X Core Capabilities

* **Comprehensive Traffic Support**: Triple X supports both north-south (client to server) and east-west (service to service) traffic. This seamless support ensures flexible conversions, improving the overall efficiency of communication links.

* **Compliance with gRPC Protocol Standard**: Triple X adheres to the gRPC protocol standard, allowing communication via Protobuf. This enables seamless interaction with gRPC services and extends Dubbo's cross-language, cross-platform communication capabilities.

* **Built on HTTP Protocol, Native Cloud-Native Support**: Triple X is built on HTTP/1, HTTP/2, and HTTP/3, optimizing network performance and integrating with cloud-native infrastructures, including support for various gateways and service meshes.

* **High-Performance Optimization**: Triple X provides extreme performance enhancements, particularly in high-concurrency and weak network environments, significantly improving system throughput and response speed.

* **Smooth Migration and Framework Compatibility**: Triple X allows developers to migrate existing Spring Web projects without modifying code, offering a seamless switch to Triple X while retaining support for frameworks like Spring MVC.

* **High Extensibility**: With over 20 new SPI extension points, Triple X enables customization of core behaviors, including routing, parameter parsing, serialization, and exception handling. This enhances flexibility, allowing developers to adapt the framework to meet specific business needs.

## Triple X Usage Scenarios

**Triple X** in Dubbo 3.3 offers flexible integration approaches for microservices architectures, adapting to different system requirements. Depending on the system architecture, Triple X provides both **centralized** and **decentralized** integration approaches, making it suitable for various application scenarios.

### 1. Centralized Integration

In a **centralized integration** approach, external traffic enters Dubbo backend services through a unified service gateway. The gateway handles HTTP traffic parsing, forwarding, and routing requests to the appropriate backend services. This approach is suitable for systems with high requirements for unified traffic management, flow control, and permission verification, allowing centralized control over incoming traffic.

![Centralized Integration Diagram](/imgs/blog/33-release/364921d0-324a-4325-a453-71c111e0312c.png)

* **Usage Scenario**: For systems requiring centralized management of external requests, such as traffic monitoring and rate limiting, Triple X can efficiently handle HTTP/1, HTTP/2, and HTTP/3 traffic via a service gateway and forward it to Dubbo services.

* **Advantages**: Centralized control, ease of management, suitable for large-scale systems needing unified traffic governance.

### 2. Decentralized Integration

In a **decentralized integration** approach, external clients can access Dubbo backend services directly via HTTP, without relying on an intermediary gateway. This approach is suitable for systems with high-performance and low-latency requirements, as it reduces communication overhead by eliminating the need for a gateway, thereby improving system response speed. Removing the gateway node also avoids system unavailability caused by gateway failures, simplifying the deployment architecture and enhancing stability.

![Decentralized Integration Diagram](/imgs/blog/33-release/6b3202d2-b703-4708-8d05-7f8445e1ad14.png)

* **Usage Scenario**: For systems that need to access Dubbo services directly via HTTP to reduce intermediate steps and improve response speed, Triple X allows REST APIs to be exposed without a gateway.

* **Advantages**: Eliminates intermediate steps, improves performance, simplifies architecture, suitable for low-latency applications.

## Detailed Breakdown of Triple X Capabilities

### 1. Comprehensive Traffic Management and Efficient Communication

In complex microservices architectures, handling both north-south (client to server) and east-west (service to service) traffic can be challenging. Triple X uses a unified communication protocol to support both, eliminating the need to switch between web and RPC frameworks, simplifying the development process, and improving performance and maintainability.

Developers can utilize Triple X for efficient support of both user-initiated requests and inter-service communication, all transmitted smoothly via Triple X.

```java
package org.apache.test;

@DubboService
public class UserServiceImpl implements UserService {
   // Handles east-west requests
}

// Triple X also supports north-south traffic
@DubboService
public class OrderService {
   @GetMapping("/order/{orderId}")
   public Order getOrderById(@PathVariable("orderId") String orderId) {}
}
```

### 2. Compliance with gRPC Protocol Standard

Communication between cross-language services is often a challenge in distributed systems, and gRPC is a popular solution. Triple X adheres to the **gRPC protocol standard**, enabling seamless interaction with gRPC using Protobuf, which enhances cross-language and cross-platform communication capabilities.

Services using Triple X can interact directly with gRPC-based services without extra adaptation, simplifying development.

### 3. Built on HTTP Protocol, Native Cloud-Native Support

In cloud-native environments, services need to integrate effectively with various network facilities like API gateways and service meshes, while supporting different HTTP protocols to enhance performance.

Triple X supports **HTTP/1, HTTP/2, and HTTP/3**, allowing developers to leverage the benefits of these protocols, such as long connections, multiplexing, and header compression, without extra configuration. **HTTP/3** also resolves head-of-line blocking issues, and its UDP-based communication maintains high quality and service performance in weak network environments.

Triple X allows reusing the existing **Servlet** port of Spring Boot to handle HTTP traffic, eliminating the need for a separate Netty listening port. This simplifies the network architecture, reduces maintenance costs, improves security, and allows traffic to pass through enterprise firewalls and gateways more easily.

![image.png](/imgs/blog/33-release/0e6b75c3-3340-4bed-a566-88c46a03ada6.png)

### 4. High-Performance Optimization, 5x QPS Improvement

In high-concurrency scenarios, traditional communication protocols often lead to bottlenecks, affecting system response time and throughput.

Triple X uses technologies such as **Radix Tree** and **Zero Copy** to reduce CPU usage and memory consumption, significantly improving system performance, especially in high-concurrency and weak network environments:

* **Efficient Routing**: Uses Radix Tree for route matching, optimizing the key hash algorithm and supporting dynamic updates, which reduces memory usage and improves matching efficiency.

* **Optimized Memory Usage**: Combines Zero Copy with object reuse, reducing data copying and object creation overhead, which lowers garbage collection pressure and increases throughput.

* **HTTP/3 Support**: Utilizes the QUIC-based HTTP/3 protocol, improving performance in weak network conditions by reducing latency and enhancing connection reliability.

* **Multi-Protocol Stress Testing and Optimization**: The Dubbo team conducted extensive stress tests on multiple protocols and performed several rounds of optimization, ensuring optimal performance across different scenarios.

Performance tests show that, compared to traditional Spring Boot REST services, simple REST services using Triple X achieve **five times the QPS** under high pressure, reduce response times to one-third, and lower memory allocation by 50%, greatly enhancing system performance and resource efficiency.

![Performance Comparison Chart 1](/imgs/blog/33-release/70125f11-14be-4786-bef7-b12462331263.png)

![Performance Comparison Chart 2](/imgs/blog/33-release/f38f6e7e-997f-4f5b-a888-ddea1ce7c6ca.png)

![Performance Comparison Chart 3](/imgs/blog/33-release/533a9f55-a98b-4f07-b7b2-63d939338160.png)

![Performance Comparison Chart 4](/imgs/blog/33-release/53857659-bd89-4e1c-b713-83689378b12f.png)

### 5. Smooth Migration and Framework Compatibility

Triple X also supports the migration of existing Spring Web projects to a microservices architecture without significant code changes.

Triple X offers a **zero-intrusive migration solution**, allowing developers to migrate existing Spring Web projects to Triple X without changing existing code while still supporting frameworks like Spring MVC.

```java
@DubboService // Only need to add service publishing configuration
@RestController
public class DemoController {
   @GetMapping("/spring-test")
   public String sayHello(@RequestParam("name") String name) {
       return "Hello " + name;
   }
}
```

## Overview of Other Enhancements in This Release

### 1. Native Image AOT Support

Dubbo 3.3 introduces support for **Native Image AOT (Ahead-of-Time Compilation)**, allowing developers to compile Dubbo applications into native binaries. This significantly reduces startup time and memory usage, making it ideal for serverless scenarios.

### 2. Project Loom Support

Dubbo 3.3 adds support for **Project Loom**, optimizing thread management in high-concurrency scenarios with virtual threads, simplifying the asynchronous programming model, and improving concurrency handling.

### 3. New Routing Rules

Dubbo 3.3 also introduces new routing rules, supporting more flexible traffic control and service governance, enhancing adaptability for large-scale microservices deployments.

## Conclusion

The release of **Apache Dubbo 3.3** marks a significant milestone in microservices communication technology. With **Triple X**, Dubbo now offers comprehensive support for both north-south and east-west traffic, seamless integration with gRPC, cloud-native support via HTTP protocols, and significant performance optimizations, providing developers with a powerful and flexible tool for building modern distributed systems.

Whether you need to enhance the efficiency of inter-service communication, achieve cross-language compatibility, or optimize cloud-native communication performance, **Dubbo 3.3** is the ideal choice for tackling the challenges of modern distributed systems. Upgrade to Dubbo 3.3 today and experience the transformation brought by **Triple X**, ushering in a new era of microservices communication!

For more upgrade guides and compatibility information, please refer to [Dubbo 3.2 to 3.3 Upgrade Guide](/en/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/version/3.2-to-3.3-compatibility-guide/)。
