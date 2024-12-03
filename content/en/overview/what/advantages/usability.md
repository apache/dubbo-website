---
aliases:
    - /en/overview/what/advantages/usability/
description: Quick and Easy to Use
linkTitle: Quick and Easy to Use
title: Quick and Easy to Use
type: docs
weight: 1
---



Whether you are planning to adopt a microservices architecture to develop a new business system or preparing to migrate an existing business from a monolithic architecture to a microservices architecture, the Dubbo framework can help you. Dubbo makes microservices development very easy, allowing you to choose multiple programming languages, use any communication protocol, and it also provides a series of development and testing tools for microservices scenarios to help improve development efficiency.

## Multi-language SDK
Dubbo provides SDK implementations for almost all mainstream languages, defining a unified microservices development paradigm. Dubbo is adapted to the mainstream application development frameworks of each language system, and the overall programming method and configuration conform to the existing programming habits of most developers.

For example, in the Java language system, you can use `dubbo-spring-boot-starter` to develop microservices applications that conform to the Spring and Spring Boot patterns. Developing Dubbo applications is just a matter of adding a few annotations to Spring Beans and completing the application.properties configuration file.

![sdk](/imgs/v3/what/sdk.png)

## Any Communication Protocol
Dubbo supports the implementation details of remote communication between microservices, supporting all mainstream communication protocols such as HTTP, HTTP/2, gRPC, TCP, etc. Unlike ordinary RPC frameworks, Dubbo is not an implementation of a single RPC protocol. Through the upper-layer RPC abstraction, any RPC protocol can be integrated into Dubbo's development and governance system.

Multi-protocol support makes user selection, multi-protocol migration, and interoperability more flexible.

![protocols](/imgs/v3/what/protocol.png)

## Accelerate Microservices Development

### Project Scaffold
<a href="https://start.dubbo.apache.org/bootstrap.html" target="_blank">Project Scaffold</a> makes Dubbo project creation and dependency management easier.

For example, through the following visual interface, after selecting the Dubbo version, Zookeeper registry, and necessary microservices ecosystem options, a complete Dubbo project template can be automatically generated. Next, you can add business logic based on the scaffold project. For more explanations on how to use the scaffold, please refer to the task module [Generate Project Scaffold through Template](../../../tasks/develop/template/)

![Scaffold Example](/imgs/v3/advantages/initializer.png)

### Development and Testing
Compared to monolithic applications, the distributed nature of microservices can make R&D collaboration between different organizations more difficult. At this time, we need effective supporting tools to improve the overall microservices R&D efficiency.

Dubbo has considered how to solve development, testing, and operation and maintenance issues from the kernel design and implementation stage. For example, the Dubbo RPC protocol supports curl access, making development collaboration easier. Combined with the official ecosystem tools, it can achieve service testing, service mocking, document management, single-machine operation and maintenance capabilities, and visualize all operations through the Dubbo Admin console.

![admin](/imgs/v3/what/admin.png)
