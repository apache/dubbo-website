---
aliases:
    - /zh/overview/quickstart/java/spring-boot/
description: 本文将基于 Dubbo Samples 示例演示如何通过 Dubbo x Spring Boot 快速开发微服务应用。
linkTitle: Dubbo Spring Boot Starter 开发微服务应用
title: 2 - Dubbo Spring Boot Starter 开发微服务应用
type: docs
weight: 3
---



## 目标

从零上手开发基于 Dubbo x Spring Boot 的微服务开发，了解 Dubbo x Spring Boot 配置方式。

## 难度

低

## 环境要求

- 系统：Windows、Linux、MacOS

- JDK 8 及以上（推荐使用 JDK17）

- Git

- IntelliJ IDEA（可选）

- Docker （可选）

## 项目介绍

在本任务中，将分为 3 个子模块进行独立开发，模拟生产环境下的部署架构。

```
.  // apache/dubbo-samples/1-basic/dubbo-samples-spring-boot
├── dubbo-samples-spring-boot-interface       // 共享 API 模块
├── dubbo-samples-spring-boot-consumer        // 消费端模块
└── dubbo-samples-spring-boot-provider        // 服务端模块
```

如上所示，共有 3 个模块，其中 `interface` 模块被 `consumer` 和 `provider` 两个模块共同依赖，存储 RPC 通信使用的 API 接口。

```
.  // apache/dubbo-samples/1-basic/dubbo-samples-spring-boot
├── dubbo-samples-spring-boot-interface       // 共享 API 模块
│   ├── pom.xml
│   └── src
│       └── main
│           └── java
│               └── org
│                   └── apache
│                       └── dubbo
│                           └── springboot
│                               └── demo
│                                   └── DemoService.java // API 接口
├── dubbo-samples-spring-boot-consumer        // 消费端模块
│   ├── pom.xml
│   └── src
│       ├── main
│       │   ├── java
│       │   │   └── org
│       │   │       └── apache
│       │   │           └── dubbo
│       │   │               └── springboot
│       │   │                   └── demo
│       │   │                       └── consumer
│       │   │                           ├── ConsumerApplication.java // 消费端启动类
│       │   │                           └── Task.java                // 消费端模拟调用任务
│       │   └── resources
│       │       └── application.yml       // Spring Boot 配置文件
├── dubbo-samples-spring-boot-provider        // 服务端模块
│   ├── pom.xml
│   └── src
│       └── main
│           ├── java
│           │   └── org
│           │       └── apache
│           │           └── dubbo
│           │               └── springboot
│           │                   └── demo
│           │                       └── provider
│           │                           ├── DemoServiceImpl.java         // 服务端实现类
│           │                           └── ProviderApplication.java     // 服务端启动类
│           └── resources
│               └── application.yml       // Spring Boot 配置文件
└── pom.xml
```

如上为本教程接下来会使用到的项目的文件结构。

## 快速部署（基于 Samples 直接启动）

本章将通过几个简单的命令，一步一步教你如何部署并运行一个基于 Dubbo x Spring Boot 的用例。

注：本章部署的代码细节可以在 [apache/dubbo-samples](https://github.com/apache/dubbo-samples) 这个仓库中 `1-basic/dubbo-samples-spring-boot` 中找到，在下一章中也将展开进行讲解。

### 1. 获取测试工程

在开始整个教程之前，我们需要先获取测试工程的代码。Dubbo 的所有测试用例代码都存储在 [apache/dubbo-samples](https://github.com/apache/dubbo-samples) 这个仓库中，以下这个命令可以帮你获取 Samples 仓库的所有代码。

```bash
git clone --depth=1 --branch master git@github.com:apache/dubbo-samples.git  
```

### 2. 启动一个简易的注册中心

对于一个微服务化的应用来说，注册中心是不可或缺的一个组件。只有通过注册中心，消费端才可以成功发现服务端的地址信息，进而进行调用。

为了让本教程更易于上手，我们提供了一个基于 Apache Zookeeper 注册中心的简易启动器，如果您需要在生产环境部署注册中心，请参考[生产环境初始化](/)一文部署高可用的注册中心。

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl tools/embedded-zookeeper

Linux / MacOS:
./mvnw clean compile exec:java -pl tools/embedded-zookeeper

Docker:
docker run --name some-zookeeper -p 2181:2181 --restart always -d zookeeper
```

### 3. 本地打包 API 模块

为了成功编译服务端、消费端模块，需要先在本地打包安装 `dubbo-samples-spring-boot-interface` 模块。

```bash
./mvnw clean install -pl 1-basic/dubbo-samples-spring-boot
./mvnw clean install -pl 1-basic/dubbo-samples-spring-boot/dubbo-samples-spring-boot-interface
```

### 4. 启动服务提供者

在启动了注册中心之后，下一步是启动一个对外提供服务的服务提供者。在 dubbo-samples 中也提供了对应的示例，可以通过以下命令快速拉起。

```bash
Windows:  
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-spring-boot/dubbo-samples-spring-boot-provider -Dexec.mainClass="org.apache.dubbo.springboot.demo.provider.ProviderApplication"  

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-spring-boot/dubbo-samples-spring-boot-provider -Dexec.mainClass="org.apache.dubbo.springboot.demo.provider.ProviderApplication"  

注：需要开一个独立的 terminal 运行，命令将会保持一直执行的状态。  
```

在执行完上述命令以后，等待一会出现如下所示的日志（`Current Spring Boot Application is await`）即代表服务提供者启动完毕，标志着该服务提供者可以对外提供服务了。

```log
2023-02-08 17:13:00.357  INFO 80600 --- [lication.main()] o.a.d.c.d.DefaultApplicationDeployer     :  [DUBBO] Dubbo Application[1.1](dubbo-springboot-demo-provider) is ready., dubbo version: 3.2.0-beta.4, current host: 30.221.128.96
2023-02-08 17:13:00.369  INFO 80600 --- [lication.main()] o.a.d.s.d.provider.ProviderApplication   : Started ProviderApplication in 9.114 seconds (JVM running for 26.522)
2023-02-08 17:13:00.387  INFO 80600 --- [pool-1-thread-1] .b.c.e.AwaitingNonWebApplicationListener :  [Dubbo] Current Spring Boot Application is await...
```

### 5. 启动服务消费者

最后一步是启动一个服务消费者来调用服务提供者，也即是 RPC 调用的核心，为服务消费者提供调用服务提供者的桥梁。

```bash
Windows:  
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-spring-boot/dubbo-samples-spring-boot-consumer -Dexec.mainClass="org.apache.dubbo.springboot.demo.consumer.ConsumerApplication"

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-spring-boot/dubbo-samples-spring-boot-consumer -Dexec.mainClass="org.apache.dubbo.springboot.demo.consumer.ConsumerApplication"
```

在执行完上述命令以后，等待一会出现如下所示的日志（`Hello world`），打印出的数据就是服务提供者处理之后返回的，标志着一次服务调用的成功。

```log
2023-02-08 17:14:33.045  INFO 80740 --- [lication.main()] o.a.d.s.d.consumer.ConsumerApplication   : Started ConsumerApplication in 11.052 seconds (JVM running for 31.62)
Receive result ======> Hello world
2023-02-08 17:14:33.146  INFO 80740 --- [pool-1-thread-1] .b.c.e.AwaitingNonWebApplicationListener :  [Dubbo] Current Spring Boot Application is await...
Wed Feb 08 17:14:34 CST 2023 Receive result ======> Hello world
Wed Feb 08 17:14:35 CST 2023 Receive result ======> Hello world
Wed Feb 08 17:14:36 CST 2023 Receive result ======> Hello world
Wed Feb 08 17:14:37 CST 2023 Receive result ======> Hello world
```

## 动手实践（从零代码开发版）

本章将通过手把手的教程一步一步教你如何从零开发一个微服务应用。

### 1. 启动注册中心

对于一个微服务化的应用来说，注册中心是不可或缺的一个组件。只有通过注册中心，消费端才可以成功发现服务端的地址信息，进而进行调用。

为了让本教程更易于上手，我们提供了一个基于 Apache Zookeeper 注册中心的简易启动器，如果您需要在生产环境部署注册中心，请参考[生产环境初始化](/)一文部署高可用的注册中心。

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
docker run --name some-zookeeper -p 2181:2181 --restart always -d zookeeper
```

### 2. 初始化项目

从本小节开始，将基于 IntelliJ IDEA 进行工程的搭建以及测试。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-25-27-image.png)

如上图所示，可以建立一个基础的项目。

搭建了基础项目之后，我们还需要创建 `dubbo-spring-boot-demo-interface` 、`dubbo-spring-boot-demo-provider` 和 `dubbo-spring-boot-demo-consumer` 三个子模块。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-27-17-image.png)

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-26-57-image.png)

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-27-45-image.png)

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-28-26-image.png)

创建了三个子模块之后，需要创建一下几个文件夹：

1. 在 `dubbo-spring-boot-demo-consumer/src/main/java` 下创建 `org.apache.dubbo.springboot.demo.consumer` package

2. 在 `dubbo-spring-boot-demo-interface/src/main/java` 下创建 `org.apache.dubbo.springboot.demo` package

3. 在 `dubbo-spring-boot-demo-provider/src/main/java` 下创建 `org.apache.dubbo.springboot.demo.provider`  package

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-32-50-image.png)

最终的文件夹参考如上图所示。

### 3. 添加 Maven 依赖

在初始化完项目以后，我们需要先添加 Dubbo 相关的 maven 依赖。

对于多模块项目，首先需要在父项目的 `pom.xml` 里面配置依赖信息。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-53-18-image.png)

编辑 `./pom.xml` 这个文件，添加下列配置。

```xml
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-demo</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>dubbo-spring-boot-demo-interface</module>
        <module>dubbo-spring-boot-demo-provider</module>
        <module>dubbo-spring-boot-demo-consumer</module>
    </modules>

    <properties>
        <dubbo.version>3.2.0-beta.4</dubbo.version>
        <spring-boot.version>2.7.8</spring-boot.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Dubbo -->
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-bom</artifactId>
                <version>${dubbo.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
                <version>${dubbo.version}</version>
                <type>pom</type>
            </dependency>
        </dependencies>
    </dependencyManagement>


    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <version>${spring-boot.version}</version>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
```

然后在 `dubbo-spring-boot-consumer` 和 `dubbo-spring-boot-provider` 两个模块 `pom.xml` 中进行具体依赖的配置。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-52-53-image.png)

编辑 `./dubbo-spring-boot-consumer/pom.xml` 和 `./dubbo-spring-boot-provider/pom.xml` 这两文件，都添加下列配置。

```xml
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-demo-interface</artifactId>
            <version>${project.parent.version}</version>
        </dependency>

        <!-- dubbo -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
            <type>pom</type>
            <exclusions>
                <exclusion>
                    <artifactId>slf4j-reload4j</artifactId>
                    <groupId>org.slf4j</groupId>
                </exclusion>
            </exclusions>
        </dependency>

        <!-- spring boot starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

    </dependencies>
```

在这份配置中，定义了 dubbo 和 zookeeper（以及对应的连接器 curator）的依赖。

添加了上述的配置以后，可以通过 IDEA 的 `Maven - Reload All Maven Projects` 刷新依赖。

### 4. 定义服务接口

服务接口 Dubbo 中沟通消费端和服务端的桥梁。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-57-29-image.png)

在 `dubbo-spring-boot-demo-interface` 模块的 `org.apache.dubbo.samples.api` 下建立 `DemoService` 接口，定义如下：

```java
package org.apache.dubbo.springboot.demo;

public interface DemoService {

    String sayHello(String name);
}
```

在 `DemoService` 中，定义了 `sayHello` 这个方法。后续服务端发布的服务，消费端订阅的服务都是围绕着 `DemoService` 接口展开的。

### 5. 定义服务端的实现

定义了服务接口之后，可以在服务端这一侧定义对应的实现，这部分的实现相对于消费端来说是远端的实现，本地没有相关的信息。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-17-59-46-image.png)

在`dubbo-spring-boot-demo-provider` 模块的 `org.apache.dubbo.samples.provider` 下建立 `DemoServiceImpl` 类，定义如下：

```java
package org.apache.dubbo.springboot.demo.provider;

import org.apache.dubbo.config.annotation.DubboService;
import org.apache.dubbo.springboot.demo.DemoService;

@DubboService
public class DemoServiceImpl implements DemoService {

    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

在 `DemoServiceImpl` 中，实现了 `DemoService` 接口，对于 `sayHello` 方法返回 `Hello name`。

注：在`DemoServiceImpl` 类中添加了 `@DubboService` 注解，通过这个配置可以基于 Spring Boot 去发布 Dubbo 服务。

### 6. 配置服务端 Yaml 配置文件

从本步骤开始至第 7 步，将会通过 Spring Boot 的方式配置 Dubbo 的一些基础信息。

首先，我们先创建服务端的配置文件。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-18-00-24-image.png)

在 `dubbo-spring-boot-demo-provider` 模块的 `resources` 资源文件夹下建立 `application.yml` 文件，定义如下：

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: dubbo
    port: -1
  registry:
    address: zookeeper://${zookeeper.address:127.0.0.1}:2181
```

在这个配置文件中，定义了 Dubbo 的应用名、Dubbo 协议信息、Dubbo 使用的注册中心地址。

### 7. 配置消费端 YAML 配置文件

同样的，我们需要创建消费端的配置文件。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-18-01-03-image.png)

在 `dubbo-spring-boot-demo-consumer` 模块的 `resources` 资源文件夹下建立 `application.yml` 文件，定义如下：

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-consumer
  protocol:
    name: dubbo
    port: -1
  registry:
    address: zookeeper://${zookeeper.address:127.0.0.1}:2181
```

在这个配置文件中，定义了 Dubbo 的应用名、Dubbo 协议信息、Dubbo 使用的注册中心地址。

### 8. 基于 Spring 配置服务端启动类

除了配置 Yaml 配置文件之外，我们还需要创建基于 Spring Boot 的启动类。

首先，我们先创建服务端的启动类。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-18-01-38-image.png)

在 `dubbo-spring-boot-demo-provider` 模块的 `org.apache.dubbo.springboot.demo.provider` 下建立 `Application` 类，定义如下：

```java
package org.apache.dubbo.springboot.demo.provider;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProviderApplication.class, args);
    }
}
```

在这个启动类中，配置了一个 `ProviderApplication` 去读取我们前面第 6 步中定义的 `application.yml` 配置文件并启动应用。

### 9. 基于 Spring 配置消费端启动类

同样的，我们需要创建消费端的启动类。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-18-02-11-image.png)

在 `dubbo-spring-boot-demo-consumer` 模块的 `org.apache.dubbo.springboot.demo.consumer` 下建立 `Application` 类，定义如下：

```java
package org.apache.dubbo.springboot.demo.consumer;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableDubbo
public class ConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConsumerApplication.class, args);
    }
}
```

在这个启动类中，配置了一个 `ConsumerApplication` 去读取我们前面第 7 步中定义的 `application.yml` 配置文件并启动应用。

### 10. 配置消费端请求任务

除了配置消费端的启动类，我们在 Spring Boot 模式下还可以基于 `CommandLineRunner`去创建

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-18-02-33-image.png)

在 `dubbo-spring-boot-demo-consumer` 模块的 `org.apache.dubbo.springboot.demo.consumer` 下建立 `Task` 类，定义如下：

```java
package org.apache.dubbo.springboot.demo.consumer;

import java.util.Date;

import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.springboot.demo.DemoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class Task implements CommandLineRunner {
    @DubboReference
    private DemoService demoService;

    @Override
    public void run(String... args) throws Exception {
        String result = demoService.sayHello("world");
        System.out.println("Receive result ======> " + result);

        new Thread(()-> {
            while (true) {
                try {
                    Thread.sleep(1000);
                    System.out.println(new Date() + " Receive result ======> " + demoService.sayHello("world"));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    Thread.currentThread().interrupt();
                }
            }
        }).start();
    }
}
```

在 `Task` 类中，通过`@DubboReference` 从 Dubbo 获取了一个 RPC 订阅，这个 `demoService` 可以像本地调用一样直接调用。在 `run`方法中创建了一个线程进行调用。

### 11. 启动应用

截止第 10 步，代码就已经开发完成了，本小节将启动整个项目并进行验证。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-18-03-59-image.png)

首先是启动 `org.apache.dubbo.samples.provider.Application` ，等待一会出现如下图所示的日志（`Current Spring Boot Application is await`）即代表服务提供者启动完毕，标志着该服务提供者可以对外提供服务了。

```log
[Dubbo] Current Spring Boot Application is await...
```

然后是启动`org.apache.dubbo.samples.client.Application` ，等待一会出现如下图所示的日志（`Hello world` ）即代表服务消费端启动完毕并调用到服务端成功获取结果。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-18-05-02-image.png)

```log
Receive result ======> Hello world
```

## 延伸阅读

### 1. Dubbo 的 Spring 配置介绍

Dubbo 的主要配置入口有 yaml 的配置内容、`@DubboReference` 和`@DubboService` 等，更多的细节可以参考 [Annotation 配置 | Apache Dubbo](/zh-cn/overview/mannual/java-sdk/reference-manual/config/annotation/) 一文。

## 更多

本教程介绍了如何基于 Dubbo x Spring Boot 开发一个微服务应用。在下一节中，将介绍[另外一种 Dubbo 的配置方式 —— Dubbo x Spring XML](../spring-xml/)。
