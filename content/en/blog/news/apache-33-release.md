---
title: "Apache Dubbo 3.3 Released: Triple X Leads a New Era of Microservices Communication"
linkTitle: "Apache Dubbo 3.3 Released"
date: 2024-09-11
tags: ["News"]
description: >
  With Apache Dubbo surpassing 40k Stars, the Apache Dubbo team officially announces the release of Dubbo 3.3! As a leading open-source microservices framework, Dubbo has been dedicated to providing developers with high-performance, scalable, and flexible distributed service solutions. This release, Dubbo 3.3, through the new upgrade of Triple X, breaks past limitations, achieving comprehensive support for both north-south and east-west traffic, and enhancing compatibility with cloud-native architectures.
---

As Apache Dubbo surpasses 40k Stars, the Apache Dubbo team officially announces the release of Dubbo 3.3! As a leading open-source microservices framework, Dubbo has been dedicated to providing developers with high-performance, scalable, and flexible distributed service solutions. This release, Dubbo 3.3, through the new upgrade of Triple X, breaks past limitations, achieving comprehensive support for both north-south and east-west traffic, and enhancing compatibility with cloud-native architectures.

## Introduction to Dubbo

**Apache Dubbo** is a high-performance, lightweight microservice framework originally developed in Java, but now extended to support various languages such as **Go, Rust, and Python**, providing robust support for building cross-language and cross-platform distributed systems for enterprises worldwide. Dubbo offers rich service governance capabilities, including service registration and discovery, load balancing, fault tolerance, and tracing, helping developers build efficient and flexible microservice architectures.

As Dubbo has gradually evolved, its communication capabilities, service governance, and cross-language compatibility have significantly improved, making it an ideal tool for supporting modern microservice architectures.

## Background of Triple X Upgrade

In the early applications of Dubbo, while it demonstrated excellent performance in service intercommunication within data centers, the original architecture gradually exposed some bottlenecks as technology evolved and application scenarios expanded. These bottlenecks are especially evident in cross-region and cross-cloud environments, particularly affecting development complexity and system performance due to frequent switching between web frameworks and RPC frameworks.

**The pain points of traditional architecture mainly include:**

1.  **Limited to data center applications**: In cross-regional or cross-cloud applications, the traditional architecture of Dubbo lacks native support for wide-area environments, resulting in increased complexity as developers switch between various protocols and frameworks.

2.  **Dual challenges of north-south and east-west traffic**: In modern microservice architectures, traditional RPC frameworks often focus more on optimizing north-south traffic, while the performance requirements for inter-service (east-west) communication are increasing, posing new challenges to the traditional Dubbo architecture.

3.  **Cloud-native and cross-language interoperability requirements**: With the rise of cloud-native technologies, systems need deeper support for HTTP protocols and the ability to communicate across languages; however, traditional Dubbo has not been natively optimized in this regard.

**Transformations and breakthroughs of Triple X**: The emergence of Triple X directly addresses these pain points. It not only continues Dubbo's longstanding high-performance communication capabilities but also achieves comprehensive compatibility with the gRPC protocol. By supporting protocols such as HTTP/1, HTTP/2, and HTTP/3, it provides a more flexible and efficient solution for a wide range of cross-cloud and cross-region application scenarios.

![image.png](/imgs/blog/33-release/ee5812e0-a90b-4a02-abab-b658cdddefc1.png)

## Core Capabilities Overview of Triple X

*   **Comprehensive support for north-south and east-west traffic**: Triple X seamlessly supports north-south traffic from clients to servers and east-west communication between services, ensuring flexible conversion and improving the overall efficiency of communication links.

*   **Adheres to gRPC protocol standards**: Triple X follows gRPC protocol standards, supporting communication via Protobuf, allowing seamless interaction with gRPC services and extending Dubbo's cross-language and cross-platform communication capabilities.

*   **Based on HTTP protocols, native support for cloud-native architectures**: Triple X is built atop HTTP/1, HTTP/2, and HTTP/3 protocol stacks, fully optimizing network communication performance and seamlessly integrating with modern cloud-native infrastructures, supporting various gateways and service meshes.

*   **High performance optimization**: Triple X offers significant performance improvements, especially excelling in high-concurrency and weak network environments, greatly enhancing system throughput and response speeds.

*   **Smooth migration and framework compatibility**: It supports seamless migration from existing Spring Web projects, allowing developers to switch to Triple X without changing existing code, improving performance while retaining support for frameworks like Spring MVC.

*   **High scalability**: Triple X introduces over 20 SPI extension points, supporting custom core behaviors, including routing mapping, parameter parsing, serialization, and exception handling. This significantly enhances the flexibility and customizability of the framework, allowing developers to tailor behaviors to specific business needs and scenarios, improving development efficiency and reducing customization costs.

## Usage Scenarios for Triple X

**Triple X** provides flexible access methods for microservice architectures in Dubbo 3.3, adapting to system needs in various scenarios. Depending on the system architecture, Triple X offers both **centralized access** and **decentralized access** methods, suitable for multiple application scenarios.

### 1. Centralized Access

In **centralized access**, external traffic enters the Dubbo backend services through a unified service gateway. The gateway handles HTTP traffic parsing and forwarding, routing requests to the appropriate backend services. This method is suitable for systems with high requirements for traffic management, control, and authentication, allowing centralized control of traffic entry points.

![lQLPJxkYhOcUzFfNA3bNC0Sw5rRkqBkcwQ4GwaypwVc_AA_2884_886.png](/imgs/blog/33-release/78d6744b-928a-41d4-857c-ff91ad69c896.png)

*   **Use case**: When the system requires centralized management of external requests, monitoring and throttling traffic, Triple X can efficiently handle HTTP/1, HTTP/2, and HTTP/3 traffic through the service gateway and forward it to Dubbo services for processing.

*   **Advantages**: Centralized control, easier management, suitable for unified traffic governance in large-scale systems.

### 2. Decentralized Access

In **decentralized access**, external clients can directly access the backend Dubbo services via HTTP protocols without relying on an intermediate gateway layer. This approach is suitable for systems requiring high performance and low latency, reducing communication overhead by directly routing traffic to service nodes, thus improving system response speed. Eliminating the gateway helps avoid system unavailability caused by gateway failures, simplifying deployment architecture and enhancing system stability.

![lQLPJw7B47rI7FfNAzjNCYiwStDS2ladC3oGwaypwZe9AA_2440_824.png](/imgs/blog/33-release/68b69954-9df2-48b2-bd63-fe07ba8cb25b.png)

*   **Use case**: When a system wishes to access Dubbo services through direct HTTP traffic, reducing intermediaries to improve response speed, Triple X provides the ability to expose REST APIs directly, completing service exits without a gateway.

*   **Advantages**: Removing intermediaries enhances performance and response speed, simplifying architecture, suitable for low-latency application scenarios.

## Detailed Explanation of Triple X Core Capabilities

### 1. Comprehensive traffic management and efficient communication support

In complex microservices architectures, north-south traffic (from clients to servers) and east-west traffic (service-to-service communication) require different technologies for processing, often facing performance bottlenecks and complicated development and operational issues.

The Triple X protocol supports both north-south and east-west traffic through a unified communication protocol. There is no need to switch between web frameworks and RPC frameworks, simplifying the development process and enhancing the overall performance and maintainability of the system.

Developers can achieve comprehensive traffic support through Triple X, whether handling user-initiated requests or inter-service communications, ensuring efficient transmission.

```java
package org.apache.test;

@DubboService
public class UserServiceImpl implements UserService {
    // Handle east-west requests
}

// Triple X also supports north-south traffic processing
@DubboService
public class OrderService {
    @GetMapping("/order/{orderId}")
    public Order getOrderById(@PathVariable("orderId") String orderId) {}
}
```

Invocation methods:

1.  The Dubbo Client directly initiates an RPC call.

2.  The front end uses HTTP to directly request, targeting the path `http://server:50051/order/{orderId}`.

3.  Using the default published path of Dubbo for the request, targeting the path `http://server:50051/org.apache.test.OrderService/getOrderById?orderId=xxx`.

### 2. Adherence to gRPC protocol standards

Communication between cross-language services often becomes a challenge in distributed systems. gRPC is one of the commonly used solutions, but traditional Dubbo requires additional tools to achieve interoperability with gRPC.

Triple X adheres to **gRPC protocol standards**, facilitating seamless interaction with gRPC through Protobuf, simplifying the development process and enhancing cross-language and cross-platform communication capabilities.

Services using Triple X can directly interact with gRPC-based services without additional adaptations, enabling efficient inter-service communication.

### 3. Native support for cloud-native architectures based on HTTP protocols

In cloud-native environments, services need efficient integration with various network infrastructures (such as API gateways, service meshes) while supporting multiple HTTP protocols to optimize network performance.

Triple X supports both **HTTP/1, HTTP/2, and HTTP/3** protocols, allowing developers to leverage the advantages of these protocols, including long connections, multiplexing, and header compression, without additional configuration for efficient network communication. Using **HTTP/3** can completely resolve head-of-line blocking issues while being based on UDP communication, maintaining high connection quality and service performance even in weak network conditions, whereas TCP may become non-functional under high packet loss rates.

Triple X allows reusing existing **Servlet** ports in Spring Boot to access HTTP traffic, eliminating the need for new Netty listening ports. The simplification of the network architecture reduces usage and maintenance costs, improves security, and facilitates traffic through enterprise firewalls and gateways.

![image.png](/imgs/blog/33-release/0e6b75c3-3340-4bed-a566-88c46a03ada6.png)

### 4. High performance optimization, enhancing QPS by 5 times

In high-concurrency scenarios, traditional communication protocols often lack deep optimization, leading to bottlenecks that affect the overall response time and throughput of systems.

Triple X improves system performance significantly by reducing CPU usage and memory consumption through technologies like **Radix Tree** and **Zero Copy**, excelling in high-concurrency and weak network environments:

*   **Efficient routing**: Adopting Radix Tree prefix structures for routing matching, optimizing key hash algorithms, and supporting dynamic updates, reducing memory usage and improving matching efficiency.

*   **Memory usage optimization**: Combining Zero Copy technology with object reuse techniques minimizes data copying and object creation overhead, reducing garbage collection pressure and enhancing throughput.

*   **HTTP/3 support**: Introduced based on QUIC, the HTTP/3 protocol significantly enhances performance in weak network environments, resolves head-of-line blocking issues, reduces latency, and improves connection reliability.

*   **Multi-protocol performance testing optimization**: The Dubbo team performed comprehensive performance testing on various protocols, conducting multiple rounds of performance optimizations based on test results to ensure the best performance in diverse scenarios.

After performance testing, the average response time of a simple Rest service compared to traditional Spring Boot REST services was reduced to 1/3 for Triple X services, with QPS improving by 5 times under high pressure, while memory allocation decreased by 50%, significantly enhancing overall system performance and resource utilization efficiency.

![image.png](/imgs/blog/33-release/c7d4f983-f619-4d39-94b6-5d62fd5a430e.png)

![image.png](/imgs/blog/33-release/53a6f3c7-20ad-49f6-abc0-4e2d80a9597d.png)

![image.png](/imgs/blog/33-release/7e4f3ced-9932-472f-bb8f-272ec97a7fbe.png)

![image.png](/imgs/blog/33-release/5f8ebef5-08f3-463a-bb86-14b32a09ebb2.png)

### 5. Smooth migration and framework compatibility

Additionally, Triple X supports the performance improvement of existing Spring Web projects during migration to microservice architectures without extensive code modifications.

Triple X offers a zero-intrusive migration solution, allowing developers to migrate existing Spring Web projects to Triple X without modifying existing code, while retaining support for frameworks such as Spring MVC.

```java
@DubboService    // Just add the service publishing configuration
@RestController
public class DemoController {

    @GetMapping("/spring-test")
    public String sayHello(@RequestParam("name") String name) {
        return "Hello " + name;
    }
}
```

## Overview of Other Capability Optimizations in This Version Upgrade

### 1. Native Image AOT Support

Dubbo 3.3 introduces support for **Native Image AOT (Ahead-of-Time Compilation)**, allowing developers to compile Dubbo applications into native binary files, significantly reducing startup time and memory usage, particularly suitable for serverless scenarios.

### 2. Project Loom Support

Dubbo 3.3 provides support for **Project Loom**, optimizing thread management in high-concurrency scenarios through virtual threads, simplifying asynchronous programming models, and enhancing concurrent processing capabilities.

### 3. New Routing Rules

In routing mechanisms, Dubbo 3.3 introduces new routing rules, supporting more flexible traffic control and service governance, enhancing the adaptability of microservice systems in large-scale deployments.

## Conclusion

The release of **Apache Dubbo 3.3** marks a new height in microservices communication technology. Through **Triple X**, Dubbo not only achieves comprehensive support for north-south and east-west traffic but also provides developers with stronger and more flexible tools through seamless gRPC integration, cloud-native support based on HTTP protocols, and high-performance optimizations, helping them build modern distributed systems.

Whether enhancing inter-service communication efficiency, achieving cross-language compatibility, or optimizing communication performance in cloud-native environments, Dubbo 3.3 is an ideal choice for developers facing modern distributed system challenges. Upgrade to Dubbo 3.3 now to experience the transformation brought by **Triple X** and start a new era of microservices communication!

For more upgrade guides and compatibility information, please refer to [Dubbo 3.2 to 3.3 Upgrade Guide](/en/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/version/3.2-to-3.3-compatibility-guide/)。
