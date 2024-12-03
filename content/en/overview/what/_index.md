---
aliases:
    - /en/overview/what/
description: ""
hide_summary: true
linkTitle: Introduction
no_list: true
title: Introduction to Dubbo
type: docs
weight: 2
---


[Master Apache Dubbo in 5 Minutes]({{< relref "../../blog/news/dubbo-introduction" >}})

Apache Dubbo is an RPC service development framework designed to address service governance and communication issues in microservice architectures. The official implementation provides multi-language SDKs such as Java and Golang. Microservices developed using Dubbo inherently possess the ability to discover and communicate with each other remotely. By leveraging Dubbo's rich service governance features, you can achieve service discovery, load balancing, traffic scheduling, and other service governance requirements. Dubbo is designed to be highly extensible, allowing users to easily implement various custom logics for traffic interception and routing.

In the era of cloud-native, Dubbo has evolved into architectures and solutions like Dubbo3 and Proxyless Mesh, offering comprehensive upgrades in usability, large-scale microservice practices, cloud-native infrastructure adaptation, and security.

## The Open Source Story of Dubbo

Apache Dubbo was initially designed and developed to solve Alibaba's internal microservice architecture problems. Over more than a decade, it has been widely used in many business systems within Alibaba. As early as 2008, Alibaba donated Dubbo to the open-source community, and it quickly became the de facto standard framework for open-source service frameworks in China, gaining broader industry adoption. In 2017, Dubbo was officially donated to the Apache Software Foundation and became an Apache top-level project, embarking on a new journey.

Dubbo has proven to meet the large-scale microservice practices of enterprises effectively and can significantly reduce the development and management costs of microservice construction. Whether it is Alibaba, Industrial and Commercial Bank of China, Ping An Insurance, Ctrip, Haier, or other community users, they have fully verified Dubbo's stability and performance through years of large-scale production environment traffic. Later, Dubbo evolved into independent versions within many large enterprises. Since the promotion of the cloud-native concept, major vendors have begun to embrace open-source standard implementations. Alibaba integrated its internal HSF system with the open-source community Dubbo, jointly launching the Dubbo3 architecture for the cloud-native era. As of the end of Double 11 in 2022, **Dubbo3 has been widely implemented within Alibaba, achieving an upgrade from the old HSF2 framework, with core systems such as e-commerce and Alibaba Cloud fully running on Dubbo3**.

## Why Do You Need Dubbo, and What Can It Do?

According to the definition of microservice architecture, adopting it can significantly improve business iteration efficiency and system stability. However, the prerequisite is to ensure that microservices run as expected. To achieve this, you need to address a series of issues such as service splitting and definition, data communication, address discovery, traffic management, data consistency, and system fault tolerance.

Dubbo can help solve the following microservice practice issues:

* **Microservice Programming Paradigm and Tools**

Dubbo supports service definitions based on IDL or language-specific methods, providing various forms of service invocation (such as synchronous, asynchronous, streaming, etc.)

* **High-Performance RPC Communication**

Dubbo helps solve communication issues between microservice components, offering multiple high-performance communication protocol implementations based on HTTP, HTTP/2, TCP, etc., and supports serialization protocol extensions, addressing fundamental issues like network connection management and data transmission.

* **Microservice Monitoring and Governance**

Dubbo provides official components for service discovery, dynamic configuration, load balancing, and traffic routing, effectively addressing basic microservice practice issues. Additionally, you can use the Admin console to monitor microservice status and leverage the surrounding ecosystem to achieve capabilities like rate limiting, degradation, data consistency, and link tracing.

* **Deployment in Various Environments**

Dubbo services can be directly deployed in various architectures such as containers, Kubernetes, and Service Mesh.

* **Active Community**

The Dubbo project is hosted in the Apache community, maintained by active contributors from both international and domestic backgrounds, with over 10 ecosystem projects. Contributors include technical experts from well-known companies such as Alibaba, Industrial and Commercial Bank of China, Ctrip, Ant Financial, Tencent, and others, ensuring that Dubbo promptly addresses project defects, requirements, and security vulnerabilities, keeping up with the latest industry technology trends.

* **Large User Base**

Dubbo3 has been successfully implemented within Alibaba, achieving a comprehensive upgrade from the old HSF2 framework, becoming the unified service framework foundation for Alibaba Group in the cloud-native era. The large user base is the foundation for Dubbo's stability, demand source, and advancement.

## What Dubbo Is Not?

* **Not a Replacement for Application Development Frameworks**

Dubbo is designed to allow developers to work in the development mode of mainstream application development frameworks. It is not a replacement for application development frameworks in various languages. For example, it is not a competitor to Spring/Spring Boot. When you use Spring, Dubbo can seamlessly integrate with Spring & Spring Boot.

* **Not Just an RPC Framework**

Dubbo provides a built-in RPC communication protocol implementation, but it is not just an RPC framework. Firstly, it is not bound to a specific RPC protocol; developers can use multiple communication protocols in a microservice system based on Dubbo. Secondly, besides RPC communication, Dubbo offers rich service governance capabilities and an ecosystem.

* **Not a replacement for the gRPC protocol**

Dubbo supports using gRPC as the underlying communication protocol. Using gRPC under the Dubbo mode can bring a better development experience, offering a unified programming model and lower service governance access costs.

* **Not limited to Java language implementation**

Starting from Dubbo3, Dubbo provides implementations in multiple languages such as Java, Golang, Rust, and Node.js, with more language implementations to come in the future.
