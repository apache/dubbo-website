---
aliases:
    - /zh/docs3-v2/java-sdk/quick-start/brief/
    - /zh-cn/docs3-v2/java-sdk/quick-start/brief/
description: 本文将基于 Dubbo Samples 示例演示如何快速搭建并部署一个微服务应用。
linkTitle: 快速部署一个微服务应用
title: 1 - 零基础快速部署一个微服务应用
type: docs
weight: 1
---






## 背景

![arch-service-discovery](/imgs/architecture.png)

Dubbo 作为一款微服务框架，最重要的是向用户提供跨进程的 RPC 远程调用能力。如上图所示，Dubbo 的服务消费者（Consumer）通过一系列的工作将请求发送给服务提供者（Provider）。

为了实现这样一个目标，Dubbo 引入了注册中心（Registry）组件，通过注册中心，服务消费者可以感知到服务提供者的连接方式，从而将请求发送给正确的服务提供者。

## 目标

了解微服务调用的方式以及 Dubbo 的能力

## 难度

低

## 环境要求

- 系统：Windows、Linux、MacOS

- JDK 8 及以上（推荐使用 JDK17）

- Git

- Docker （可选）

## 动手实践

本章将通过几个简单的命令，一步一步教你如何部署并运行一个最简单的 Dubbo 用例。

### 1. 获取测试工程

在开始整个教程之前，我们需要先获取测试工程的代码。Dubbo 的所有测试用例代码都存储在 [apache/dubbo-samples](https://github.com/apache/dubbo-samples) 这个仓库中，以下这个命令可以帮你获取 Samples 仓库的所有代码。

```bash
git clone --depth=1 --branch master git@github.com:apache/dubbo-samples.git
```

### 2. 认识 Dubbo Samples 项目结构

在将 [apache/dubbo-samples](https://github.com/apache/dubbo-samples) 这个仓库 clone 到本地以后，本小节将就仓库的具体组织方式做说明。

```
.
├── codestyle        // 开发使用的 style 配置文件

├── 1-basic          // 基础的入门用例
├── 2-advanced       // 高级用法
├── 3-extensions     // 扩展使用示例
├── 4-governance     // 服务治理用例
├── 10-task          // Dubbo 学习系列示例

├── 99-integration   // 集成测试使用
├── test             // 集成测试使用
└── tools            // 三方组件快速启动工具
```

如上表所示，[apache/dubbo-samples](https://github.com/apache/dubbo-samples) 主要由三个部分组成：代码风格文件、测试代码、集成测试。

1. 代码风格文件是开发 Dubbo 代码的时候可以使用，其中包括了 IntelliJ IDEA 的配置文件。

2. 测试代码即本教材所需要的核心内容。目前包括了 5 个部分的内容：面向初学者的 basic 入门用例、面向开发人员的 advanced 高级用法、面向中间件维护者的 extensions Dubbo 周边扩展使用示例、面向生产的 governance 服务治理用例以及 Dubbo 学习系列。本文将基于 basic 入门用例中最简单的 Dubbo API 使用方式进行讲解。

3. 集成测试是 Dubbo 的质量保证体系中重要的一环，Dubbo 的每个版本都会对所有的 samples 进行回归验证，保证 Dubbo 的所有变更都不会影响 samples 的使用。

### 3. 启动一个简易的注册中心

从这一小节开始，将正式通过三个命令部署一个微服务应用。

从 [背景](#背景) 一节中可知，运行起 Dubbo 应用的一个大前提是部署一个注册中心，为了让本教程更易于上手，我们提供了一个基于 Apache Zookeeper 注册中心的简易启动器，如果您需要在生产环境部署注册中心，请参考[生产环境初始化](/)一文部署高可用的注册中心。

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl tools/embedded-zookeeper

Linux / MacOS:
./mvnw clean compile exec:java -pl tools/embedded-zookeeper

注：需要开一个独立的 terminal 运行，命令将会保持一直执行的状态。

Docker:
docker run --name some-zookeeper  -p 2181:2181 --restart always -d zookeeper
```

在执行完上述命令以后，等待一会出现如下图所示的日志即代表注册中心启动完毕，可以继续执行后续任务。

![registry](/imgs/docs3-v2/java-sdk/quickstart/2023-01-19-15-55-23-image.png)

### 4. 启动服务提供者

在启动了注册中心之后，下一步是启动一个对外提供服务的服务提供者。在 dubbo-samples 中也提供了对应的示例，可以通过以下命令快速拉起。

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.provider.Application"

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.provider.Application"

注：需要开一个独立的 terminal 运行，命令将会保持一直执行的状态。
```

在执行完上述命令以后，等待一会出现如下图所示的日志（`DubboBootstrap awaiting`）即代表服务提供者启动完毕，标志着该服务提供者可以对外提供服务了。

![provider](/imgs/docs3-v2/java-sdk/quickstart/2023-01-19-15-56-09-image.png)

```log
[19/01/23 03:55:49:049 CST] org.apache.dubbo.samples.provider.Application.main()  INFO bootstrap.DubboBootstrap:  [DUBBO] DubboBootstrap awaiting ..., dubbo version: 3.2.0-beta.3, current host: 169.254.44.42
```

### 5. 启动服务消费者

最后一步是启动一个服务消费者来调用服务提供者，也即是 RPC 调用的核心，为服务消费者提供调用服务提供者的桥梁。

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.Application"

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.Application"
```

在执行完上述命令以后，等待一会出现如下图所示的日志（`hi, dubbo`），打印出的数据就是服务提供者处理之后返回的，标志着一次服务调用的成功。

![consumer](/imgs/docs3-v2/java-sdk/quickstart/2023-01-19-16-30-14-image.png)

```log
Receive result ======> hi, dubbo
```

## 延伸阅读

### 1. 消费端是怎么找到服务端的？

在本用例中的步骤 3 启动了一个 Zookeeper 的注册中心，服务提供者会向注册中心中写入自己的地址，供服务消费者获取。

Dubbo 会在 Zookeeper 的 `/dubbo/interfaceName`  和 `/services/appName` 下写入服务提供者的连接信息。

如下所示是 Zookeeper 上的数据示例：

```
[zk: localhost:2181(CONNECTED) 5] ls /dubbo/org.apache.dubbo.samples.api.GreetingsService/providers
[dubbo%3A%2F%2F30.221.146.35%3A20880%2Forg.apache.dubbo.samples.api.GreetingsService%3Fanyhost%3Dtrue%26application%3Dfirst-dubbo-provider%26background%3Dfalse%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26environment%3Dproduct%26generic%3Dfalse%26interface%3Dorg.apache.dubbo.samples.api.GreetingsService%26ipv6%3Dfd00%3A1%3A5%3A5200%3A3218%3A774a%3A4f67%3A2341%26methods%3DsayHi%26pid%3D85639%26release%3D3.1.4%26service-name-mapping%3Dtrue%26side%3Dprovider%26timestamp%3D1674960780647]

[zk: localhost:2181(CONNECTED) 2] ls /services/first-dubbo-provider
[30.221.146.35:20880]
[zk: localhost:2181(CONNECTED) 3] get /services/first-dubbo-provider/30.221.146.35:20880
{"name":"first-dubbo-provider","id":"30.221.146.35:20880","address":"30.221.146.35","port":20880,"sslPort":null,"payload":{"@class":"org.apache.dubbo.registry.zookeeper.ZookeeperInstance","id":"30.221.146.35:20880","name":"first-dubbo-provider","metadata":{"dubbo.endpoints":"[{\"port\":20880,\"protocol\":\"dubbo\"}]","dubbo.metadata-service.url-params":"{\"connections\":\"1\",\"version\":\"1.0.0\",\"dubbo\":\"2.0.2\",\"release\":\"3.1.4\",\"side\":\"provider\",\"ipv6\":\"fd00:1:5:5200:3218:774a:4f67:2341\",\"port\":\"20880\",\"protocol\":\"dubbo\"}","dubbo.metadata.revision":"871fbc9cb2730caea9b0d858852d5ede","dubbo.metadata.storage-type":"local","ipv6":"fd00:1:5:5200:3218:774a:4f67:2341","timestamp":"1674960780647"}},"registrationTimeUTC":1674960781893,"serviceType":"DYNAMIC","uriSpec":null}
```

更多关于 Dubbo 服务发现模型的细节，可以参考[服务发现](/zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/)一文。

### 2. 消费端是如何发起请求的？

在 Dubbo 的调用模型中，起到连接服务消费者和服务提供者的桥梁是接口。

服务提供者通过对指定接口进行实现，服务消费者通过 Dubbo 去订阅这个接口。服务消费者调用接口的过程中 Dubbo 会将请求封装成网络请求，然后发送到服务提供者进行实际的调用。

在本用例中，定义了一个 `GreetingsService`  的接口，这个接口有一个名为 `sayHi`  的方法。

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/api/GreetingsService.java

package org.apache.dubbo.samples.api;

public interface GreetingsService {

    String sayHi(String name);

}
```

服务消费者通过 Dubbo 的 API 可以获取这个 `GreetingsService` 接口的代理，然后就可以按照普通的接口调用方式进行调用。**得益于 Dubbo 的动态代理机制，这一切都像本地调用一样。**

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/client/Application.java

// 获取订阅到的 Stub
GreetingsService service = reference.get();
// 像普通的 java 接口一样调用
String message = service.sayHi("dubbo");
```

### 3. 服务端可以部署多个吗？

可以，本小节将演示如何启动一个服务端**集群**。

1）启动一个注册中心，可以参考动手实践中第 3 小节的[教程](#3-启动一个简易的注册中心)

2）修改服务提供者返回的数据，让第一个启动的服务提供者返回 `hi, dubbo. I am provider 1.`

修改 `1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java` 文件的第 25 行如下所示。

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java

package org.apache.dubbo.samples.provider;

import org.apache.dubbo.samples.api.GreetingsService;

public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi, " + name + ". I am provider 1.";
    }
}
```

3）启动第一个服务提供者，可以参考动手实践中第 4 小节的[教程](#4-启动服务提供者)

4）修改服务提供者返回的数据，让第二个启动的服务提供者返回 `hi, dubbo. I am provider 2.`

修改 `1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java` 文件的第 25 行如下所示。

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java

package org.apache.dubbo.samples.provider;

import org.apache.dubbo.samples.api.GreetingsService;

public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi, " + name + ". I am provider 2.";
    }
}
```

4）启动第二个服务提供者，可以参考动手实践中第 4 小节的[教程](#4-启动服务提供者)

5）启动服务消费者，可以参考动手实践中第 5 小节的[教程](#5-启动服务消费者)。多次启动消费者可以看到返回的结果是不一样的。

在 dubbo-samples 中也提供了一个会定时发起调用的消费端应用`org.apache.dubbo.samples.client.AlwaysApplication`，可以通过以下命令启动。

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.AlwaysApplication"

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.AlwaysApplication"
```

启动后可以看到类似以下的日志，消费端会随机调用到不同的服务提供者，返回的结果也是远端的服务提供者觉得其结果。

```
Sun Jan 29 11:23:37 CST 2023 Receive result ======> hi, dubbo. I am provider 1.
Sun Jan 29 11:23:38 CST 2023 Receive result ======> hi, dubbo. I am provider 2.
Sun Jan 29 11:23:39 CST 2023 Receive result ======> hi, dubbo. I am provider 2.
Sun Jan 29 11:23:40 CST 2023 Receive result ======> hi, dubbo. I am provider 1.
Sun Jan 29 11:23:41 CST 2023 Receive result ======> hi, dubbo. I am provider 1.
```

### 4. 这个用例复杂吗？

不，Dubbo 只需要简单的配置就可以实现稳定、高效的远程调用。

以下是一个服务提供者的简单示例，通过定义若干个配置就可以启动。

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/Application.java

// 定义所有的服务
ServiceConfig<GreetingsService> service = new ServiceConfig<>();
service.setInterface(GreetingsService.class);
service.setRef(new GreetingsServiceImpl());

// 启动 Dubbo
DubboBootstrap.getInstance()
        .application("first-dubbo-provider")
        .registry(new RegistryConfig(ZOOKEEPER_ADDRESS))
        .protocol(new ProtocolConfig("dubbo", -1))
        .service(service)
        .start();
```

以下是一个服务消费者的简单示例，通过定义若干个配置启动后就可以获取到对应的代理对象，之后用户完全不需要感知这个对象背后的复杂实现，**一切只需要和本地调用一样就行了**。

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/client/Application.java

// 定义所有的订阅
ReferenceConfig<GreetingsService> reference = new ReferenceConfig<>();
reference.setInterface(GreetingsService.class);

// 启动 Dubbo
DubboBootstrap.getInstance()
        .application("first-dubbo-consumer")
        .registry(new RegistryConfig(ZOOKEEPER_ADDRESS))
        .reference(reference)
        .start();

// 获取订阅到的 Stub
GreetingsService service = reference.get();
// 像普通的 java 接口一样调用
String message = service.sayHi("dubbo");
```

## 更多

本用例介绍了一个 RPC 远程调用的基础流程，通过启动注册中心、服务提供者、服务消费者三个节点来模拟一个微服务的部署架构。

下一个教程中，将就服务提供者和服务消费者分别都做了什么配置进行讲解，[从零告诉你如何搭建一个微服务应用](../api/)。
