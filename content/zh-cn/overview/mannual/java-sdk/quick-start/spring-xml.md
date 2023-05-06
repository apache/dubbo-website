---
aliases:
    - /zh/docs3-v2/java-sdk/quick-start/spring-xml/
    - /zh-cn/docs3-v2/java-sdk/quick-start/spring-xml/
    - /zh/overview/quickstart/java/spring-xml/
    - /zh-cn/overview/quickstart/java/spring-xml/
description: 本文将基于 Dubbo Samples 示例演示如何通过 Dubbo x Spring XML 快速开发微服务应用。
linkTitle: 基于 Spring XML 开发微服务应用
title: 4 - 基于 Spring XML 开发微服务应用
type: docs
weight: 4
---






## 目标

从零上手开发基于 Dubbo x Spring XML 的微服务开发，了解 Dubbo x Spring XML 配置方式。

## 难度

低

## 环境要求

- 系统：Windows、Linux、MacOS

- JDK 8 及以上（推荐使用 JDK17）

- Git

- IntelliJ IDEA（可选）

- Docker （可选）

## 快速部署（基于 Samples 直接启动）

本章将通过几个简单的命令，一步一步教你如何部署并运行一个基于 Dubbo x Spring XML 的用例。  

注：本章部署的代码细节可以在 [apache/dubbo-samples](https://github.com/apache/dubbo-samples) 这个仓库中 `1-basic/dubbo-samples-spring-xml` 中找到，在下一章中也将展开进行讲解。

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

### 3. 启动服务提供者

在启动了注册中心之后，下一步是启动一个对外提供服务的服务提供者。在 dubbo-samples 中也提供了对应的示例，可以通过以下命令快速拉起。  

```bash
Windows:  
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-spring-xml -Dexec.mainClass="org.apache.dubbo.samples.provider.Application"  

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-spring-xml -Dexec.mainClass="org.apache.dubbo.samples.provider.Application"  

注：需要开一个独立的 terminal 运行，命令将会保持一直执行的状态。  
```

在执行完上述命令以后，等待一会出现如下所示的日志（`Dubbo Application[1.1](demo-provider) is ready.`）即代表服务提供者启动完毕，标志着该服务提供者可以对外提供服务了。  

```log
[08/02/23 03:26:52:052 CST] org.apache.dubbo.samples.provider.Application.main()  INFO metadata.ConfigurableMetadataServiceExporter:  [DUBBO] The MetadataService exports urls : [dubbo://30.221.128.96:20880/org.apache.dubbo.metadata.MetadataService?anyhost=true&application=demo-provider&background=false&bind.ip=30.221.128.96&bind.port=20880&connections=1&corethreads=2&delay=0&deprecated=false&dubbo=2.0.2&dynamic=true&executes=100&generic=false&getAndListenInstanceMetadata.1.callback=true&getAndListenInstanceMetadata.return=true&getAndListenInstanceMetadata.sent=true&group=demo-provider&interface=org.apache.dubbo.metadata.MetadataService&ipv6=fd00:1:5:5200:4d53:9f5:a545:804d&methods=exportInstanceMetadata,getAndListenInstanceMetadata,getExportedServiceURLs,getExportedURLs,getExportedURLs,getExportedURLs,getExportedURLs,getExportedURLs,getInstanceMetadataChangedListenerMap,getMetadataInfo,getMetadataInfos,getMetadataURL,getServiceDefinition,getServiceDefinition,getSubscribedURLs,isMetadataService,serviceName,toSortedStrings,toSortedStrings,version&pid=70803&register=false&release=3.1.6&revision=3.1.6&side=provider&threadpool=cached&threads=100&timestamp=1675841212727&version=1.0.0], dubbo version: 3.1.6, current host: 30.221.128.96
[08/02/23 03:26:52:052 CST] org.apache.dubbo.samples.provider.Application.main()  INFO metadata.ServiceInstanceMetadataUtils:  [DUBBO] Start registering instance address to registry., dubbo version: 3.1.6, current host: 30.221.128.96
[08/02/23 03:26:52:052 CST] org.apache.dubbo.samples.provider.Application.main()  INFO metadata.MetadataInfo:  [DUBBO] metadata revision changed: null -> 602d44cc6d653b9cd42ab23c3948b5ab, app: demo-provider, services: 1, dubbo version: 3.1.6, current host: 30.221.128.96
[08/02/23 03:26:52:052 CST] org.apache.dubbo.samples.provider.Application.main()  INFO deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](demo-provider) is ready., dubbo version: 3.1.6, current host: 30.221.128.96
```

### 4. 启动服务消费者

最后一步是启动一个服务消费者来调用服务提供者，也即是 RPC 调用的核心，为服务消费者提供调用服务提供者的桥梁。  

```bash
Windows:  
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-spring-xml -Dexec.mainClass="org.apache.dubbo.samples.client.Application"  

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-spring-xml -Dexec.mainClass="org.apache.dubbo.samples.client.Application"  
```

在执行完上述命令以后，等待一会出现如下所示的日志（`hi, dubbo`），打印出的数据就是服务提供者处理之后返回的，标志着一次服务调用的成功。  

```log
[08/02/23 03:28:23:023 CST] org.apache.dubbo.samples.client.Application.main()  INFO deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](demo-consumer) is ready., dubbo version: 3.1.6, current host: 30.221.128.96
Receive result ======> hi, dubbo
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

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-32-16-image.png)

如上图所示，可以建立一个基础的项目。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-33-20-image.png)

在初始化完项目之后，需要在 `src/main/java` 目录下创建 `org.apache.dubbo.samples.api` 、`org.apache.dubbo.samples.client`  和 `org.apache.dubbo.samples.provider`  三个 package。

后续我们将在 `api`  下创建对应的接口，在 `client` 下创建对应客户端订阅服务的功能，在 `provider` 下创建对应服务端的实现以及发布服务的功能。

上述三个 package 分别对应了应用共同依赖的 api、消费端应用的模块、服务端应用的模块。在实际部署中需要拆成三个工程，消费端和服务的共同依赖 api 模块。从简单出发，本教程将在同一个工程中进行开发，区分多个启动类。

### 3. 添加 Maven 依赖

在初始化完项目以后，我们需要先添加 Dubbo 相关的 maven 依赖。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-36-57-image.png)

编辑 `pom.xml` 这个文件，添加下列配置。

```xml
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
            <version>3.1.6</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.3.25</version>
        </dependency>

        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-x-discovery</artifactId>
            <version>5.2.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
            <version>3.8.0</version>
        </dependency>
    </dependencies>
```

在这份配置中，定义了 dubbo 和 zookeeper（以及对应的连接器 curator）的依赖。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-36-31-image.png)

添加了上述的配置以后，可以通过 IDEA 的 `Maven - Reload All Maven Projects` 刷新依赖。

### 4. 定义服务接口

服务接口 Dubbo 中沟通消费端和服务端的桥梁。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-37-31-image.png)

在 `org.apache.dubbo.samples.api` 下建立 `GreetingsService` 接口，定义如下：

```java
package org.apache.dubbo.samples.api;

public interface GreetingsService {

    String sayHi(String name);
}
```

在 `GreetingsService` 中，定义了 `sayHi` 这个方法。后续服务端发布的服务，消费端订阅的服务都是围绕着 `GreetingsService` 接口展开的。

### 5. 定义服务端的实现

定义了服务接口之后，可以在服务端这一侧定义对应的实现，这部分的实现相对于消费端来说是远端的实现，本地没有相关的信息。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-38-04-image.png)

在 `org.apache.dubbo.samples.provider` 下建立 `GreetingsServiceImpl` 类，定义如下：

```java
package org.apache.dubbo.samples.provider;

import org.apache.dubbo.samples.api.GreetingsService;

public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi, " + name;
    }
}
```

在 `GreetingsServiceImpl` 中，实现了 `GreetingsService` 接口，对于 `sayHi` 方法返回 `hi, name`。

### 6. 配置服务端 XML 配置文件

从本步骤开始至第 7 步，将会通过 Spring XML 的方式配置 Dubbo 服务的信息。

首先，我们先创建服务端的配置文件。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-40-07-image.png)

在 `resources` 资源文件夹下建立 `dubbo-demo-provider.xml` 文件，定义如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <!-- 定义应用名 -->
    <dubbo:application name="demo-provider"/>

    <!-- 定义注册中心地址 -->
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>

    <!-- 定义实现类对应的 bean -->
    <bean id="greetingsService" class="org.apache.dubbo.samples.provider.GreetingsServiceImpl"/>
    <!-- 定义服务信息，引用上面的 bean -->
    <dubbo:service interface="org.apache.dubbo.samples.api.GreetingsService" ref="greetingsService"/>

</beans>
```

在这个配置文件中，定义了 Dubbo 的应用名、Dubbo 使用的注册中心地址、发布服务的 spring bean 以及通过 Dubbo 去发布这个 bean。

### 7. 配置消费端 XML 配置文件

同样的，我们需要创建消费端的配置文件。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-40-59-image.png)

在 `resources` 资源文件夹下建立 `dubbo-demo-consumer.xml` 文件，定义如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <!-- 定义应用名 -->
    <dubbo:application name="demo-provider"/>

    <!-- 定义注册中心地址 -->
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>

    <!-- 定义订阅信息，Dubbo 会在 Spring Context 中创建对应的 bean -->
    <dubbo:reference id="greetingsService" interface="org.apache.dubbo.samples.api.GreetingsService"/>

</beans>
```

在这个配置文件中，定义了 Dubbo 的应用名、Dubbo 使用的注册中心地址、订阅的服务信息。

### 8. 基于 Spring 配置服务端启动类

除了配置 XML 配置文件之外，我们还需要创建基于 Spring Context 的启动类。

首先，我们先创建服务端的启动类。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-46-49-image.png)

在 `org.apache.dubbo.samples.provider` 下建立 `Application` 类，定义如下：

```java
package org.apache.dubbo.samples.provider;

import java.util.concurrent.CountDownLatch;

import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Application {

    public static void main(String[] args) throws InterruptedException {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("dubbo-demo-provider.xml");
        context.start();

        // 挂起主线程，防止退出
        new CountDownLatch(1).await();
    }
}
```

在这个启动类中，配置了一个 `ClassPathXmlApplicationContext` 去读取我们前面第 6 步中定义的 `dubbo-demo-provider.xml` 配置文件。

### 9. 基于 Spring 配置消费端启动类

同样的，我们需要创建消费端的启动类。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-15-48-26-image.png)

在 `org.apache.dubbo.samples.client` 下建立 `Application` 类，定义如下：

```java
package org.apache.dubbo.samples.client;

import java.io.IOException;

import org.apache.dubbo.samples.api.GreetingsService;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Application {
    public static void main(String[] args) throws IOException {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("dubbo-demo-consumer.xml");
        context.start();
        GreetingsService greetingsService = (GreetingsService) context.getBean("greetingsService");

        String message = greetingsService.sayHi("dubbo");
        System.out.println("Receive result ======> " + message);
        System.in.read();
        System.exit(0);
    }

}
```

在这个启动类中，主要执行了三个功能：

1. 配置了一个 `ClassPathXmlApplicationContext` 去读取我们前面第 7 步中定义的 `dubbo-demo-consumer.xml` 配置文件

2. 从 Spring Context 中获取名字为 `greetingsService` 的由 Dubbo 创建的 bean

3. 通过这个 bean 对远端发起调用

### 10. 启动应用

截止第 9 步，代码就已经开发完成了，本小节将启动整个项目并进行验证。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-16-01-29-image.png)

首先是启动 `org.apache.dubbo.samples.provider.Application` ，等待一会出现如下图所示的日志（`Dubbo Application[1.1](demo-provider) is ready`）即代表服务提供者启动完毕，标志着该服务提供者可以对外提供服务了。

```log
[DUBBO] Dubbo Application[1.1](demo-provider) is ready., dubbo version: 3.1.6, current host: 30.221.128.96
```

然后是启动`org.apache.dubbo.samples.client.Application` ，等待一会出现如下图所示的日志（`hi, dubbo` ）即代表服务消费端启动完毕并调用到服务端成功获取结果。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-02-08-16-02-50-image.png)

```log
Receive result ======> hi, dubbo
```

## 延伸阅读

### 1. Dubbo 的 XML 配置介绍

Dubbo 的主要配置入口有`dubbo:application` 、`dubbo:registry` 、 `dubbo:reference`  和 `dubbo:service` 等，更多的细节可以参考 [XML 配置 | Apache Dubbo](/zh-cn/overview/mannual/java-sdk/reference-manual/config/xml/) 一文。

## 更多

本教程介绍了如何基于 Dubbo x Spring XML 开发一个微服务应用。至此，Dubbo 基于 API、Spring Boot、Spring XML 三种主要的启动方式都已经介绍完毕。

在下一节中，将介绍[基于 Protobuf IDL 配置的微服务开发方式](../idl/)。