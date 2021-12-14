---
type: docs
title: "What's new in Apache Dubbo 3.x?"
linkTitle: "What's new in Apache Dubbo 3.x?"
weight: 10
description: "A summary of the new features available in Dubbo 3.x"
---


## New Service Discovery Mechanism

* Performance improvements 

* Support for connecting with other microservices such as Spring Cloud, Kubernetes, gRPC, etc.

## Triple: The new protocol based on HTTP/2

* Compatible with gRPC

* Multi-language friendly: You can use Protobuf to encode business data

* Support for streams such as Request Stream, Response Stream, and Bidirectional Stream.

## Cloud-Native 

* Deployment of Dubbo 3.x Applications in Kubernetes, VM, and Container.

## Package distribution

* Dubbo 3.x only includes the core dependency package and now the user has to include each optional dependency.

Example

```xml
<properties>
    <dubbo.version>3.0.0</dubbo.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>${dubbo.version}</version>
    </dependency>

    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-registry-redis</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
</dependencies>
```

## Removed dependencies

* org.eclipse.collections:eclipse-collections 

* com.google.guava:guava

## Dependency changes

* Upgrade to Jetty 9.4.43.v20210629

*  Upgrade to Apollo Client 1.8.0

*  Upgrade to Snakeyaml 1.29

*  Upgrade to Tomcat Embed 8.5.69

*  Upgrade to Nacos Client 2.0.2

*  Upgrade to Swagger 1.5.24
