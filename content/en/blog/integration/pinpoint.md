---
title: "Using Pinpoint for Distributed Tracing"
linkTitle: "Using Pinpoint for Distributed Tracing"
date: 2018-07-12
tags: ["Ecosystem", "Java"]
description: >
    This article introduces the use of Pinpoint for call chain tracing and performance monitoring of Dubbo distributed applications.
---

When using Dubbo for service-oriented or integrated applications, if a service's backend logs show an exception, and this service is called by multiple applications, it is often difficult to determine which application made the call and what the cause of the issue is. Thus, we need a distributed tracing system to quickly locate the problem, and Pinpoint can help us achieve this (of course, there are other solutions as well).

## What is Pinpoint

> Excerpt from [Pinpoint Learning Notes](https://skyao.gitbooks.io/learning-pinpoint/content/index.html)

[Pinpoint](https://github.com/naver/pinpoint) is an open-source APM (Application Performance Management) tool for large-scale distributed systems based on Java. Similar to Google Dapper, Pinpoint provides solutions by tracking calls between distributed applications to analyze the overall structure of the system and how its internal modules relate to each other.

> Note: In the original English, the term used for communication between modules is "transaction", but I believe if translated as "transaction" it may cause misunderstandings, so it is replaced by "interaction" or "call".

It aims to be simple and efficient in use:

* Install the agent without modifying even a single line of code
* Minimize performance loss

### ServerMap

Understand the system topology by visualizing the modules of the distributed system and their interconnections. Clicking on a node shows the module's details, such as its current status and request count.

### Realtime Active Thread Chart

Real-time monitoring of active threads within the application.

### Request/Response Scatter Chart

Long-term visualization of request counts and response patterns to locate potential issues. You can drag on the chart to select requests for more detailed information.

### CallStack

Generates code-level visuals for each call in a distributed environment, locating bottlenecks and failure points in a single view.

### Inspector

View additional details on the application, such as CPU usage, memory/garbage collection, TPS, and JVM parameters.

### Supported Modules

* JDK 6+
* Tomcat 6/7/8, Jetty 8/9, JBoss EAP 6, Resin 4, Websphere 6/7/8, Vertx 3.3/3.4/3.5
* Spring, Spring Boot (Embedded Tomcat, Jetty)
* Apache HTTP Client 3.x/4.x, JDK HttpConnector, GoogleHttpClient, OkHttpClient, NingAsyncHttpClient
* Thrift Client, Thrift Service, DUBBO PROVIDER, DUBBO CONSUMER
* ActiveMQ, RabbitMQ
* MySQL, Oracle, MSSQL, CUBRID, POSTGRESQL, MARIA
* Arcus, Memcached, Redis, CASSANDRA
* iBATIS, MyBatis
* DBCP, DBCP2, HIKARICP
* gson, Jackson, Json Lib
* log4j, Logback
* Custom modules

## Combining Pinpoint with Dubbo

### Starting Pinpoint

Refer to Pinpoint's [Quick start](https://pinpoint-apm.github.io/pinpoint/quickstart.html) to set up the environment (no need to start TestApp)

### Prepare Dubbo Sample Program

#### Create API Package

pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>demo-api</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</project>
```

Create API interface:
```
package com.example.demoapi;

public interface HelloService {
    String sayHello(String name);
}
```

#### Implement Dubbo Service Provider

pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.example</groupId>
	<artifactId>demo-provider</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>demo-provider</name>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.0.3.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<repositories>
		<repository>
			<id>sonatype-nexus-snapshots</id>
			<url>https://oss.sonatype.org/content/repositories/snapshots</url>
			<releases>
				<enabled>false</enabled>
			</releases>
			<snapshots>
				<enabled>true</enabled>
			</snapshots>
		</repository>
	</repositories>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter</artifactId>
		</dependency>
		<dependency>
			<groupId>com.alibaba.boot</groupId>
			<artifactId>dubbo-spring-boot-starter</artifactId>
			<version>0.2.0</version>
		</dependency>
		<dependency>
			<groupId>com.example</groupId>
			<artifactId>demo-api</artifactId>
			<version>0.0.1-SNAPSHOT</version>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

1. Implement the `HelloService` interface:
```java
package com.example.demoprovider.provider;

import com.alibaba.dubbo.config.annotation.Service;
import com.example.demoapi.HelloService;

@Service(version = "${demo.service.version}",
        application = "${dubbo.application.id}",
        protocol = "${dubbo.protocol.id}",
        registry = "${dubbo.registry.id}")
public class HelloServiceImpl implements HelloService {
    static int i = 0;
    @Override
    public String sayHello(String name) {
        i++;
        if (i % 3 == 0) {
            throw new RuntimeException("ex");
        }
        return "Hello " + name + "!";
    }
}
```

2. Write Spring Boot bootstrap program:
```java
package com.example.demoprovider;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoProviderApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoProviderApplication.class, args);
	}
}
```

3. Configure `application.properties`:

```properties
# Spring boot application
spring.application.name = dubbo-provider-demo
server.port = 9090
management.port = 9091

# Service version
demo.service.version = 1.0.0

# Base packages to scan Dubbo Components (e.g @Service, @Reference)
dubbo.scan.basePackages  = com.example.demoprovider

# Dubbo Config properties
## ApplicationConfig Bean
dubbo.application.id = dubbo-provider-demo
dubbo.application.name = dubbo-provider-demo

## ProtocolConfig Bean
dubbo.protocol.id = dubbo
dubbo.protocol.name = dubbo
dubbo.protocol.port = 12345

## RegistryConfig Bean
dubbo.registry.id = my-registry
dubbo.registry.address = N/A
```

#### Implement Dubbo Service Consumer

pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.example</groupId>
	<artifactId>demo-consumer</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>demo-consumer</name>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.0.3.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<repositories>
		<repository>
			<id>sonatype-nexus-snapshots</id>
			<url>https://oss.sonatype.org/content/repositories/snapshots</url>
			<releases>
				<enabled>false</enabled>
			</releases>
			<snapshots>
				<enabled>true</enabled>
			</snapshots>
		</repository>
	</repositories>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>com.alibaba.boot</groupId>
			<artifactId>dubbo-spring-boot-starter</artifactId>
			<version>0.2.0</version>
		</dependency>
		<dependency>
			<groupId>com.example</groupId>
			<artifactId>demo-api</artifactId>
			<version>0.0.1-SNAPSHOT</version>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<classifier>exec</classifier>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

1. Inject `HelloService` via `@Reference`
```java
package com.example.democonsumer.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.example.demoapi.HelloService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoConsumerController {
    @Reference(version = "${demo.service.version}",
            application = "${dubbo.application.id}",
            url = "dubbo://<Please fill in the specific IP>:12345")
    private HelloService helloService;

    @RequestMapping("/sayHello")
    public String sayHello(@RequestParam String name) {
        return helloService.sayHello(name);
    }
}
```
> Directly connecting to the provider requires filling in a specific IP address. You can also write localhost, but it will be additionally recognized by Pinpoint as an unknown service.

2. Write Spring Boot bootstrap for the web application:
```java
package com.example.democonsumer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoConsumerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoConsumerApplication.class, args);
	}
}
```

3. Configure `application.properties`:
```properties
# Spring boot application
spring.application.name=dubbo-consumer-demo
server.port=8080
management.port=8081

# Service Version
demo.service.version=1.0.0

# Dubbo Config properties
## ApplicationConfig Bean
dubbo.application.id=dubbo-consumer-demo
dubbo.application.name=dubbo-consumer-demo

## ProtocolConfig Bean
dubbo.protocol.id=dubbo
dubbo.protocol.name=dubbo
dubbo.protocol.port=12345
```

### Start Service Provider and Consumer with Pinpoint-agent

#### Start Service Provider

1. Compile and package
```
mvn clean package
```

2. Start the service provider with additional parameters
```
java -jar -javaagent:$AGENT_PATH/pinpoint-bootstrap-$VERSION.jar -Dpinpoint.agentId=demo-provider -Dpinpoint.applicationName=DP target/demo-provider-0.0.1-SNAPSHOT.jar
```

3. Start the service consumer with additional parameters
```
java -jar -javaagent:$AGENT_PATH/pinpoint-bootstrap-$VERSION.jar -Dpinpoint.agentId=demo-consumer -Dpinpoint.applicationName=DC target/demo-consumer-0.0.1-SNAPSHOT-exec.jar
```

4. Access the consumer address to simulate user requests

`http://localhost:8080/sayHello?name=ABC`

## Using Pinpoint to Quickly Locate Problems

### Homepage

![/admin-guide/images/pinpoint-home.png](/imgs/blog/pinpoint-home.png)

> The user request here is double that of DubboProvider due to the recorded favicon.ico icon request.

### Call Tree

![/admin-guide/images/pinpoint-calltree.png](/imgs/blog/pinpoint-calltree.png)

### Deep Trace

![/admin-guide/images/pinpoint-mixedview.png](/imgs/blog/pinpoint-mixedview.png)

### Others

The example simply simulates the provision and calling of Dubbo, without applications such as databases or other middleware. For detailed usage, please refer to the Pinpoint documentation.

