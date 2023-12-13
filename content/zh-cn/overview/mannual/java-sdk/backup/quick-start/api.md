---
aliases:
    - /zh/docs3-v2/java-sdk/quick-start/api/
    - /zh-cn/docs3-v2/java-sdk/quick-start/api/
    - /zh/overview/quickstart/java/api/
    - /zh-cn/overview/quickstart/java/api/
description: 本文将基于 Dubbo Samples 示例演示如何通过 Dubbo API 快速开发微服务应用。
linkTitle: 基于 Dubbo API 开发微服务应用
title: 2 - 基于 Dubbo API 开发微服务应用
type: docs
weight: 2
---






## 目标

从零上手开发基于 Dubbo 的微服务

## 难度

低

## 环境要求

- 系统：Windows、Linux、MacOS

- JDK 8 及以上（推荐使用 JDK17）

- Git

- IntelliJ IDEA（可选）

- Docker （可选）

## 动手实践

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
docker run --name some-zookeeper --restart always -d zookeeper
```

### 2. 初始化项目

从本小节开始，将基于 IntelliJ IDEA 进行工程的搭建以及测试。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-10-50-33-image.png)

如上图所示，可以建立一个基础的项目。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-42-11-image.png)

在初始化完项目之后，需要在 `src/main/java` 目录下创建 `org.apache.dubbo.samples.api` 、`org.apache.dubbo.samples.client`  和 `org.apache.dubbo.samples.provider`  三个 package。

后续我们将在 `api`  下创建对应的接口，在 `client` 下创建对应客户端订阅服务的功能，在 `provider` 下创建对应服务端的实现以及发布服务的功能。

上述三个 package 分别对应了应用共同依赖的 api、消费端应用的模块、服务端应用的模块。在实际部署中需要拆成三个工程，消费端和服务的共同依赖 api 模块。从简单出发，本教程将在同一个工程中进行开发，区分多个启动类。

### 3. 添加 Maven 依赖

在初始化完项目以后，我们需要先添加 Dubbo 相关的 maven 依赖。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-10-51-06-image.png)

编辑 `pom.xml` 这个文件，添加下列配置。

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

在这份配置中，定义了 dubbo 和 zookeeper（以及对应的连接器 curator）的依赖。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-16-06-15-image.png)

添加了上述的配置以后，可以通过 IDEA 的 `Maven - Reload All Maven Projects` 刷新依赖。

### 4. 定义服务接口

服务接口 Dubbo 中沟通消费端和服务端的桥梁。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-42-43-image.png)

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

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-43-34-image.png)

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

### 6. 服务端发布服务

在实现了服务之后，本小节将通过 Dubbo 的 API 在网络上发布这个服务。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-44-22-image.png)

在 `org.apache.dubbo.samples.provider` 下建立 `Application` 类，定义如下：

```java
package org.apache.dubbo.samples.provider;

import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ServiceConfig;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.samples.api.GreetingsService;

public class Application {
    public static void main(String[] args) {
        // 定义具体的服务
        ServiceConfig<GreetingsService> service = new ServiceConfig<>();
        service.setInterface(GreetingsService.class);
        service.setRef(new GreetingsServiceImpl());

        // 启动 Dubbo
        DubboBootstrap.getInstance()
                .application("first-dubbo-provider")
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .protocol(new ProtocolConfig("dubbo", -1))
                .service(service)
                .start()
                .await();
    }
}
```

在 `org.apache.dubbo.samples.provider.Application` 中做了两部分的功能：首先是基于 `ServiceConfig` 定义了发布的服务信息，包括接口的信息以及对应的实现类对象；然后是配置 Dubbo 启动器，传入了应用名，注册中心地址，协议的信息以及服务的信息等。

注：DubboBootstrap 中的`registry` 、`protocol` 和 `service` 可以多次传入。

### 7. 消费端订阅并调用

对于消费端，可以通过 Dubbo 的 API 可以进行消费端订阅。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-55-09-image.png)

在 `org.apache.dubbo.samples.client` 下建立 `Application` 类，定义如下：

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

        DubboBootstrap.getInstance()
                .application("first-dubbo-consumer")
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .reference(reference);

        GreetingsService service = reference.get();
        String message = service.sayHi("dubbo");
        System.out.println("Receive result ======> " + message);
        System.in.read();
    }
}
```

在 `org.apache.dubbo.samples.client.Application` 中做了三部分的功能：

首先是基于 `ReferenceConfig` 定义了订阅的服务信息，包括接口的信息。

其次是配置 Dubbo 启动器，传入了应用名，注册中心地址，协议的信息以及服务的信息等。

最后是获取到动态代理的对象并进行调用。

注：DubboBootstrap 中支持 `service` 和 `reference` 可以同时传入，意味着一个应用可以同时即是消费端、也是服务端。

### 8. 启动应用

截止第 7 步，代码就已经开发完成了，本小节将启动整个项目并进行验证。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-52-26-image.png)

首先是启动 `org.apache.dubbo.samples.provider.Application` ，等待一会出现如下图所示的日志（`DubboBootstrap awaiting`）即代表服务提供者启动完毕，标志着该服务提供者可以对外提供服务了。

```log
[DUBBO] DubboBootstrap awaiting ..., dubbo version: 3.2.0-beta.4, current host: 169.254.44.42
```

然后是启动`org.apache.dubbo.samples.client.Application` ，等待一会出现如下图所示的日志（`hi, dubbo` ）即代表服务消费端启动完毕并调用到服务端成功获取结果。

![img](/imgs/docs3-v2/java-sdk/quickstart/2023-01-31-15-54-42-image.png)

```log
Receive result ======> hi, dubbo
```

## 延伸阅读

### 1. Dubbo 的配置介绍

Dubbo 的主要配置入口有`ReferenceConfig` 、`ServiceConfig` 和 `DubboBootstrap` ，更多的细节可以参考 [API 配置 | Apache Dubbo](/zh-cn/overview/mannual/java-sdk/reference-manual/config/api/) 一文。

### 2. 除了 API 方式其他的使用方式

Dubbo 除了 API 方式还支持 Spring XML、Annotation、Spring Boot 等配置方式，在下一个教程中将就 Spring Boot 配置方式讲解如何进行快速开发。

关于 XML 和 Annotation 的细节可以参考 [XML 配置 | Apache Dubbo](/zh-cn/overview/mannual/java-sdk/reference-manual/config/xml/)、[Annotation 配置 | Apache Dubbo](/zh-cn/overview/mannual/java-sdk/reference-manual/config/annotation/) 疑问。

## 更多

本教程介绍了如何基于 Dubbo 的纯 API 开发一个微服务应用。下一个教程中，将介绍[如何基于 Spring Boot 开发微服务项目](../spring-boot/)。