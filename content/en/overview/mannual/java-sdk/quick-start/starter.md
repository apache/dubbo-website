---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config/overview/
    - /en/docs3-v2/java-sdk/reference-manual/config/overview/
    - /en/overview/mannual/java-sdk/quick-start/spring-boot/
description: Create a Dubbo application based on Spring Boot.
linkTitle: Create a Dubbo application based on Spring Boot
title: Create a microservice application based on Spring Boot
type: docs
weight: 2
---

The following document will guide you in creating a Dubbo application based on Spring Boot from scratch, configuring microservice foundational capabilities such as the Triple communication protocol and service discovery.

## Quickly Create an Application
Create a Dubbo microservice application by accessing <a href="https://start.dubbo.apache.org" target="_blank">start.dubbo.apache.org</a>. Add components as shown in the image below, and you can quickly create a Dubbo application in seconds. Download and unzip the generated sample application.

<img style="max-width:800px;height:auto;margin-bottom:10px;" alt="Project Structure Screenshot" src="/imgs/v3/quickstart/start.jpg"/>

{{% alert title="Directly Use the Official Sample" color="info" %}}
You can also download the official pre-prepared sample project directly:

```shell
$ git clone -b main --depth 1 https://github.com/apache/dubbo-samples
$ cd dubbo-samples/11-quickstart
````
{{% /alert %}}

## Start the Application Locally
Next, let's try to start the application locally. Run the following command to start the application:

```shell
./mvnw
```

{{% alert title="Note" color="warning" %}}
Since the configuration file has enabled the registration center, to successfully start the application, you need to first start the <a href="/zh-cn/overview/reference/integrations/nacos/" target="_blank_">Nacos</a> or <a href="/zh-cn/overview/reference/integrations/zookeeper/" target="_blank_">Zookeeper</a> registration center server locally.
{{% /alert %}}

After the application starts successfully, the local process publishes the service using the <a href="/zh-cn/overview/reference/protocols/triple/" target="_blank_">Triple </a> protocol on the specified port, and you can directly use cURL to test whether the service is running normally:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/com.example.demo.dubbo.api.DemoService/sayHello/
```

In addition to using the command line, we can also start the project in the IDE, modify the example, or debug locally.

## Source Code Analysis
Import the prepared sample project into your favorite IDE development tool (taking IntelliJ IDEA as an example), the project structure is as follows:

<img style="max-width:400px;height:auto;" alt="Project Structure Screenshot" src="/imgs/v3/quickstart/samples.jpg"/>

### Maven Dependencies
Open pom.xml, and you can see the core dependencies related to Dubbo in the sample project as follows:

```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-bom</artifactId>
                <version>3.3.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-zookeeper-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
```

Among them, `dubbo-spring-boot-starter` and `dubbo-zookeeper-spring-boot-starter` introduce the dependencies related to the Dubbo kernel framework and Zookeeper client respectively. More content can be viewed in the [list of Spring Boot Starters supported by Dubbo]().

### Service Definition

The following is the standard Dubbo service definition based on a Java Interface.

```java
public interface DemoService {
    String sayHello(String name);
}
```

In `DemoService`, the method `sayHello` is defined. Subsequent services published by the server and services subscribed by the consumer revolve around the `DemoService` interface.

### Service Implementation

After defining the service interface, you can define the corresponding business logic implementation on the server side.

```java
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

In the `DemoServiceImpl` class, the `@DubboService` annotation is added, and this configuration allows the Dubbo service to be published based on Spring Boot.

### Initiating Service Calls
The sample application contains a consumer package simulating a remote call to the provider service.

```java
@Component
public class Consumer implements CommandLineRunner {
    @DubboReference
    private DemoService demoService;

    @Override
    public void run(String... args) throws Exception {
        String result = demoService.sayHello("world");
        System.out.println("Receive result ======> " + result);
    }
}
```

In the `Task` class, a RPC subscription is obtained from Dubbo via `@DubboReference`, and this `demoService` can be called as if it were a local call: `demoService.sayHello("world")`.

{{% alert title="Tip" color="primary" %}}
Typically, remote calls are inter-process. To facilitate development, the sample project has directly embedded a `@DubboReference` call. If you want to learn how to develop an independent Consumer (client) process for initiating remote calls to Dubbo services, we have a <a target="_blank" href="https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot">sample project with independent consumer and provider modules</a> for reference.
{{% /alert %}}

### Application Entry and Configuration File

Since we created a Spring Boot application, Dubbo-related configuration information is stored in the `application.yml` configuration file. Based on the following configuration, the Dubbo process will listen for triple protocol requests on port 50051, while the instance's ip:port information will be registered to the Zookeeper server.

```yaml
# application.yml
dubbo:
  application:
    name: dubbo-demo
  protocol:
    name: tri
    port: 50051
  registry:
    address: zookeeper://${zookeeper.address:127.0.0.1}:2181
```

Here is the entry point for the entire application, and the `@EnableDubbo` annotation is used to load and start Dubbo-related components.

```java
@SpringBootApplication
@EnableDubbo
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

## Publish Service Definitions to Remote Repository

After completing the application development, we need to publish the service definitions to an externally public or organization-internal Maven repository, so that applications that call these services can load and use them.

As we saw earlier, the sample project includes two modules, api and service. Switch to the api directory, and the following command will complete the publishing action:

```shell
mvn clean deploy
```

## More Content
- Next, you can [quickly deploy Dubbo applications to microservice clusters]()
- Dubbo has built-in capabilities such as service discovery, load balancing, and traffic control rules. Learn [how to configure more service governance capabilities]()

