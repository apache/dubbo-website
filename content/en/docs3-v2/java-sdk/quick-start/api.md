---
type: docs
title: "2 - Develop microservice applications based on Dubbo API"
linkTitle: "Develop microservice applications based on Dubbo API"
weight: 2
description: "This article will demonstrate how to quickly develop microservice applications through Dubbo API based on Dubbo Samples."
---

## Target

Develop Dubbo-based microservices from scratch

## Difficulty

Low

## Environmental requirements

- System: Windows, Linux, MacOS

- JDK 8 and above (JDK17 is recommended)

- Git

- IntelliJ IDEA (optional)

- Docker (optional)

## Hands

This chapter will teach you how to develop a microservice application from scratch through step-by-step tutorials.

### 1. Start the registration center

For a microservice application, the registry is an indispensable component. Only through the registration center, the consumer can successfully discover the address information of the server, and then make a call.

To make this tutorial easier to use, we provide a simple starter based on the Apache Zookeeper registry. If you need to deploy the registry in a production environment, please refer to [Production Environment Initialization](/) to deploy a highly available registry.

```bash
Windows:
git clone --depth=1 --branch master git@github.com:apache/dubbo-samples.git
cd dubbo-samples
./mvnw.cmd clean compile exec:java -pl tools/embedded-zookeeper

Linux / MacOS:
git clone --depth=1 --branch master git@github.com:apache/dubbo-samples.git
cd dubbo-samples
./mvnw clean compile exec:java -pl tools/embedded-zookeeper

Docker:
docker run --name some-zookeeper --restart always -d zookeeper
```

### 2. Initialize the project

Starting from this section, the project will be built and tested based on IntelliJ IDEA.

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-10-50-33-image.png)

As shown above, a basic project can be built.

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-42-11-image.png)

After initializing the project, you need to create `org.apache.dubbo.samples.api`, `org.apache.dubbo.samples.client` and `org.apache.dubbo.samples` in the `src/main/java` directory .provider` three packages.



In the future, we will create the corresponding interface under `api`, create the corresponding client subscription service function under `client`, and create the corresponding server implementation and publish service function under `provider`.



The above three packages respectively correspond to the APIs that the application depends on, the modules of the consumer-side application, and the modules of the server-side application. In actual deployment, it needs to be split into three projects, and the common dependency of the consumer and the service is the api module. Starting from simplicity, this tutorial will be developed in the same project to distinguish between multiple startup classes.



### 3. Add Maven dependencies

After initializing the project, we need to add Dubbo-related maven dependencies first.

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-10-51-06-image.png)

Edit the `pom.xml` file and add the following configuration.

```xml
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
            <version>3.2.0-beta.4</version>
        </dependency>

        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-x-discovery</artifactId>
            <version>4.3.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
            <version>3.8.0</version>
            <exclusions>
                <exclusion>
                    <groupId>io.netty</groupId>
                    <artifactId>netty-handler</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>io.netty</groupId>
                    <artifactId>netty-transport-native-epoll</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>
```

In this configuration, the dependencies of dubbo and zookeeper (and the corresponding connector curator) are defined.

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-16-06-15-image.png)

After adding the above configuration, you can refresh dependencies through IDEA's `Maven - Reload All Maven Projects`.

### 4. Define service interface

The service interface is a bridge between the consumer and the server in Dubbo.

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-42-43-image.png)

Create `GreetingsService` interface under `org.apache.dubbo.samples.api`, defined as follows:

```java
package org.apache.dubbo.samples.api;

public interface GreetingsService {

    String sayHi(String name);
}
```

In `GreetingsService`, the `sayHi` method is defined. Subsequent services published by the server and services subscribed by the consumer are all developed around the `GreetingsService` interface.

### 5. Define the implementation of the server

After defining the service interface, you can define the corresponding implementation on the server side. Compared with the consumer side, this part of the implementation is a remote implementation, and there is no relevant information locally.

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-43-34-image.png)

Create `GreetingsServiceImpl` class under `org.apache.dubbo.samples.provider`, defined as follows:

```java
package org.apache.dubbo.samples.provider;

import org.apache.dubbo.samples.api.GreetingsService;

public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi," + name;
    }
}
```

In `GreetingsServiceImpl`, implement `GreetingsService` interface, return `hi, name` for `sayHi` method.



### 6. The server publishes the service



After implementing the service, this section will publish the service on the network through Dubbo's API.



![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-44-22-image.png)



Create `Application` class under `org.apache.dubbo.samples.provider`, defined as follows:



```java
package org.apache.dubbo.samples.provider;

import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ServiceConfig;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.samples.api.GreetingsService;

public class Application {
    public static void main(String[] args) {
        // define a specific service
        ServiceConfig<GreetingsService> service = new ServiceConfig<>();
        service.setInterface(GreetingsService.class);
        service.setRef(new GreetingsServiceImpl());

        // start Dubbo
        DubboBootstrap. getInstance()
                .application("first-dubbo-provider")
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .protocol(new ProtocolConfig("dubbo", -1))
                .service(service)
                .start()
                .await();
    }
}
```



In `org.apache.dubbo.samples.provider.Application`, there are two parts of functions: firstly, based on `ServiceConfig`, the published service information is defined, including interface information and corresponding implementation class objects; secondly, Dubbo is configured In the launcher, the application name, registration center address, protocol information, and service information are passed in.



Note: `registry`, `protocol` and `service` in DubboBootstrap can be passed in multiple times.



### 7. The consumer subscribes and calls



For the consumer side, you can subscribe to the consumer side through Dubbo's API.



![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-55-09-image.png)



Create `Application` class under `org.apache.dubbo.samples.client`, defined as follows:



```java
package org.apache.dubbo.samples.client;

import java.io.IOException;

import org.apache.dubbo.config.ReferenceConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.samples.api.GreetingsService;

public class Application {
    public static void main(String[] args) throws IOException {
        ReferenceConfig<GreetingsService> reference = new ReferenceConfig<>();
        reference.setInterface(GreetingsService.class);

        DubboBootstrap. getInstance()
                .application("first-dubbo-consumer")
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .reference(reference);

        GreetingsService service = reference. get();
        String message = service.sayHi("dubbo");
        System.out.println("Receive result ======> " + message);
        System.in.read();
    }
}
```



There are three functions in `org.apache.dubbo.samples.client.Application`:

The first is to define the subscribed service information based on `ReferenceConfig`, including interface information.

The second is to configure the Dubbo launcher, passing in the application name, registration center address, protocol information, and service information.

Finally, get the object of the dynamic proxy and call it.



Note: DubboBootstrap supports `service` and `reference` to be passed in at the same time, which means that an application can be both a consumer and a server at the same time.



### 8. Start the application



As of step 7, the code has been developed, and this section will start the entire project and verify it.



![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-52-26-image.png)



The first thing is to start `org.apache.dubbo.samples.provider.Application`, and wait for a while to see the log (`DubboBootstrap awaiting`) as shown in the figure below, which means that the service provider has started, indicating that the service provider can provide served.



``` log
[DUBBO] DubboBootstrap awaiting ..., dubbo version: 3.2.0-beta.4, current host: 169.254.44.42
```



Then start `org.apache.dubbo.samples.client.Application`, and wait for a while to see the log (`hi, dubbo`) as shown in the figure below, which means that the service consumer is started and the call to the server is successfully obtained.



![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-54-42-image.png)



``` log
Receive result ======> hi, dubbo
```



## Further reading



### 1. Dubbo configuration introduction



The main configuration entries of Dubbo are `ReferenceConfig`, `ServiceConfig` and `DubboBootstrap`. For more details, please refer to [API Configuration | Apache Dubbo](/en/docs3-v2/java-sdk/reference-manual/config/api /) article.



### 2. In addition to the API method, other usage methods



In addition to the API method, Dubbo also supports configuration methods such as Spring XML, Annotation, and Spring Boot. In the next tutorial, we will explain how to quickly develop with the Spring Boot configuration method.



For details about XML and Annotation, please refer to [XML configuration | Apache Dubbo](/en/docs3-v2/java-sdk/reference-manual/config/xml/), [Annotation configuration | Apache Dubbo](/en/docs3- v2/java-sdk/reference-manual/config/annotation/) doubt.





## More

This tutorial introduces how to develop a microservice application based on Dubbo's pure API. In the next tutorial, we will introduce how to develop microservice projects based on Spring Boot.
