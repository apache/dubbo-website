---
type: docs
title: "Develop microservice with Dubbo"
linkTitle: "Microservice develop"
weight: 1
---
Dubbo addresses a series of challenges from development and deployment to governance and operations in enterprise microservices. Dubbo provides a full suite of services for developers, from project creation, development testing, to deployment, visual monitoring, traffic governance, and ecosystem integration.

### Development

* **Language Support**: Dubbo supports various programming languages including Java, Go, Rust, Node.js, and defines a set of paradigms for microservice development. A corresponding scaffold is available for quickly creating a microservice project skeleton.
* **Deployment**: Dubbo applications can be deployed in different environments including virtual machines, Docker containers, Kubernetes, and service mesh architectures.
* **Service Governance**: Dubbo provides capabilities like address discovery, load balancing, and traffic control. It also offers an Admin dashboard for visual control and a rich microservice ecosystem.

#### Creating a Project
The [Dubbo Microservices Project Scaffold](https://start.dubbo.apache.org/bootstrap.html) can be used to quickly create a microservices project. The scaffold can generate a microservice project with necessary dependencies based on the features or components you want.

#### Developing Services
**1. Define the Service**

```java
public interface DemoService {
    String hello(String arg);
}
```

**2. Implement Business Logic**

```java
@DubboService
public class DemoServiceImpl implements DemoService {
    public String hello(String arg) {
        // your microservice logic here
    }
}
```

#### Publishing Services
**1. Publish the Service Definition**

The service provider needs to publish the service definition as a Jar package to the Maven central repository.

**2. Expose the Service**

Add Dubbo configuration and start the Dubbo server.

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

#### Consuming Services

First, consumers include the `DemoService` service definition dependency via Maven/Gradle.

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-demo-interface</artifactId>
    <version>3.2.0</version>
</dependency>
```

Then, programmatically inject the remote Dubbo service instance.

```java
@Bean
public class Consumer {
    @DubboReference
    private DemoService demoService;
}
```

### Deployment
Dubbo native services can be packaged and deployed to cloud-native infrastructures like Docker containers, Kubernetes, and service meshes.

### Governance
For service governance, most applications just need to add the following configuration. Dubbo will then have address discovery and load balancing capabilities.

```yaml
dubbo:
  registry:
    address: zookeeper://127.0.0.1:2181
```

Deploy and open the [Dubbo Admin Dashboard](/zh-cn/overview/tasks/deploy/), and you will see the service deployment and invocation data.

Dubbo Admin can also improve development and testing efficiency through additional capabilities like:
* Document management for regular services and IDL documents
* Service testing & service Mock
* Service status inquiry

For more complex microservices scenarios, Dubbo also provides more advanced governance features, including:
* Traffic governance
* Dynamic configuration
* Rate limiting and degradation
* Data consistency
* Observability
* Multi-protocol
* Multiple registries
* Service mesh

This guide provides an overview of the workflow for developing microservices with Dubbo. For detailed step-by-step instructions, please refer to:
* [Getting Started with Java Microservices](/en/overview/quickstart/)
* [Getting Started with Go Microservices](/en/overview/quickstart/go/)
* [Getting Started with Rust Microservices](/en/overview/quickstart/rust/)
* [Getting Started with Node.js Microservices](https://github.com/apache/dubbo-js)


### Deployment

Dubbo's native services can be packaged and deployed in various cloud-native infrastructures and microservices architectures, including Docker containers, Kubernetes, and Service Mesh.

For examples of deployment in different environments, refer to:
* [Deploying Dubbo services to Docker containers](/zh-cn/overview/tasks/deploy/deploy-on-docker)
* [Deploying Dubbo services to Kubernetes](/en/overview/tasks/kubernetes/)

### Governance

For service governance, most applications only need to add the following configuration, and the Dubbo application will have address discovery and load balancing capabilities.

```yaml
dubbo:
  registry:
    address: zookeeper://127.0.0.1:2181
```

Once deployed and the [Dubbo Admin Console](/zh-cn/overview/tasks/deploy) is opened, you can see the deployment and invocation data of services in the cluster.

![Admin](/imgs/v3/what/admin.png)

In addition, Dubbo Admin can also enhance R&D and testing efficiency through the following capabilities:
* Document management, providing general services and IDL document management.
* Service testing & Service Mock.
* Service status inquiry.

For more complex microservices practice scenarios, Dubbo also offers many more advanced service governance features. For more details, please refer to the documentation, including:
* Traffic governance
* Dynamic configuration
* Rate limiting and degradation
* Data consistency
* Observability
* Multi-protocol
* Multi-registry centers
* Service Mesh