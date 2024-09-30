---
aliases:
    - /en/overview/core-features/service-definition/
    - /en/overview/core-features/service-definition/
description: Microservices Development
linkTitle: Microservices Development
title: Microservices Development
type: docs
weight: 1
---


Dubbo addresses a series of challenges from development, deployment to governance and operation of enterprise microservices. Dubbo provides developers with a full set of services from project creation, development testing, to deployment, visual monitoring, traffic governance, and ecosystem integration.
* **Development**: Dubbo offers implementations in Java, Go, Rust, Node.js, and defines a microservices development paradigm. The accompanying scaffolding can be used to quickly create microservice project skeletons.
* **Deployment**: Dubbo applications support deployment on virtual machines, Docker containers, Kubernetes, and service mesh architectures.
* **Service Governance**: Dubbo provides governance capabilities such as address discovery, load balancing, and traffic control. The official Admin visual console and rich microservice ecosystem integration are also provided.

## Development

Next, we will explain the basic steps of Dubbo application development using a Java-based Spring Boot project as an example. The entire process is very intuitive and simple, and the development process for other languages is similar.

### Create Project
<a href="https://start.dubbo.apache.org/bootstrap.html" target="_blank">Dubbo Microservice Project Scaffolding</a> (supports browser pages, command line, and IDE) can be used to quickly create microservice projects. You only need to tell the scaffolding the desired features or components, and the scaffolding can help developers generate microservice projects with the necessary dependencies. For more explanations on how to use the scaffolding, please refer to the task module [Generate Project Scaffolding through Templates](../../tasks/develop/template/)

![Scaffolding Example](/imgs/v3/advantages/initializer.png)

### Develop Service

**1. Define Service**

```java
public interface DemoService {
    String hello(String arg);
}
```

**2. Provide Business Logic Implementation**

```java
@DubboService
public class DemoServiceImpl implements DemoService {
    public String hello(String arg) {
        // put your microservice logic here
    }
}
```

### Publish Service
**1. Publish Service Definition**

To ensure that the consumer can successfully call the service, the service provider must first publish the service definition to the Maven central repository in the form of a Jar package.

**2. Expose Service**

Supplement Dubbo configuration and start Dubbo Server

```yaml
dubbo:
  application:
    name: dubbo-demo
  protocol:
    name: dubbo
    port: -1
  registry:
    address: zookeeper://127.0.0.1:2181
```

### Call Service

First, the consumer introduces the `DemoService` service definition dependency through Maven/Gradle.

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-demo-interface</artifactId>
    <version>3.2.0</version>
</dependency>
```

Programmatically inject the remote Dubbo service instance

```java
@Bean
public class Consumer {
    @DubboReference
    private DemoService demoService;
}
```

The above is a procedural explanation of Dubbo microservice development. For detailed guidance steps in actual development, please refer to:
* [Java Microservice Development Quick Start](../../quickstart/java)
* [Go Microservice Development Quick Start](../../quickstart/go)
* [Rust Microservice Development Quick Start](../../quickstart/rust)
* [Node.js Microservice Development Quick Start](https://github.com/apache/dubbo-js)

## Deployment
Dubbo native services can be packaged and deployed to cloud-native infrastructures and microservice architectures such as Docker containers, Kubernetes, and service meshes.

For deployment examples in different environments, refer to:
* [Deploy Dubbo Services to Docker Containers](../../tasks/deploy/deploy-on-docker)
* [Deploy Dubbo Services to Kubernetes](../../tasks/deploy/deploy-on-k8s-docker)

## Governance
For service governance, most applications only need to add the following configuration, and Dubbo applications will have address discovery and load balancing capabilities.

```yaml
dubbo:
  registry:
    address: zookeeper://127.0.0.1:2181
```

Deploy and open the [Dubbo Admin Console](../../tasks/deploy), where you can see the service deployment and call data of the cluster.

![Admin](/imgs/v3/what/admin.png)

In addition, Dubbo Admin can also improve R&D testing efficiency through the following capabilities:
* Documentation management, providing ordinary service and IDL documentation management
* Service testing & service mocking
* Service status query

For more complex microservice practice scenarios, Dubbo also offers more advanced service governance features. Please refer to the documentation for more details, including:
* Traffic governance
* Dynamic configuration
* Rate limiting and degradation
* Data consistency
* Observability
* Multiple protocols
* Multiple registries
* Service mesh
